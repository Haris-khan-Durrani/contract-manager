/**
 * seed.js — Database Seeding Script
 *
 * Seeds:
 *  1. Initial SUPER_ADMIN user in app_user_access
 *  2. Default Intake Form with 7 essential fields
 *  3. Default Master Services Agreement Template with active clauses & signature block
 *
 * Run: npm run seed
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
require('dotenv').config();
const mysql = require('mysql2/promise');

async function seed() {
  console.log('🌱 Seeding Contract Manager Database…\n');

  const connection = await mysql.createConnection({
    host:     process.env.DB_HOST     || '127.0.0.1',
    port:     parseInt(process.env.DB_PORT || '3306'),
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'contractmanager',
  });

  try {
    const locationId = process.env.INITIAL_LOCATION_ID || 'loc_default_001';
    const userId     = process.env.INITIAL_SUPER_ADMIN_USER_ID || 'user_superadmin_001';

    // 1. Seed Super Admin
    await connection.execute(
      `INSERT INTO app_user_access (location_id, ghl_user_id, app_role, enabled)
       VALUES (?, ?, 'SUPER_ADMIN', TRUE)
       ON DUPLICATE KEY UPDATE app_role = 'SUPER_ADMIN', enabled = TRUE`,
      [locationId, userId]
    );
    console.log(`✅ Super Admin seeded: Location ${locationId}, User ${userId}`);

    // 2. Seed Default Form
    const sampleFormSchema = {
      fields: [
        {
          id: 'field_client_name',
          key: 'client_name',
          label: 'Client Full Name',
          type: 'text',
          source: 'GHL_CONTACT',
          ghlFieldId: 'contact.name',
          contractVariable: 'client_name',
          required: true,
          placeholder: 'e.g. Jane Doe',
        },
        {
          id: 'field_client_email',
          key: 'client_email',
          label: 'Client Email',
          type: 'text',
          source: 'GHL_CONTACT',
          ghlFieldId: 'contact.email',
          contractVariable: 'client_email',
          required: true,
          placeholder: 'e.g. jane@acme.com',
        },
        {
          id: 'field_company_name',
          key: 'company_name',
          label: 'Company Name',
          type: 'text',
          source: 'GHL_CONTACT',
          ghlFieldId: 'contact.companyName',
          contractVariable: 'company_name',
          required: false,
          placeholder: 'e.g. Acme Technologies Inc.',
        },
        {
          id: 'field_contract_value',
          key: 'contract_value',
          label: 'Contract Total Value ($)',
          type: 'currency',
          source: 'USER_INPUT',
          ghlFieldId: '',
          contractVariable: 'contract_value',
          required: true,
          placeholder: '5000',
        },
        {
          id: 'field_payment_terms',
          key: 'payment_terms',
          label: 'Payment Schedule',
          type: 'dropdown',
          source: 'USER_INPUT',
          ghlFieldId: '',
          contractVariable: 'payment_terms',
          required: true,
          options: [
            { label: '100% Upfront Upon Signing', value: '100% Upfront' },
            { label: '50% Deposit / 50% On Delivery', value: '50/50 Milestone' },
            { label: 'Monthly Retainer Net 15', value: 'Monthly Net 15' },
          ],
        },
      ],
    };

    const [formResult] = await connection.execute(
      `INSERT INTO contract_forms (location_id, name, description, schema_json, created_by)
       VALUES (?, 'Standard Service Intake Form', 'Standard onboarding fields mapped to HighLevel contact data.', ?, ?)
       ON DUPLICATE KEY UPDATE updated_at = NOW()`,
      [locationId, JSON.stringify(sampleFormSchema), userId]
    );

    const formId = formResult.insertId || 1;
    console.log(`✅ Default Form seeded: ID #${formId}`);

    // 3. Seed Default Template
    const sampleDocSchema = {
      title: 'Master Services Agreement',
      blocks: [
        {
          id: 'block_1',
          type: 'clause',
          title: '1. Parties & Engagement',
          content: 'This Agreement is entered into between the Service Provider and {{client_name}} ("Client"), representing {{company_name}}. The Client engages Provider for dedicated services in accordance with the terms herein.',
        },
        {
          id: 'block_2',
          type: 'clause',
          title: '2. Commercial Terms & Compensation',
          content: 'The total compensation for the agreed services shall be {{contract_value}}, payable under the following schedule: {{payment_terms}}.',
        },
        {
          id: 'block_3',
          type: 'clause',
          title: '3. Intellectual Property & Confidentiality',
          content: 'All work product produced specifically for Client shall be owned by Client upon receipt of full payment. Both parties agree to protect proprietary information with standard commercial care.',
        },
        {
          id: 'block_4',
          type: 'signature',
          label: 'Client Authorized Representative Signature',
        },
      ],
    };

    const [templateResult] = await connection.execute(
      `INSERT INTO contract_templates
         (location_id, form_id, name, contract_type, current_version, is_active,
          validity_days, document_schema_json, conditional_rules_json,
          creation_rules_json, signing_parties_json)
       VALUES (?, ?, 'Standard Master Services Agreement (MSA)', 'Master Services Agreement', 1, TRUE, 7, ?, '[]', '{"enabled": false}', '[]')
       ON DUPLICATE KEY UPDATE updated_at = NOW()`,
      [locationId, formId, JSON.stringify(sampleDocSchema)]
    );

    const templateId = templateResult.insertId || 1;
    console.log(`✅ Default Template seeded: ID #${templateId}`);

    // ─── 4. Seed System Settings ─────────────────────────────────────────────
    console.log('🌱 Seeding System Settings…');
    const defaultSettings = [
      { key: 'GHL_SHARED_SECRET', value: process.env.GHL_SHARED_SECRET || 'development_shared_secret_for_testing', desc: 'GoHighLevel Marketplace App Shared Secret for JWT context verification', secret: true, cat: 'GHL' },
      { key: 'GHL_PRIVATE_INTEGRATION_TOKEN', value: process.env.GHL_PRIVATE_INTEGRATION_TOKEN || 'pit_dev_token_sample', desc: 'GHL Private Integration Token for backend API calls', secret: true, cat: 'GHL' },
      { key: 'GHL_WEBHOOK_SECRET', value: process.env.GHL_WEBHOOK_SECRET || 'webhook_secret_dev_123', desc: 'Authentication secret for incoming GHL Workflow webhooks', secret: true, cat: 'GHL' },
      { key: 'GHL_API_BASE_URL', value: 'https://services.leadconnectorhq.com', desc: 'LeadConnector / GoHighLevel API Base URL', secret: false, cat: 'GHL' },
      { key: 'GHL_API_VERSION', value: '2021-07-28', desc: 'GoHighLevel Version Header', secret: false, cat: 'GHL' },
      { key: 'SIGNING_BASE_URL', value: process.env.SIGNING_BASE_URL || 'http://localhost:5173', desc: 'Public portal base URL for signee contract links', secret: false, cat: 'APP' },
      { key: 'JWT_SECRET', value: 'contractmanager_secure_jwt_secret_dev', desc: 'JWT signing secret for user session tokens', secret: true, cat: 'SECURITY' },
      { key: 'JWT_EXPIRES_IN', value: '8h', desc: 'User session duration', secret: false, cat: 'SECURITY' },
      { key: 'GHL_FIELD_CACHE_TTL_MS', value: '900000', desc: 'Cache TTL for custom fields in milliseconds (default 15m)', secret: false, cat: 'PERFORMANCE' },
      { key: 'GHL_CONCURRENCY_LIMIT', value: '4', desc: 'Max concurrent requests to GHL API to prevent 429s', secret: false, cat: 'PERFORMANCE' },
      { key: 'EXPIRY_WORKER_CRON', value: '*/5 * * * *', desc: 'Background cron for auto-expiring overdue contracts', secret: false, cat: 'WORKERS' },
      { key: 'RETRY_WORKER_CRON', value: '*/2 * * * *', desc: 'Background cron for retrying failed PDF uploads', secret: false, cat: 'WORKERS' },
      { key: 'MAX_UPLOAD_RETRIES', value: '5', desc: 'Maximum retry attempts before flagging dead-letter', secret: false, cat: 'WORKERS' },
    ];

    for (const s of defaultSettings) {
      await connection.execute(
        `INSERT INTO system_settings (setting_key, setting_value, description, is_secret, category)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE description = VALUES(description), is_secret = VALUES(is_secret), category = VALUES(category)`,
        [s.key, s.value, s.desc, s.secret, s.cat]
      );
    }
    console.log(`✅ System settings initialized (${defaultSettings.length} keys in MySQL).`);

    console.log('\n🎉 Seeding complete! Database is ready.');
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
  } finally {
    await connection.end();
  }
}

seed();
