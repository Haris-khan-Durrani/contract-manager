const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const htmlService = require('../services/htmlTemplateService');

async function seed() {
  await db.init();
  const htmlPath = path.resolve(__dirname, 'templates/cyprus_business_residence.html');
  const cssPath = path.resolve(__dirname, 'templates/cyprus_business_residence.css');

  const html = fs.readFileSync(htmlPath, 'utf8');
  const css = fs.readFileSync(cssPath, 'utf8');

  const meta = htmlService.extractTemplateMetadata(html);
  const { html: normHtml, css: normCss } = htmlService.normalizeTemplateAssets(html, css);

  const docSchema = {
    type: 'HTML',
    title: meta.title,
    templateCode: meta.templateCode,
    rawHtml: normHtml,
    customCss: normCss,
    pageCount: meta.pageCount,
    detectedVariables: meta.detectedVariables,
    dataFields: meta.dataFields,
  };

  const locations = ['NJOPxsxylG8uIEPo9hX9', 'loc_default_001'];
  for (const loc of locations) {
    const [existing] = await db.execute(
      'SELECT id FROM contract_templates WHERE (name LIKE ? OR id = 4 OR id = 5) AND location_id = ? LIMIT 1',
      ['%Cyprus Business Residence Visa%', loc]
    );

    if (existing.length) {
      const tid = existing[0].id;
      console.log(`Updating template ${tid} for location ${loc}`);
      
      const [vRows] = await db.execute(
        'SELECT COALESCE(MAX(version_number), 0) AS max_v FROM contract_template_versions WHERE template_id = ?',
        [tid]
      );
      const nextVersion = (vRows[0]?.max_v || 1) + 1;

      await db.execute(
        `UPDATE contract_templates 
         SET name = ?, contract_type = 'Cyprus Business Residence Visa', current_version = ?, document_schema_json = ?, updated_at = NOW() 
         WHERE id = ?`,
        [meta.title, nextVersion, JSON.stringify(docSchema), tid]
      );
      await db.execute(
        `INSERT INTO contract_template_versions 
           (template_id, version_number, document_schema_json, change_summary, created_by)
         VALUES (?, ?, ?, 'Imported official 12-page Cyprus Business Residence Visa template (HTML/CSS)', 'user_admin_001')`,
        [tid, nextVersion, JSON.stringify(docSchema)]
      );
    } else {
      console.log(`Inserting new template for location ${loc}`);
      const [res] = await db.execute(
        `INSERT INTO contract_templates 
           (location_id, name, contract_type, current_version, is_active, validity_days, document_schema_json, signing_parties_json)
         VALUES (?, ?, 'Cyprus Business Residence Visa', 1, TRUE, 7, ?, '[]')`,
        [loc, meta.title, JSON.stringify(docSchema)]
      );
      await db.execute(
        `INSERT INTO contract_template_versions 
           (template_id, version_number, document_schema_json, change_summary, created_by)
         VALUES (?, 1, ?, 'Imported official 12-page Cyprus Business Residence Visa template (HTML/CSS)', 'user_admin_001')`,
        [res.insertId, JSON.stringify(docSchema)]
      );
    }
  }

  console.log('✅ Official Cyprus Business Residence Visa Template seeded successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
