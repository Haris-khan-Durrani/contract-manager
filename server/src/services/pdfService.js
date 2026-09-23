/**
 * pdfService.js — Playwright Chromium PDF Generator
 *
 * Pipeline:
 *   Frozen Snapshot
 *       ↓
 *   documentRenderer → full HTML string
 *       ↓
 *   Playwright Chromium headless
 *       ↓
 *   A4 PDF Buffer
 *       ↓
 *   SHA-256 checksum
 *
 * The Playwright browser instance is reused across requests (singleton pool)
 * to avoid the overhead of launching a new browser per PDF.
 */
const crypto           = require('crypto');
const documentRenderer = require('./documentRenderer');

let browser = null;

/**
 * Get or create the singleton Playwright browser instance.
 */
async function getBrowser() {
  if (browser) {
    try {
      // Check if browser is still alive
      const pages = await browser.pages().catch(() => null);
      if (pages !== null) return browser;
    } catch {
      browser = null;
    }
  }

  let playwright;
  try {
    playwright = require('playwright-core');
  } catch {
    throw new Error('playwright-core is not installed. Run: npm install playwright-core');
  }

  console.log('[PDF] Launching Chromium browser (system Chrome/Edge)…');
  const launchOptions = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--font-render-hinting=none',
    ],
  };

  try {
    browser = await playwright.chromium.launch({ ...launchOptions, channel: 'chrome' });
  } catch (errChrome) {
    try {
      browser = await playwright.chromium.launch({ ...launchOptions, channel: 'msedge' });
    } catch (errEdge) {
      browser = await playwright.chromium.launch(launchOptions);
    }
  }

  browser.on('disconnected', () => {
    console.warn('[PDF] Playwright browser disconnected — will relaunch on next request.');
    browser = null;
  });

  return browser;
}

/**
 * Generate a PDF from a raw HTML string.
 * @param {string} html    — complete HTML document
 * @returns {Promise<Buffer>} — PDF bytes
 */
async function htmlToPdf(html) {
  const br   = await getBrowser();
  const page = await br.newPage();

  try {
    await page.setContent(html, { waitUntil: 'networkidle' });

    const pdfBuffer = await page.pdf({
      format:             'A4',
      printBackground:    true,
      preferCSSPageSize:  false,
      margin: {
        top:    '0',
        right:  '0',
        bottom: '0',
        left:   '0',
      },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await page.close().catch(() => {});
  }
}

/**
 * Generate a PDF from a contract snapshot (pre-signing — no audit certificate).
 * Used for preview and the initial send/view.
 * @param {object} snapshot — frozen contract snapshot
 * @returns {Promise<{ buffer: Buffer, sha256: string }>}
 */
async function generatePreview(snapshot) {
  const html   = documentRenderer.renderDocument(snapshot, { includeAuditCertificate: false });
  const buffer = await htmlToPdf(html);
  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
  return { buffer, sha256 };
}

/**
 * Generate the final SIGNED PDF (includes audit certificate with signature data).
 * Called after client submits signature.
 * @param {object} snapshot      — snapshot augmented with signing result data
 * @returns {Promise<{ buffer: Buffer, sha256: string }>}
 */
async function generateSigned(snapshot) {
  const html   = documentRenderer.renderDocument(snapshot, { includeAuditCertificate: true });
  const buffer = await htmlToPdf(html);
  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
  return { buffer, sha256 };
}

/**
 * generateFromSnapshot — used by retryWorker when regenerating PDFs.
 * Automatically determines preview vs signed based on snapshot state.
 * @param {object} snapshot
 * @returns {Promise<Buffer>}
 */
async function generateFromSnapshot(snapshot) {
  const hasSignatures = (snapshot.signingPartiesResult || []).some(p => p.signedAt);
  const { buffer } = hasSignatures
    ? await generateSigned(snapshot)
    : await generatePreview(snapshot);
  return buffer;
}

/**
 * Close the browser (call on server shutdown for clean teardown).
 */
async function closeBrowser() {
  if (browser) {
    await browser.close().catch(() => {});
    browser = null;
  }
}

module.exports = { generatePreview, generateSigned, generateFromSnapshot, htmlToPdf, closeBrowser };
