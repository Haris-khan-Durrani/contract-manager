/**
 * migrateSignaturesAndStamps.js
 * 
 * Ensures COMPANY_STAMP_URL and COMPANY_SIGNATURE_URL exist in system_settings,
 * seeds user_admin_001 with the official authorized signature,
 * and updates any existing contracts in MySQL so the agent signature and company stamp
 * are rendered immediately.
 */

const db = require('../config/db');
const { DEFAULT_COMPANY_STAMP, DEFAULT_COMPANY_SIGNATURE } = require('../constants/defaultAssets');
const htmlTemplateService = require('../services/htmlTemplateService');

async function run() {
  console.log('🔄 Running Stamp & Signature Migration...');

  // 1. Seed system_settings
  await db.execute(`
    INSERT INTO system_settings (setting_key, setting_value, description, is_secret, category)
    VALUES ('COMPANY_STAMP_URL', ?, 'Official company seal / stamp overlaid on all contracts', 0, 'branding')
    ON DUPLICATE KEY UPDATE 
      setting_value = IF(setting_value IS NULL OR setting_value = '', VALUES(setting_value), setting_value)
  `, [DEFAULT_COMPANY_STAMP]).catch(e => console.warn('Stamp setting notice:', e.message));

  await db.execute(`
    INSERT INTO system_settings (setting_key, setting_value, description, is_secret, category)
    VALUES ('COMPANY_SIGNATURE_URL', ?, 'Default authorized officer signature for contracts', 0, 'branding')
    ON DUPLICATE KEY UPDATE 
      setting_value = IF(setting_value IS NULL OR setting_value = '', VALUES(setting_value), setting_value)
  `, [DEFAULT_COMPANY_SIGNATURE]).catch(e => console.warn('Signature setting notice:', e.message));

  // 2. Seed app_user_access for user_admin_001 if null
  await db.execute(`
    UPDATE app_user_access
    SET signature_png_url = COALESCE(NULLIF(signature_png_url, ''), ?)
    WHERE ghl_user_id = 'user_admin_001' OR signature_png_url IS NULL
  `, [DEFAULT_COMPANY_SIGNATURE]).catch(e => console.warn('User signature update notice:', e.message));

  // 3. Update existing contract_instances with HTML templates
  const [instances] = await db.execute(`
    SELECT id, snapshot_json, template_id, location_id, assigned_user_id, form_response_json, form_data_json
    FROM contract_instances
    WHERE snapshot_json IS NOT NULL
  `);

  console.log(`Found ${instances.length} contract instances to check.`);

  for (const c of instances) {
    try {
      const snapshot = typeof c.snapshot_json === 'string' ? JSON.parse(c.snapshot_json) : c.snapshot_json;
      if (snapshot && snapshot.rawHtml) {
        snapshot.companySignature = snapshot.companySignature || DEFAULT_COMPANY_SIGNATURE;
        snapshot.companyStamp = snapshot.companyStamp || DEFAULT_COMPANY_STAMP;

        const formData = typeof c.form_response_json === 'string' ? JSON.parse(c.form_response_json || '{}') : (c.form_response_json || {});

        snapshot.rawHtml = htmlTemplateService.renderHtmlTemplate(snapshot.rawHtml, snapshot.customCss, {
          form: formData,
          clientSignature: snapshot.clientSignature || '',
          companySignature: snapshot.companySignature,
          companyStamp: snapshot.companyStamp,
        });

        await db.execute(
          'UPDATE contract_instances SET snapshot_json = ?, updated_at = NOW() WHERE id = ?',
          [JSON.stringify(snapshot), c.id]
        );
        console.log(`✓ Updated contract instance #${c.id} with company signature & stamp.`);
      }
    } catch (err) {
      console.warn(`Could not update contract #${c.id}:`, err.message);
    }
  }

  console.log('✅ Migration completed successfully!');
}

module.exports = { run };

if (require.main === module) {
  run().then(() => process.exit(0)).catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}
