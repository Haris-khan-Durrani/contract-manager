/**
 * ghlFieldCache.js — In-Process GHL Custom Field Cache
 *
 * Caches GHL Contact and Opportunity custom field definitions per location.
 * TTL default: 15 minutes (configurable via GHL_FIELD_CACHE_TTL_MS env).
 *
 * Why: Prevents repeated GHL API calls on every form open or field render.
 * Manual refresh endpoint: POST /api/ghl/fields/refresh
 */
const ghlService = require('./ghlService');
const settingsService = require('./settingsService');

/** In-memory cache: Map<locationId, { data, expiresAt }> */
const cache = new Map();

/**
 * Get all custom fields for a location (contact + opportunity models).
 * Serves from cache if fresh; fetches from GHL if stale or missing.
 *
 * @param {string} locationId
 * @param {boolean} forceRefresh — bypass cache and fetch fresh from GHL
 * @returns {Promise<{ contact: Array, opportunity: Array }>}
 */
async function getFields(locationId, forceRefresh = false) {
  const entry = cache.get(locationId);
  const now   = Date.now();

  if (!forceRefresh && entry && entry.expiresAt > now) {
    return entry.data;
  }

  // Fetch both models in parallel
  const [contactFields, opportunityFields] = await Promise.all([
    ghlService.getCustomFields(locationId, 'contact').catch(() => []),
    ghlService.getCustomFields(locationId, 'opportunity').catch(() => []),
  ]);

  const standardContactFields = [
    { id: 'contact.name', name: 'Full Name / الاسم الكامل', fieldKey: 'contact.name', dataType: 'TEXT', model: 'contact' },
    { id: 'contact.email', name: 'Email Address / البريد الإلكتروني', fieldKey: 'contact.email', dataType: 'EMAIL', model: 'contact' },
    { id: 'contact.phone', name: 'Phone Number / رقم الهاتف', fieldKey: 'contact.phone', dataType: 'PHONE', model: 'contact' },
    { id: 'contact.companyName', name: 'Company Name / اسم الشركة', fieldKey: 'contact.companyName', dataType: 'TEXT', model: 'contact' },
    { id: 'contact.address1', name: 'Street Address / العنوان', fieldKey: 'contact.address1', dataType: 'TEXT', model: 'contact' },
    { id: 'contact.dateOfBirth', name: 'Date of Birth / تاريخ الميلاد', fieldKey: 'contact.dateOfBirth', dataType: 'DATE', model: 'contact' },
    { id: 'contact.passportNumber', name: 'Passport Number / رقم جواز السفر', fieldKey: 'contact.passportNumber', dataType: 'TEXT', model: 'contact' },
    { id: 'contact.nationality', name: 'Nationality / الجنسية', fieldKey: 'contact.nationality', dataType: 'TEXT', model: 'contact' },
  ];

  const standardOpportunityFields = [
    { id: 'opportunity.name', name: 'Opportunity Name / اسم الفرصة', fieldKey: 'opportunity.name', dataType: 'TEXT', model: 'opportunity' },
    { id: 'opportunity.monetaryValue', name: 'Deal Value / قيمة الصفقة', fieldKey: 'opportunity.monetaryValue', dataType: 'NUMERICAL', model: 'opportunity' },
    { id: 'opportunity.stage', name: 'Pipeline Stage / مرحلة التدفق', fieldKey: 'opportunity.stage', dataType: 'TEXT', model: 'opportunity' },
  ];

  const data = {
    contact: (contactFields && contactFields.length) ? contactFields : standardContactFields,
    opportunity: (opportunityFields && opportunityFields.length) ? opportunityFields : standardOpportunityFields,
  };

  const ttlMs = settingsService.getInt('GHL_FIELD_CACHE_TTL_MS', 900000);
  cache.set(locationId, { data, expiresAt: now + ttlMs });
  console.log(`[FieldCache] Refreshed ${data.contact.length} contact + ${data.opportunity.length} opportunity fields for location ${locationId}`);

  return data;
}

/**
 * Force-invalidate cache for a specific location.
 * Call after a new GHL custom field is created via our builder.
 * @param {string} locationId
 */
function invalidate(locationId) {
  cache.delete(locationId);
  console.log(`[FieldCache] Invalidated cache for location ${locationId}`);
}

/**
 * Return cache status for a location (useful for admin sync status panel).
 * @param {string} locationId
 */
function getCacheStatus(locationId) {
  const entry = cache.get(locationId);
  if (!entry) return { cached: false };
  return {
    cached:    true,
    expiresAt: new Date(entry.expiresAt).toISOString(),
    fresh:     entry.expiresAt > Date.now(),
    count: {
      contact:     entry.data.contact.length,
      opportunity: entry.data.opportunity.length,
    },
  };
}

module.exports = { getFields, invalidate, getCacheStatus };
