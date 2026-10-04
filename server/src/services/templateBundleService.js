/**
 * templateBundleService.js — Bulk ZIP export / import for contract templates.
 *
 * Bundle layout produced by export (and accepted by import):
 *
 *   contract-templates-YYYY-MM-DD.zip
 *   ├── manifest.json
 *   ├── README.txt
 *   ├── 001-france-passeport-talent-residency-visa/
 *   │   ├── template.json   ← settings, rules, signing parties, intake form
 *   │   ├── template.html   ← raw HTML (HTML-engine templates only)
 *   │   └── styles.css      ← CSS (HTML-engine templates only)
 *   └── 002-.../
 *
 * Import ALSO accepts "plain" ZIPs without template.json — every .html file
 * becomes a new HTML template, paired with a CSS file from the same folder
 * (same base name → styles.css → the only .css in the folder → root styles.css).
 */
const JSZip = require('jszip');
const htmlTemplateService = require('./htmlTemplateService');

const BUNDLE_FORMAT = 'contractos-template-bundle';
const BUNDLE_VERSION = 1;
const MAX_TEMPLATES_PER_IMPORT = 300;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseJson(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function slugify(str, max = 60) {
  return String(str || 'template')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max) || 'template';
}

function stripBom(text) {
  return typeof text === 'string' ? text.replace(/^\uFEFF/, '') : text;
}

function dirname(p) {
  const idx = p.lastIndexOf('/');
  return idx === -1 ? '' : p.slice(0, idx);
}

function basename(p) {
  const idx = p.lastIndexOf('/');
  return idx === -1 ? p : p.slice(idx + 1);
}

function stripExt(name) {
  const idx = name.lastIndexOf('.');
  return idx === -1 ? name : name.slice(0, idx);
}

function joinPath(dir, file) {
  return dir ? `${dir}/${file}` : file;
}

function isJunkPath(p) {
  return p.startsWith('__MACOSX/') || p.includes('/__MACOSX/') || basename(p).startsWith('._') || basename(p) === '.DS_Store';
}

