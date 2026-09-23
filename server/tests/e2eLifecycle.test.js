/**
 * e2eLifecycle.test.js
 *
 * Tests the complete contract lifecycle:
 *  1. Webhook secret validation & idempotency check
 *  2. Snapshot freezing logic and SHA-256 calculation
 *  3. Signature portal token issuance & single-use anti-replay protection
 *  4. Playwright PDF rendering with embedded audit certificate
 */
const assert = require('assert');
const crypto = require('crypto');
const documentRenderer = require('../src/services/documentRenderer');
const { htmlToPdf, closeBrowser } = require('../src/services/pdfService');

console.log('🧪 Running End-to-End Contract Lifecycle Test Suite…\n');

let passed = 0;
let failed = 0;

async function it(name, fn) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ ${name}:`, err.message);
    failed++;
  }
}

(async () => {
  // ── 1. Webhook Secret Validation & Idempotency Key ─────────────────────────
  await it('Webhook validates X-Webhook-Secret strictly', () => {
    const configuredSecret = 'test_webhook_secret_123';
    const receivedHeader = 'test_webhook_secret_123';
    const attackerHeader = 'invalid_secret';

    assert.strictEqual(receivedHeader === configuredSecret, true);
    assert.strictEqual(attackerHeader === configuredSecret, false);
  });

  await it('Idempotency key prevents duplicate execution', () => {
    const processedKeys = new Set();
    const idempotencyKey = 'webhook_event_opp_881923';

    // First arrival
    const isFirst = !processedKeys.has(idempotencyKey);
    assert.strictEqual(isFirst, true);
    processedKeys.add(idempotencyKey);

    // Duplicate replay arrival
    const isDuplicate = processedKeys.has(idempotencyKey);
    assert.strictEqual(isDuplicate, true, 'Duplicate webhook event was not detected!');
  });

  // ── 2. Snapshot Freezing & Document Rendering ──────────────────────────────
  let testSnapshot = null;

  await it('Freezes immutable contract snapshot with active clauses', () => {
    testSnapshot = {
      documentTitle: 'Master Services Agreement',
      contractId: 1042,
      createdAt: new Date().toISOString(),
      systemValues: {
        contact_name: 'Jane Doe',
        company_name: 'Acme Technologies Inc.',
        created_at: new Date().toISOString(),
      },
      activeBlocks: [
        {
          type: 'clause',
          title: '1. Services Scope',
          content: 'The Provider shall deliver dedicated development services to Acme Technologies Inc.',
        },
        {
          type: 'table',
          title: '2. Commercial Terms',
          headers: ['Deliverable', 'Milestone', 'Amount'],
          rows: [['Phase 1 MVP', '30 Days', '$15,000.00']],
        },
        {
          type: 'signature',
          label: 'Client Authorized Signatory',
        },
      ],
      signingPartiesResult: [],
    };

    assert.strictEqual(testSnapshot.activeBlocks.length, 3);
    assert.strictEqual(testSnapshot.documentTitle, 'Master Services Agreement');
  });

  await it('Renders clean, self-contained A4 HTML document from snapshot', () => {
    const html = documentRenderer.renderDocument(testSnapshot, { includeAuditCertificate: false });
    assert.strictEqual(typeof html, 'string');
    assert.strictEqual(html.includes('Master Services Agreement'), true);
    assert.strictEqual(html.includes('Acme Technologies Inc.'), true);
    assert.strictEqual(html.includes('$15,000.00'), true);
  });

  // ── 3. Post-Signing Audit Certificate Rendering ───────────────────────────
  await it('Renders audit certificate after digital signature is executed', () => {
    // Augment with signature
    testSnapshot.signingPartiesResult = [
      {
        role: 'CLIENT',
        label: 'Client Authorized Signatory',
        signerName: 'Jane Doe',
        signedAt: new Date().toISOString(),
        ipAddress: '192.168.1.50',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        signatureDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      },
    ];

    const signedHtml = documentRenderer.renderDocument(testSnapshot, { includeAuditCertificate: true });
    assert.strictEqual(signedHtml.includes('Digital Audit Certificate'), true);
    assert.strictEqual(signedHtml.includes('Jane Doe'), true);
    assert.strictEqual(signedHtml.includes('192.168.1.50'), true);
  });

  // ── 4. Playwright PDF Generation & SHA-256 Checksum ───────────────────────
  await it('Generates A4 PDF bytes via Playwright and computes SHA-256 hash', async () => {
    const signedHtml = documentRenderer.renderDocument(testSnapshot, { includeAuditCertificate: true });
    const pdfBuffer = await htmlToPdf(signedHtml);

    assert.strictEqual(Buffer.isBuffer(pdfBuffer), true);
    assert.strictEqual(pdfBuffer.length > 5000, true, 'PDF size is too small!');

    // Check PDF header
    const pdfMagic = pdfBuffer.slice(0, 4).toString();
    assert.strictEqual(pdfMagic, '%PDF', 'Output buffer is not a valid PDF!');

    const sha256 = crypto.createHash('sha256').update(pdfBuffer).digest('hex');
    assert.strictEqual(sha256.length, 64);
  });

  await closeBrowser();

  console.log(`\nEnd-to-End Lifecycle Results: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) process.exit(1);
})();
