/**
 * settingsService.js — Centralized Dynamic System Settings Service
 *
 * Reads and manages all application & integration configurations from MySQL.
 * Preloads into memory at server startup with instant in-memory lookups.
 */
const db = require('../config/db');

const DEFAULT_SETTINGS = {
  GHL_SHARED_SECRET:             'development_shared_secret_for_testing',
  GHL_PRIVATE_INTEGRATION_TOKEN: 'pit_dev_token_sample',
  GHL_WEBHOOK_SECRET:            'webhook_secret_dev_123',
  GHL_API_BASE_URL:              'https://services.leadconnectorhq.com',
  GHL_API_VERSION:               '2021-07-28',
  SIGNING_BASE_URL:              'http://localhost:5173',
  JWT_SECRET:                    'contractmanager_secure_jwt_secret_dev',
  JWT_EXPIRES_IN:                '8h',
  GHL_FIELD_CACHE_TTL_MS:        '900000',
  GHL_CONCURRENCY_LIMIT:         '4',
  EXPIRY_WORKER_CRON:            '*/5 * * * *',
  RETRY_WORKER_CRON:             '*/2 * * * *',
  MAX_UPLOAD_RETRIES:            '5',
  RESTRICT_CONTACTS_TO_ASSIGNED: 'true',
};

class SettingsService {
  constructor() {
    this._cache = new Map();
    this._initialized = false;
  }

  /**
   * Preload all settings from MySQL system_settings table into memory cache.
   */
  async init() {
    try {
      const [rows] = await db.execute(
        'SELECT setting_key, setting_value, description, is_secret, category FROM system_settings'
      );
      this._cache.clear();
      for (const row of rows) {
        this._cache.set(row.setting_key, {
          value: row.setting_value,
          description: row.description,
          isSecret: !!row.is_secret,
          category: row.category,
        });
      }

      // Ensure RESTRICT_CONTACTS_TO_ASSIGNED is seeded if not present
      if (!this._cache.has('RESTRICT_CONTACTS_TO_ASSIGNED')) {
        await db.execute(
          `INSERT IGNORE INTO system_settings (setting_key, setting_value, description, is_secret, category)
           VALUES ('RESTRICT_CONTACTS_TO_ASSIGNED', 'true', 'Restrict Sales agents to only view contacts and opportunities assigned to them in GoHighLevel', 0, 'access')`
        ).catch(() => {});
        this._cache.set('RESTRICT_CONTACTS_TO_ASSIGNED', {
          value: 'true',
          description: 'Restrict Sales agents to only view contacts and opportunities assigned to them in GoHighLevel',
          isSecret: false,
          category: 'access',
        });
      }

      this._initialized = true;
      console.log(`⚙️  [SettingsService] Loaded ${this._cache.size} settings from MySQL.`);
    } catch (err) {
      console.warn('⚠️  [SettingsService] Could not preload settings from MySQL:', err.message);
      // Fallback: continue, will read from process.env or DEFAULT_SETTINGS
    }
  }

  /**
   * Get a setting by key.
   * @param {string} key
   * @param {*} fallback
   * @returns {string|*}
   */
  get(key, fallback = null) {
    if (this._cache.has(key)) {
      const entry = this._cache.get(key);
      if (entry && entry.value !== null && entry.value !== undefined && entry.value !== '') {
        return entry.value;
      }
    }
    // Fallback to process.env if provided
    if (process.env[key] !== undefined && process.env[key] !== '') {
      return process.env[key];
    }
    // Fallback to DEFAULT_SETTINGS
    if (DEFAULT_SETTINGS[key] !== undefined) {
      return DEFAULT_SETTINGS[key];
    }
    return fallback;
  }

  /**
   * Get a numeric setting.
   */
  getInt(key, fallback = 0) {
    const val = this.get(key);
    if (val === null || val === undefined) return fallback;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? fallback : parsed;
  }

  /**
   * Update a setting in MySQL and update cache immediately.
   */
  async set(key, value) {
    await db.execute(
      `INSERT INTO system_settings (setting_key, setting_value)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = ?`,
      [key, String(value), String(value)]
    );
    const existing = this._cache.get(key) || {};
    this._cache.set(key, { ...existing, value: String(value) });
  }

  /**
   * Return all settings for Super Admin UI.
   * @param {boolean} maskSecrets
   */
  getAll(maskSecrets = true) {
    const list = [];
    for (const [key, item] of this._cache.entries()) {
      let displayValue = item.value || '';
      if (maskSecrets && item.isSecret && displayValue) {
        if (displayValue.length > 8) {
          displayValue = displayValue.slice(0, 4) + '••••••••' + displayValue.slice(-4);
        } else {
          displayValue = '••••••••';
        }
      }
      list.push({
        key,
        value: displayValue,
        rawValue: maskSecrets && item.isSecret ? undefined : item.value,
        description: item.description,
        isSecret: item.isSecret,
        category: item.category,
      });
    }
    return list;
  }

  /**
   * Bulk update settings from Admin UI.
   */
  async bulkUpdate(settingsMap) {
    for (const [key, value] of Object.entries(settingsMap)) {
      if (value === undefined || value === null) continue;
      // Skip masked passwords if not changed
      if (typeof value === 'string' && value.includes('••••')) continue;

      await this.set(key, value);
    }
  }
}

const instance = new SettingsService();
module.exports = instance;