function humanizeFileName(name) {
  return stripExt(name)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Re-run the HTML pipeline so edited HTML in a bundle gets fresh
 * page counts, detected variables and normalized logo/asset URLs.
 */
function buildHtmlSchema({ html, css, name, logoUrl, baseSchema = {} }) {
  const meta = htmlTemplateService.extractTemplateMetadata(html);
  const { html: normHtml, css: normCss } = htmlTemplateService.normalizeTemplateAssets(html, css || '', logoUrl);
  const title = (name && name.trim()) || meta.title || baseSchema.title || 'Imported HTML/CSS Template';

  return {
    schema: {
      ...baseSchema,
      type: 'HTML',
      title,
      templateCode: meta.templateCode || baseSchema.templateCode,
      rawHtml: normHtml,
      customCss: normCss,
      pageCount: meta.pageCount,
      detectedVariables: meta.detectedVariables,
      dataFields: meta.dataFields,
      blocks: Array.isArray(baseSchema.blocks) ? baseSchema.blocks : [],
    },
    title,
  };
}

// ─── EXPORT ───────────────────────────────────────────────────────────────────

/**
 * @param {Array<object>} rows  contract_templates rows joined with form columns
 *                              (form_name, form_description, form_schema)
 * @param {object} meta         { locationId, exportedBy }
 * @returns {Promise<Buffer>}
 */
async function buildExportZip(rows, meta = {}) {
  const zip = new JSZip();
  const manifestEntries = [];
  const usedFolders = new Set();

  rows.forEach((row, index) => {
    const documentSchema = parseJson(row.document_schema_json, { blocks: [] }) || { blocks: [] };
    const isHtml = Boolean(documentSchema.rawHtml);

    let folder = `${String(index + 1).padStart(3, '0')}-${slugify(row.name)}`;
    while (usedFolders.has(folder)) folder += '-x';
    usedFolders.add(folder);

    const schemaForJson = { ...documentSchema };
    const files = ['template.json'];

    if (isHtml) {
      delete schemaForJson.rawHtml;
      delete schemaForJson.customCss;
      schemaForJson.htmlFile = 'template.html';
      schemaForJson.cssFile = 'styles.css';
      zip.file(`${folder}/template.html`, documentSchema.rawHtml || '');
      zip.file(`${folder}/styles.css`, documentSchema.customCss || '');
      files.push('template.html', 'styles.css');
    }

    const formSchema = parseJson(row.form_schema, null);
    const templateJson = {
      format: BUNDLE_FORMAT,
      formatVersion: BUNDLE_VERSION,
      name: row.name,
      contractType: row.contract_type,
      validityDays: row.validity_days,
      isActive: Boolean(row.is_active),
      currentVersion: row.current_version,
      engine: isHtml ? 'HTML' : 'BLOCKS',
      documentSchema: schemaForJson,
      conditionalRules: parseJson(row.conditional_rules_json, []),
      creationRules: parseJson(row.creation_rules_json, {}),
      signingParties: parseJson(row.signing_parties_json, []),
      form: row.form_name
        ? { name: row.form_name, description: row.form_description || '', schema: formSchema }
        : null,
      exportedFrom: { templateId: row.id, locationId: row.location_id },
    };

    zip.file(`${folder}/template.json`, JSON.stringify(templateJson, null, 2));
    manifestEntries.push({ folder, name: row.name, engine: templateJson.engine, files });
  });

  zip.file('manifest.json', JSON.stringify({
    format: BUNDLE_FORMAT,
    formatVersion: BUNDLE_VERSION,
    exportedAt: new Date().toISOString(),
    exportedBy: meta.exportedBy || null,
    sourceLocationId: meta.locationId || null,
    count: manifestEntries.length,
    templates: manifestEntries,
  }, null, 2));

  zip.file('README.txt', [
    'ContractOS Template Bundle',
    '==========================',
    '',
    'Each folder is one contract template:',
    '  template.json  - name, contract type, validity, signing parties, rules, intake form',
    '  template.html  - document HTML (HTML-engine templates)',
    '  styles.css     - document CSS  (HTML-engine templates)',
    '',
    'You can edit template.html / styles.css in bulk, re-zip, and use',
    'Templates > Import ZIP. Matching names can be overwritten (new version),',
    'skipped, or imported as copies.',
    '',
    'Plain ZIPs are also supported: any .html file (with a .css next to it)',
    'is imported as a new HTML template automatically.',
    '',
  ].join('\n'));

  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
}

// ─── IMPORT: parse ZIP into template payloads ─────────────────────────────────

/**
 * @param {Buffer} buffer
 * @param {object} opts { defaultContractType, logoUrl }
 * @returns {Promise<{ units: Array<object>, warnings: string[] }>}
 */
async function parseImportZip(buffer, opts = {}) {
  const zip = await JSZip.loadAsync(buffer);
  const warnings = [];

  const allPaths = Object.keys(zip.files).filter((p) => !zip.files[p].dir && !isJunkPath(p));
  const readText = async (p) => stripBom(await zip.file(p).async('string'));

  const units = [];
  const claimedDirs = new Set();

  // 1) Full bundle units (folders containing template.json)
  const jsonPaths = allPaths.filter((p) => basename(p).toLowerCase() === 'template.json');
  for (const jsonPath of jsonPaths) {
    const dir = dirname(jsonPath);
    claimedDirs.add(dir);
    try {
      const data = parseJson(await readText(jsonPath), null);
      if (!data || !data.name) {
        warnings.push(`${jsonPath}: missing "name", skipped.`);
        continue;
      }

      let documentSchema = { ...(data.documentSchema || { blocks: [] }) };
      const htmlFile = documentSchema.htmlFile || 'template.html';
      const cssFile = documentSchema.cssFile || 'styles.css';
      const htmlPath = joinPath(dir, htmlFile);
      const cssPath = joinPath(dir, cssFile);
      delete documentSchema.htmlFile;
      delete documentSchema.cssFile;

      if (zip.file(htmlPath)) {
        const html = await readText(htmlPath);
        const css = zip.file(cssPath) ? await readText(cssPath) : (documentSchema.customCss || '');
        documentSchema = buildHtmlSchema({
          html,
          css,
          name: data.name,
          logoUrl: opts.logoUrl,
          baseSchema: documentSchema,
        }).schema;
        documentSchema.title = data.name;
      } else if (data.engine === 'HTML' && !documentSchema.rawHtml) {
        warnings.push(`${data.name}: ${htmlFile} not found in bundle, skipped.`);
        continue;
      }

      units.push({
        source: jsonPath,
        name: String(data.name).trim(),
        contractType: data.contractType || opts.defaultContractType || 'Legal Services Agreement',
        validityDays: Number(data.validityDays) || 7,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
        documentSchema,
        conditionalRules: Array.isArray(data.conditionalRules) ? data.conditionalRules : [],
        creationRules: data.creationRules && typeof data.creationRules === 'object' ? data.creationRules : {},
        signingParties: Array.isArray(data.signingParties) && data.signingParties.length
          ? data.signingParties
          : [{ role: 'CLIENT', label: 'Primary Applicant / Client', required: true }],
        form: data.form && data.form.name ? data.form : null,
      });
    } catch (err) {
      warnings.push(`${jsonPath}: ${err.message}`);
    }
  }

  // 2) Plain HTML files outside bundle folders
  const isInsideClaimedDir = (p) => {
    const d = dirname(p);
    for (const cd of claimedDirs) {
      if (cd === '' ? d === '' : (d === cd || d.startsWith(`${cd}/`))) return true;
    }
    return false;
  };

  const cssPaths = allPaths.filter((p) => p.toLowerCase().endsWith('.css'));
  const htmlPaths = allPaths.filter((p) => /\.html?$/i.test(p) && !isInsideClaimedDir(p));

  for (const htmlPath of htmlPaths) {
    try {
      const dir = dirname(htmlPath);
      const base = stripExt(basename(htmlPath)).toLowerCase();
      const cssInDir = cssPaths.filter((c) => dirname(c) === dir);

      const cssPath =
        cssInDir.find((c) => stripExt(basename(c)).toLowerCase() === base) ||
        cssInDir.find((c) => basename(c).toLowerCase() === 'styles.css') ||
        cssInDir.find((c) => basename(c).toLowerCase() === 'style.css') ||
        (cssInDir.length === 1 ? cssInDir[0] : null) ||
        cssPaths.find((c) => c.toLowerCase() === 'styles.css') ||
        null;

      const html = await readText(htmlPath);
      if (!html.trim()) {
        warnings.push(`${htmlPath}: empty file, skipped.`);
        continue;
      }
      const css = cssPath ? await readText(cssPath) : '';
      if (!cssPath) warnings.push(`${htmlPath}: no CSS file found next to it, imported without CSS.`);

      // Name: <title> from HTML → folder name → file name
      const folderName = dir ? basename(dir) : '';
      const fallbackName = ['index', 'template', 'document'].includes(base) && folderName
        ? humanizeFileName(folderName)
        : humanizeFileName(basename(htmlPath));

      const meta = htmlTemplateService.extractTemplateMetadata(html);
      const name = (meta.title && meta.title.trim()) || fallbackName;
      const { schema } = buildHtmlSchema({ html, css, name, logoUrl: opts.logoUrl });

      units.push({
        source: htmlPath,
        name,
        contractType: opts.defaultContractType || 'Legal Services Agreement',
        validityDays: 7,
        isActive: true,
        documentSchema: schema,
        conditionalRules: [],
        creationRules: {},
        signingParties: [{ role: 'CLIENT', label: 'Primary Applicant / Client', required: true }],
        form: null,
      });
    } catch (err) {
      warnings.push(`${htmlPath}: ${err.message}`);
    }
  }

  if (units.length > MAX_TEMPLATES_PER_IMPORT) {
    warnings.push(`Bundle contains ${units.length} templates; only the first ${MAX_TEMPLATES_PER_IMPORT} were processed.`);
    units.length = MAX_TEMPLATES_PER_IMPORT;
  }

  return { units, warnings };
}

module.exports = {
  BUNDLE_FORMAT,
  BUNDLE_VERSION,
  parseJson,
  slugify,
  buildExportZip,
  parseImportZip,
};
