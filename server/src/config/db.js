/**
 * db.js — Universal Database Adapter (MySQL with automatic SQLite Fallback)
 *
 * Tries MySQL first. If MySQL is unreachable (ECONNREFUSED), automatically
 * activates a local SQLite database (server/data/contractmanager.sqlite)
 * with auto-migration and auto-seeding.
 */
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
require('dotenv').config();

let activeDb = null;
let dbDriver = 'UNKNOWN';

// Ensure data folder exists
const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const sqlitePath = path.join(dataDir, 'contractmanager.sqlite');

/**
 * SQLite Database Implementation
 */
class SQLiteAdapter {
  constructor(dbFilePath) {
    const sqlite3 = require('sqlite3').verbose();
    this.db = new sqlite3.Database(dbFilePath);
    this.initTablesAndSeed();
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ insertId: this.lastID, affectedRows: this.changes });
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }

  /**
   * Convert MySQL specific syntax to SQLite compatible syntax
   */
  translateSql(sql) {
    let s = sql;
    // Replace NOW() with CURRENT_TIMESTAMP
    s = s.replace(/NOW\(\)/gi, "datetime('now')");

    // Replace ON DUPLICATE KEY UPDATE for known tables
    if (/INSERT INTO app_user_access/i.test(s) && /ON DUPLICATE KEY UPDATE/i.test(s)) {
      s = s.replace(/ON DUPLICATE KEY UPDATE[\s\S]*/i, `
        ON CONFLICT(location_id, ghl_user_id) DO UPDATE SET
          app_role = excluded.app_role,
          enabled = excluded.enabled,
          updated_at = datetime('now')
      `);
    } else if (/INSERT INTO contract_template_versions/i.test(s) && /ON DUPLICATE KEY UPDATE/i.test(s)) {
      s = s.replace(/ON DUPLICATE KEY UPDATE[\s\S]*/i, `
        ON CONFLICT(template_id, version_number) DO UPDATE SET
          document_schema_json = excluded.document_schema_json,
          signing_parties_json = excluded.signing_parties_json,
          change_summary = excluded.change_summary
      `);
    } else if (/INSERT INTO system_settings/i.test(s) && /ON DUPLICATE KEY UPDATE/i.test(s)) {
      s = s.replace(/ON DUPLICATE KEY UPDATE[\s\S]*/i, `
        ON CONFLICT(setting_key) DO UPDATE SET
          setting_value = excluded.setting_value,
          description = COALESCE(excluded.description, system_settings.description),
          is_secret = COALESCE(excluded.is_secret, system_settings.is_secret),
          category = COALESCE(excluded.category, system_settings.category),
          updated_at = datetime('now')
      `);
    } else if (/INSERT INTO contract_forms/i.test(s) && /ON DUPLICATE KEY UPDATE/i.test(s)) {
      s = s.replace(/ON DUPLICATE KEY UPDATE[\s\S]*/i, `
        ON CONFLICT(id) DO UPDATE SET updated_at = datetime('now')
      `);
    } else if (/INSERT INTO contract_templates/i.test(s) && /ON DUPLICATE KEY UPDATE/i.test(s)) {
      s = s.replace(/ON DUPLICATE KEY UPDATE[\s\S]*/i, `
        ON CONFLICT(id) DO UPDATE SET updated_at = datetime('now')
      `);
    }

    return s;
  }

  async execute(sql, params = []) {
    const cleanSql = this.translateSql(sql).trim();
    const isSelect = cleanSql.toUpperCase().startsWith('SELECT') || cleanSql.toUpperCase().startsWith('PRAGMA');

    // Ensure parameters are sanitized (booleans converted to 1/0 for SQLite)
    const sanitizedParams = (params || []).map(p => {
      if (typeof p === 'boolean') return p ? 1 : 0;
      return p;
    });

    try {
      if (isSelect) {
        const rows = await this.all(cleanSql, sanitizedParams);
        return [rows, []];
      } else {
        const result = await this.run(cleanSql, sanitizedParams);
        return [result, []];
      }
    } catch (err) {
      // Re-throw with readable query
      throw new Error(`[SQLite Error] ${err.message} in query: ${cleanSql}`);
    }
  }

  async initTablesAndSeed() {
    try {
      await this.run(`
        CREATE TABLE IF NOT EXISTS app_user_access (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          location_id TEXT NOT NULL,
          ghl_user_id TEXT NOT NULL,
          app_role TEXT NOT NULL DEFAULT 'SALES',
          enabled INTEGER NOT NULL DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(location_id, ghl_user_id)
        );
      `);

      await this.run(`
        CREATE TABLE IF NOT EXISTS contract_forms (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          location_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          form_mode TEXT NOT NULL DEFAULT 'NORMAL',
          settings_json TEXT NULL,
          schema_json TEXT NOT NULL,
          created_by TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await this.run(`
        CREATE TABLE IF NOT EXISTS contract_templates (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          location_id TEXT NOT NULL,
          form_id INTEGER NULL,
          name TEXT NOT NULL,
          contract_type TEXT NOT NULL,
          current_version INTEGER NOT NULL DEFAULT 1,
          is_active INTEGER NOT NULL DEFAULT 1,
          validity_days INTEGER NOT NULL DEFAULT 7,
          document_schema_json TEXT NOT NULL,
          conditional_rules_json TEXT NULL,
          creation_rules_json TEXT NULL,
          signing_parties_json TEXT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await this.run(`
        CREATE TABLE IF NOT EXISTS contract_template_versions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          template_id INTEGER NOT NULL,
          version_number INTEGER NOT NULL,
          document_schema_json TEXT NOT NULL,
          form_schema_snapshot TEXT NULL,
          signing_parties_json TEXT NULL,
          change_summary TEXT NULL,
          created_by TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(template_id, version_number)
        );
      `);

      await this.run(`
        CREATE TABLE IF NOT EXISTS contract_instances (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          location_id TEXT NOT NULL,
          template_id INTEGER NOT NULL,
          template_version INTEGER NOT NULL,
          ghl_contact_id TEXT NOT NULL,
          ghl_opportunity_id TEXT NULL,
          assigned_user_id TEXT NOT NULL,
          created_by_user_id TEXT NOT NULL,
          creation_mode TEXT NOT NULL,
          form_mode TEXT NOT NULL DEFAULT 'NORMAL',
          state TEXT NOT NULL DEFAULT 'READY',
          public_state TEXT NOT NULL DEFAULT 'PENDING',
          recipient_name TEXT NULL,
          recipient_email TEXT NULL,
          recipient_phone TEXT NULL,
          form_response_json TEXT NULL,
          form_data_json TEXT NULL,
          snapshot_json TEXT NULL,
          signing_parties_json TEXT NULL,
          signing_config_json TEXT NULL,
          signing_token TEXT NULL UNIQUE,
          token_expires_at DATETIME NULL,
          client_opened_at DATETIME NULL,
          form_started_at DATETIME NULL,
          form_completed_at DATETIME NULL,
          contract_reviewed_at DATETIME NULL,
          viewed_at DATETIME NULL,
          signed_at DATETIME NULL,
          completed_at DATETIME NULL,
          revoked_at DATETIME NULL,
          pdf_sha256 TEXT NULL,
          ghl_file_url TEXT NULL,
          assigned_user_name TEXT NULL,
          upload_retry_count INTEGER NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Migration: add assigned_user_name to existing contract_instances tables
      await this.run(`
        ALTER TABLE contract_instances ADD COLUMN assigned_user_name TEXT NULL;
      `).catch(() => {}); // Silently ignore if column already exists

      await this.run(`
        CREATE TABLE IF NOT EXISTS webhook_idempotency_keys (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          idempotency_key TEXT NOT NULL UNIQUE,
          contract_instance_id INTEGER NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          expires_at DATETIME NOT NULL
        );
      `);

      await this.run(`
        CREATE TABLE IF NOT EXISTS contract_audit_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          contract_instance_id INTEGER NOT NULL,
          actor_type TEXT NOT NULL,
          actor_id TEXT NULL,
          actor_name TEXT NULL,
          action TEXT NOT NULL,
          from_state TEXT NULL,
          to_state TEXT NULL,
          ip_address TEXT NULL,
          user_agent TEXT NULL,
          metadata_json TEXT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await this.run(`
        CREATE TABLE IF NOT EXISTS system_settings (
          setting_key TEXT PRIMARY KEY,
          setting_value TEXT NULL,
          description TEXT NULL,
          is_secret INTEGER NOT NULL DEFAULT 0,
          category TEXT NOT NULL DEFAULT 'GENERAL',
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await this.run(`
        CREATE TABLE IF NOT EXISTS contract_form_submissions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          form_id INTEGER NOT NULL,
          location_id TEXT NOT NULL,
          data_json TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'COMPLETED',
          submitted_by TEXT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await this.run(`
        CREATE TABLE IF NOT EXISTS contract_signatures (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          contract_instance_id INTEGER NOT NULL,
          signer_name TEXT NULL,
          signer_email TEXT NULL,
          signed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          ip_address TEXT NULL,
          user_agent TEXT NULL,
          signature_method TEXT NOT NULL DEFAULT 'drawn',
          signature_data_b64 TEXT NULL,
          document_sha256 TEXT NULL,
          consent_accepted INTEGER NOT NULL DEFAULT 0,
          contract_version INTEGER NULL,
          template_version_at_sign INTEGER NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await this.run(`
        CREATE TABLE IF NOT EXISTS contract_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          contract_instance_id INTEGER NOT NULL,
          event_type TEXT NOT NULL,
          event_data_json TEXT NULL,
          actor_type TEXT NOT NULL DEFAULT 'SYSTEM',
          actor_label TEXT NULL,
          ip_address TEXT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Additive migrations for existing tables (safe on re-init)
      const alterStatements = [
        `ALTER TABLE contract_forms ADD COLUMN form_mode TEXT NOT NULL DEFAULT 'NORMAL'`,
        `ALTER TABLE contract_forms ADD COLUMN settings_json TEXT NULL`,
        `ALTER TABLE contract_instances ADD COLUMN form_mode TEXT NOT NULL DEFAULT 'NORMAL'`,
        `ALTER TABLE contract_instances ADD COLUMN public_state TEXT NOT NULL DEFAULT 'PENDING'`,
        `ALTER TABLE contract_instances ADD COLUMN recipient_name TEXT NULL`,
        `ALTER TABLE contract_instances ADD COLUMN recipient_email TEXT NULL`,
        `ALTER TABLE contract_instances ADD COLUMN recipient_phone TEXT NULL`,
        `ALTER TABLE contract_instances ADD COLUMN form_data_json TEXT NULL`,
        `ALTER TABLE contract_instances ADD COLUMN signing_config_json TEXT NULL`,
        `ALTER TABLE contract_instances ADD COLUMN client_opened_at DATETIME NULL`,
        `ALTER TABLE contract_instances ADD COLUMN form_started_at DATETIME NULL`,
        `ALTER TABLE contract_instances ADD COLUMN form_completed_at DATETIME NULL`,
        `ALTER TABLE contract_instances ADD COLUMN contract_reviewed_at DATETIME NULL`,
        `ALTER TABLE contract_instances ADD COLUMN completed_at DATETIME NULL`,
        `ALTER TABLE contract_instances ADD COLUMN revoked_at DATETIME NULL`,
      ];
      for (const stmt of alterStatements) {
        try { await this.run(stmt); } catch (e) { /* column already exists — skip */ }
      }

      // Check if data is already seeded
      const forms = await this.all('SELECT id FROM contract_forms LIMIT 1');
      if (!forms.length) {
        await this.seedDefaults();
      }
    } catch (err) {
      console.error('[SQLite Init] Error:', err.message);
    }
  }

  async seedDefaults() {
    console.log('🌱 [SQLite] Auto-seeding default templates and forms…');
    const locationId = 'loc_default_001';
    const userId = 'user_admin_001';

    // 1. Seed user access
    await this.run(
      `INSERT OR IGNORE INTO app_user_access (location_id, ghl_user_id, app_role, enabled)
       VALUES (?, ?, 'ADMIN', 1)`,
      [locationId, userId]
    );

    // 2. Seed default form
    const sampleFormSchema = {
      fields: [
        {
          id: 'field_client_name',
          key: 'client_name',
          label: 'Client Full Name / اسم العميل',
          type: 'text',
          source: 'GHL_CONTACT',
          ghlFieldId: 'contact.name',
          contractVariable: 'client_name',
          required: true,
          placeholder: 'e.g. John Doe / محمد علي',
        },
        {
          id: 'field_client_email',
          key: 'client_email',
          label: 'Client Email / البريد الإلكتروني',
          type: 'text',
          source: 'GHL_CONTACT',
          ghlFieldId: 'contact.email',
          contractVariable: 'client_email',
          required: true,
          placeholder: 'e.g. client@example.com',
        },
        {
          id: 'field_company_name',
          key: 'company_name',
          label: 'Company Name / اسم الشركة',
          type: 'text',
          source: 'GHL_CONTACT',
          ghlFieldId: 'contact.companyName',
          contractVariable: 'company_name',
          required: false,
          placeholder: 'e.g. Acme Corporation',
        },
        {
          id: 'field_contract_value',
          key: 'contract_value',
          label: 'Contract Total Value ($) / قيمة العقد',
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
          label: 'Payment Schedule / شروط الدفع',
          type: 'dropdown',
          source: 'USER_INPUT',
          ghlFieldId: '',
          contractVariable: 'payment_terms',
          required: true,
          options: [
            { label: '100% Upfront Upon Signing / دفع كامل مقدماً', value: '100% Upfront' },
            { label: '50% Deposit / 50% On Delivery / 50% دفعة أولى و50% عند التسليم', value: '50/50 Milestone' },
            { label: 'Monthly Retainer Net 15 / اشتراك شهري', value: 'Monthly Retainer' },
          ],
        },
      ],
    };

    const formRes = await this.run(
      `INSERT INTO contract_forms (location_id, name, description, schema_json, created_by)
       VALUES (?, 'Standard Client Intake Form', 'Default client onboarding fields with HighLevel contact mapping.', ?, ?)`,
      [locationId, JSON.stringify(sampleFormSchema), userId]
    );

    const formId = formRes.insertId || 1;

    // 3. Seed default bilingual template
    const sampleDocSchema = {
      title: 'Master Services Agreement / اتفاقية تقديم الخدمات الرئيسية',
      blocks: [
        {
          id: 'block_1',
          type: 'clause',
          bilingual: true,
          titleEn: '1. Parties & Engagement',
          titleAr: '١. الأطراف والتعاقد',
          contentEn: 'This Agreement is entered into between the Service Provider and {{client_name}} ("Client"), representing {{company_name}}. The Client engages Provider for dedicated services.',
          contentAr: 'تم إبرام هذه الاتفاقية بين مزود الخدمة و {{client_name}} ("العميل")، ممثلاً عن {{company_name}}. يوافق العميل على تفويض مزود الخدمة لتقديم الخدمات المتفق عليها.',
        },
        {
          id: 'block_2',
          type: 'clause',
          bilingual: true,
          titleEn: '2. Commercial Terms & Compensation',
          titleAr: '٢. الشروط التجارية والمقابل المالي',
          contentEn: 'The total compensation for the agreed services shall be {{contract_value}}, payable under the following schedule: {{payment_terms}}.',
          contentAr: 'يكون المقابل المالي الإجمالي للخدمات المتفق عليها بمبلغ {{contract_value}}، ويسدد وفقاً لجدول الدفع التالي: {{payment_terms}}.',
        },
        {
          id: 'block_3',
          type: 'clause',
          bilingual: true,
          titleEn: '3. Intellectual Property & Confidentiality',
          titleAr: '٣. الملكية الفكرية والسرية',
          contentEn: 'All work product produced specifically for Client shall be owned by Client upon receipt of full payment. Both parties agree to protect confidential information with standard commercial care.',
          contentAr: 'تؤول ملكية كافة مخرجات العمل المنجزة خصيصاً للعميل إلى العميل فور استلام كامل المستحقات. يتعهد الطرفان بحماية المعلومات السرية وفقاً للمعايير التجارية المعمول بها.',
        },
        {
          id: 'block_4',
          type: 'signature',
          label: 'Authorized Signatures / التوقيعات المعتمدة',
        },
      ],
    };

    const templateRes = await this.run(
      `INSERT INTO contract_templates
         (location_id, form_id, name, contract_type, current_version, is_active,
          validity_days, document_schema_json, conditional_rules_json,
          creation_rules_json, signing_parties_json)
       VALUES (?, ?, 'Bilingual Master Services Agreement (English & Arabic)', 'Master Services Agreement', 1, 1, 7, ?, '[]', '{"enabled": false}', '[]')`,
      [locationId, formId, JSON.stringify(sampleDocSchema)]
    );

    const templateId = templateRes.insertId || 1;

    await this.run(
      `INSERT INTO contract_template_versions
         (template_id, version_number, document_schema_json, signing_parties_json, change_summary, created_by)
       VALUES (?, 1, ?, '[]', 'Initial bilingual template', ?)`,
      [templateId, JSON.stringify(sampleDocSchema), userId]
    );

    // 4. Seed system settings
    const defaultSettings = [
      ['GHL_SHARED_SECRET', 'development_shared_secret_for_testing', 'GoHighLevel Shared Secret', 1, 'GHL'],
      ['GHL_PRIVATE_INTEGRATION_TOKEN', 'pit_dev_token_sample', 'GHL Private Integration Token', 1, 'GHL'],
      ['GHL_API_BASE_URL', 'https://services.leadconnectorhq.com', 'GoHighLevel API Base URL', 0, 'GHL'],
      ['GHL_API_VERSION', '2021-07-28', 'GoHighLevel API Version', 0, 'GHL'],
      ['SIGNING_BASE_URL', 'http://localhost:5173', 'Public portal base URL', 0, 'APP'],
      ['JWT_SECRET', 'contractmanager_secure_jwt_secret_dev', 'JWT Signing Secret', 1, 'SECURITY'],
      ['JWT_EXPIRES_IN', '7d', 'User session duration', 0, 'SECURITY'],
      ['GHL_CONCURRENCY_LIMIT', '4', 'Max concurrent requests to GHL', 0, 'PERFORMANCE'],
    ];

    for (const [key, val, desc, sec, cat] of defaultSettings) {
      await this.run(
        `INSERT OR IGNORE INTO system_settings (setting_key, setting_value, description, is_secret, category)
         VALUES (?, ?, ?, ?, ?)`,
        [key, val, desc, sec, cat]
      );
    }

    console.log('✅ [SQLite] Database initialized and seeded successfully!');
  }
}

/**
 * Universal Database Wrapper
 */
const sqliteInstance = new SQLiteAdapter(sqlitePath);
let mysqlPool = null;

// Attempt to create MySQL pool if requested
try {
  const mysql = require('mysql2/promise');
  mysqlPool = mysql.createPool({
    host:               process.env.DB_HOST     || '127.0.0.1',
    port:               parseInt(process.env.DB_PORT || '3306'),
    user:               process.env.DB_USER     || 'root',
    password:           process.env.DB_PASSWORD || '',
    database:           process.env.DB_NAME     || 'contractmanager',
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0,
    timezone:           '+00:00',
    charset:            'utf8mb4',
    connectTimeout:     1500,
  });
} catch (e) {
  mysqlPool = null;
}

const dbWrapper = {
  driver: 'SQLITE',

  async execute(sql, params = []) {
    if (dbWrapper.driver === 'MYSQL' && mysqlPool) {
      try {
        return await mysqlPool.execute(sql, params);
      } catch (err) {
        if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
          console.warn('⚠️ [DB] MySQL disconnected. Falling back to local SQLite database.');
          dbWrapper.driver = 'SQLITE';
          return await sqliteInstance.execute(sql, params);
        }
        throw err;
      }
    }

    // Default to SQLite
    return await sqliteInstance.execute(sql, params);
  },

  async getConnection() {
    if (dbWrapper.driver === 'MYSQL' && mysqlPool) {
      return await mysqlPool.getConnection();
    }
    // For SQLite, provide connection compatible wrapper
    return {
      execute: (sql, params) => dbWrapper.execute(sql, params),
      beginTransaction: async () => {},
      commit: async () => {},
      rollback: async () => {},
      release: () => {},
    };
  },

  async init() {
    if (mysqlPool && process.env.DB_HOST) {
      try {
        const [res] = await mysqlPool.execute('SELECT 1 as test');
        dbWrapper.driver = 'MYSQL';
        console.log('✅ [DB] Connected to MySQL Database.');
        await initMysqlTables(mysqlPool);
        return;
      } catch (err) {
        console.log('ℹ️  [DB] MySQL server not reachable (' + err.code + '). Using built-in SQLite database at server/data/contractmanager.sqlite.');
        dbWrapper.driver = 'SQLITE';
      }
    } else {
      dbWrapper.driver = 'SQLITE';
      console.log('ℹ️  [DB] Using built-in SQLite database.');
    }
  },
};

async function initMysqlTables(pool) {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS contract_form_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        form_id INT NOT NULL,
        location_id VARCHAR(255) NOT NULL,
        data_json LONGTEXT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
        submitted_by VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS contract_signatures (
        id INT AUTO_INCREMENT PRIMARY KEY,
        contract_instance_id INT NOT NULL,
        signer_name VARCHAR(255) NULL,
        signer_email VARCHAR(255) NULL,
        signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(60) NULL,
        user_agent TEXT NULL,
        signature_method VARCHAR(50) NOT NULL DEFAULT 'drawn',
        signature_data_b64 LONGTEXT NULL,
        document_sha256 VARCHAR(64) NULL,
        consent_accepted TINYINT(1) NOT NULL DEFAULT 0,
        contract_version INT NULL,
        template_version_at_sign INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS contract_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        contract_instance_id INT NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        event_data_json JSON NULL,
        actor_type VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
        actor_label VARCHAR(255) NULL,
        ip_address VARCHAR(60) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Additive column migrations for contract_forms
    const formAlters = [
      `ALTER TABLE contract_forms ADD COLUMN form_mode VARCHAR(20) NOT NULL DEFAULT 'NORMAL'`,
      `ALTER TABLE contract_forms ADD COLUMN settings_json JSON NULL`,
    ];
    // Additive column migrations for contract_instances
    const instanceAlters = [
      `ALTER TABLE contract_instances MODIFY COLUMN state VARCHAR(50) NOT NULL DEFAULT 'READY'`,
      `ALTER TABLE contract_instances ADD COLUMN form_mode VARCHAR(20) NOT NULL DEFAULT 'NORMAL'`,
      `ALTER TABLE contract_instances ADD COLUMN public_state VARCHAR(50) NOT NULL DEFAULT 'PENDING'`,
      `ALTER TABLE contract_instances ADD COLUMN recipient_name VARCHAR(255) NULL`,
      `ALTER TABLE contract_instances ADD COLUMN recipient_email VARCHAR(255) NULL`,
      `ALTER TABLE contract_instances ADD COLUMN recipient_phone VARCHAR(50) NULL`,
      `ALTER TABLE contract_instances ADD COLUMN form_data_json LONGTEXT NULL`,
      `ALTER TABLE contract_instances ADD COLUMN signing_config_json JSON NULL`,
      `ALTER TABLE contract_instances ADD COLUMN client_opened_at TIMESTAMP NULL`,
      `ALTER TABLE contract_instances ADD COLUMN form_started_at TIMESTAMP NULL`,
      `ALTER TABLE contract_instances ADD COLUMN form_completed_at TIMESTAMP NULL`,
      `ALTER TABLE contract_instances ADD COLUMN contract_reviewed_at TIMESTAMP NULL`,
      `ALTER TABLE contract_instances ADD COLUMN completed_at TIMESTAMP NULL`,
      `ALTER TABLE contract_instances ADD COLUMN revoked_at TIMESTAMP NULL`,
      `ALTER TABLE contract_instances ADD COLUMN assigned_user_name VARCHAR(255) NULL`,
    ];
    for (const stmt of [...formAlters, ...instanceAlters]) {
      try { await pool.execute(stmt); } catch (e) { /* column already exists — skip */ }
    }

    console.log('✅ [DB] MySQL tables verified and migrated.');
  } catch (e) {
    console.warn('[MySQL Table Init Note]:', e.message);
  }
}

// Initialize connection test asynchronously
dbWrapper.init().catch(() => {});

module.exports = dbWrapper;
