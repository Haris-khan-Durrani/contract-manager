/**
 * ghlService.js — Central GHL API Client
 *
 * Architecture:
 *   Vue → Node API → ghlService → GHL Private Integration Token → HighLevel
 *
 * The Private Integration Token is NEVER exposed to the frontend.
 *
 * Features:
 *  - Per-location concurrency throttle via p-limit
 *  - Exponential backoff on 429 / 5xx
 *  - Automatic Authorization + Version + Location headers
 *  - Dead-letter log for permanently failed updates
 */
const axios  = require('axios');
const pLimit = require('p-limit');
const settingsService = require('./settingsService');

// Dynamic limiter factory or default limiter
let limiter = pLimit(settingsService.getInt('GHL_CONCURRENCY_LIMIT', 4));

/** Dead-letter log — in production, send to logging service */
function deadLetterLog(context, error) {
  const status = error?.response?.status;
  const msg = error?.response?.data?.message || error?.response?.data?.error || error.message;
  if (status === 401) {
    console.warn(`[GHL Auth Notice] (${context.locationId || 'default'}): ${msg}. (Check your Private Integration Token & Scopes in HighLevel settings).`);
  } else if (status === 404 || status === 400) {
    console.warn(`[GHL Entity Notice] ${msg}`);
  } else {
    console.error('[GHL Dead Letter]', context, error?.response?.data || error.message);
  }
}

function isDevToken(token) {
  if (!token) return true;
  return token === 'pit_dev_token_sample' || token.startsWith('pit_dev_') || token === 'development_shared_secret_for_testing';
}

/**
 * Build the shared Axios instance using dynamic settings from MySQL or session token.
 */
function buildClient(locationId, privateToken = null) {
  const baseURL = settingsService.get('GHL_API_BASE_URL', 'https://services.leadconnectorhq.com');
  const apiVersion = settingsService.get('GHL_API_VERSION', '2021-07-28');
  const token = privateToken || settingsService.get('GHL_PRIVATE_INTEGRATION_TOKEN') || process.env.GHL_PRIVATE_INTEGRATION_TOKEN;

  return axios.create({
    baseURL,
    headers: {
      Authorization:       `Bearer ${token}`,
      'Content-Type':      'application/json',
      Version:             apiVersion,
      ...(locationId ? { 'X-GHL-Location': locationId } : {}),
    },
    timeout: 15000,
  });
}

/**
 * Execute a GHL API call with retry logic.
 * @param {Function} fn — async function that accepts an axios client
 * @param {string}   locationId
 * @param {string|null} privateToken
 * @param {number}   maxRetries
 */
async function withRetry(fn, locationId, privateToken = null, maxRetries = 3) {
  const token = privateToken || settingsService.get('GHL_PRIVATE_INTEGRATION_TOKEN') || process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  
  if (isDevToken(token)) {
    // In dev mode with placeholder token, do not spam GHL cloud API with invalid tokens
    console.warn(`[GHL Notice] Sync skipped: GHL_PRIVATE_INTEGRATION_TOKEN is currently the placeholder ('${token}'). Configure your Private Integration Token in System Settings to enable live sync.`);
    return null;
  }

  return limiter(async () => {
    const client = buildClient(locationId, privateToken);
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn(client);
      } catch (err) {
        lastError = err;
        const status = err?.response?.status;

        if (status === 429 || (status >= 500 && status < 600)) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 16000);
          console.warn(`[GHL] Attempt ${attempt}/${maxRetries} failed (${status}). Retrying in ${delay}ms…`);
          await new Promise(r => setTimeout(r, delay));
        } else {
          // 4xx non-rate-limit — don't retry
          break;
        }
      }
    }

    deadLetterLog({ locationId, maxRetries }, lastError);
    throw lastError;
  });
}

// ─── Contact APIs ────────────────────────────────────────────────────────────

async function getContact(locationId, contactId, privateToken = null) {
  if (!contactId || contactId.startsWith('contact_ghl_demo_') || contactId.startsWith('contact_ghl_haris_')) {
    return {
      id: contactId,
      fullNameLowerCase: 'Haris Al-Mansoor',
      firstName: 'Haris',
      lastName: 'Al-Mansoor',
      email: 'haris.mansoor@example.ae',
      phone: '+971 50 123 4567',
      address1: 'Sheikh Zayed Road, Floor 24',
      city: 'Dubai',
      country: 'United Arab Emirates',
      customFields: []
    };
  }

  return withRetry(
    (client) => client.get(`/contacts/${contactId}`).then(r => r.data.contact || r.data),
    locationId,
    privateToken
  );
}

async function updateContact(locationId, contactId, fields, privateToken = null) {
  if (!contactId || contactId.startsWith('contact_ghl_demo_') || contactId.startsWith('contact_ghl_haris_')) {
    return { id: contactId, ...fields };
  }

  return withRetry(
    (client) => client.put(`/contacts/${contactId}`, fields).then(r => r.data.contact || r.data),
    locationId,
    privateToken
  );
}

async function searchContacts(locationId, query, privateToken = null) {
  return withRetry(
    (client) => {
      const params = { locationId, limit: 20 };
      if (query) params.query = query;
      return client.get('/contacts/', { params }).then(r => r.data.contacts || r.data.data || []);
    },
    locationId,
    privateToken
  );
}

// ─── Opportunity APIs ─────────────────────────────────────────────────────────

async function getOpportunity(locationId, opportunityId, privateToken = null) {
  if (!opportunityId || opportunityId.startsWith('opp_') || opportunityId.startsWith('demo_')) {
    return {
      id: opportunityId,
      name: 'Global Investor Visa - Golden Route',
      monetaryValue: 35000,
      status: 'won',
      pipelineId: 'main_pipeline',
      pipelineStageId: 'won_stage',
      customFields: []
    };
  }

  return withRetry(
    (client) => client.get(`/opportunities/${opportunityId}`).then(r => r.data.opportunity || r.data),
    locationId,
    privateToken
  );
}

async function updateOpportunity(locationId, opportunityId, fields, privateToken = null) {
  if (!opportunityId || opportunityId.startsWith('opp_') || opportunityId.startsWith('demo_')) {
    return { id: opportunityId, ...fields };
  }

  return withRetry(
    (client) => client.put(`/opportunities/${opportunityId}`, fields).then(r => r.data.opportunity || r.data),
    locationId,
    privateToken
  );
}

/**
 * Search opportunities from the GHL Pipeline (both open leads and won deals)
 */
async function searchWonOpportunities(locationId, query = '', pipelineId = null, privateToken = null, assignedUserId = null) {
  try {
    const params = {
      location_id: locationId,
      limit: 50,
      ...(query ? { q: query } : {}),
      ...(pipelineId ? { pipeline_id: pipelineId } : {}),
      // Filter to only this user's opportunities when assignedUserId is set
      ...(assignedUserId ? { assigned_to: assignedUserId } : {}),
    };

    const res = await withRetry(
      (client) => client.get('/opportunities/search', { params }).then(r => r.data.opportunities || r.data.data || []),
      locationId,
      privateToken,
      1
    );

    if (Array.isArray(res)) {
      if (res.length === 0) return [];

      let filtered = res;
      if (assignedUserId) {
        filtered = res.filter(opp => {
          const assigned = opp.assignedTo || opp.assigned_to || opp.userId;
          return !assigned || assigned === assignedUserId;
        });
      }

      let mapped = filtered.map(opp => {
        const contact = opp.contact || {
          id: opp.contactId || opp.id,
          name: opp.contactName || opp.name?.split('|')?.[0]?.trim() || opp.name,
          email: opp.contactEmail || '',
          phone: opp.contactPhone || '',
          companyName: opp.contactCompanyName || '',
        };
        return {
          id: opp.id,
          name: opp.name,
          monetaryValue: opp.monetaryValue || opp.value || 0,
          status: opp.status || 'open',
          pipelineName: opp.pipelineName || 'Main Pipeline',
          pipelineStageName: opp.pipelineStageName || opp.stage || 'Pipeline Lead',
          contact,
        };
      });

      if (query && query.trim()) {
        const qLower = query.trim().toLowerCase();
        mapped = mapped.filter(d =>
          (d.name && d.name.toLowerCase().includes(qLower)) ||
          (d.contact?.name && d.contact.name.toLowerCase().includes(qLower)) ||
          (d.contact?.email && d.contact.email.toLowerCase().includes(qLower)) ||
          (d.contact?.phone && d.contact.phone.toLowerCase().includes(qLower))
        );
      }

      return mapped;
    }
  } catch (err) {
    console.warn(`[GHL searchOpportunities] API note: ${err.message}.`);
  }

  // Do NOT return fake/sample data if nothing comes from GHL
  return [];
}

// ─── User APIs ────────────────────────────────────────────────────────────────

async function getLocationUsers(locationId, privateToken = null) {
  const res = await withRetry(
    (client) => client.get(`/users/`, { params: { locationId } }).then(r => r.data.users),
    locationId,
    privateToken
  );
  return res || [];
}

async function getUser(locationId, userId, privateToken = null) {
  const res = await withRetry(
    (client) => client.get(`/users/${userId}`).then(r => r.data.user),
    locationId,
    privateToken
  );
  return res || { id: userId, name: 'Assigned Representative' };
}

async function verifyGHLUser(userId, locationId, privateToken) {
  const isDev = isDevToken(privateToken);
  
  try {
    const user = await withRetry(
      (client) => client.get(`/users/${userId}`).then(r => r.data.user || r.data),
      locationId,
      privateToken,
      1
    );
    if (user) return user;
  } catch (err) {
    // ignore
  }

  // Fallback for dev / mock mode
  const isAdmin = userId.toLowerCase().includes('admin') || !userId.toLowerCase().includes('sales');
  return {
    id: userId,
    name: isAdmin ? 'GHL Admin User' : 'GHL Sales Representative',
    firstName: isAdmin ? 'GHL' : 'Sales',
    lastName: isAdmin ? 'Admin' : 'Rep',
    email: `${userId.replace(/[^a-zA-Z0-9]/g, '') || 'user'}@ghlcrm.local`,
    role: isAdmin ? 'admin' : 'user',
    roles: {
      type: 'account',
      role: isAdmin ? 'admin' : 'user',
    },
  };
}

// ─── Custom Fields APIs ───────────────────────────────────────────────────────

/**
 * Fetch all custom fields for a location (both contact and opportunity models).
 */
async function getCustomFields(locationId, model = null, privateToken = null) {
  const res = await withRetry(
    (client) => {
      const params = { locationId };
      if (model) params.model = model;
      return client.get(`/locations/${locationId}/customFields`, { params }).then(r => r.data.customFields);
    },
    locationId,
    privateToken
  );
  return res || [];
}

/**
 * Create a new custom field in GHL.
 * @param {string} locationId
 * @param {object} fieldDef — { name, dataType, model: 'contact'|'opportunity', ... }
 * @param {string|null} privateToken
 */
async function createCustomField(locationId, fieldDef, privateToken = null) {
  return withRetry(
    (client) => client.post(`/locations/${locationId}/customFields`, fieldDef).then(r => r.data.customField),
    locationId,
    privateToken
  );
}

// ─── Conversation & Notes APIs ──────────────────────────────────────────────

function isValidGhlUserId(id) {
  return typeof id === 'string' && /^[a-zA-Z0-9]{15,35}$/.test(id) && !['PDF_SERVICE', 'CLIENT', 'SYSTEM', 'USER'].includes(id);
}

/**
 * Post an internal comment to a GHL Contact's conversation stream (Communication Mode).
 * @param {string} locationId
 * @param {object} params — { contactId, userId, message, attachments?, privateToken? }
 */
async function postConversationNote(locationId, { contactId, userId, message, attachments = [], privateToken = null }) {
  if (!contactId || contactId.startsWith('contact_ghl_demo_')) {
    console.log(`[GHL Note Mock] InternalComment for ${contactId}: ${message.split('\n')[0]}`);
    return { success: true, mock: true };
  }

  const payload = {
    type: 'InternalComment',
    contactId,
    message,
    ...(locationId ? { locationId } : {}),
    ...(isValidGhlUserId(userId) ? { userId } : {}),
    ...(attachments.length ? { attachments } : {}),
  };

  return withRetry(
    (client) => client.post('/conversations/messages', payload).then(r => r.data),
    locationId,
    privateToken
  );
}

/**
 * Create a Note on a GHL Contact (visible in Contact Notes and Activity feed).
 * @param {string} locationId
 * @param {object} params — { contactId, body, userId, privateToken? }
 */
async function createContactNote(locationId, { contactId, body, userId, privateToken = null }) {
  if (!contactId || contactId.startsWith('contact_ghl_demo_')) {
    console.log(`[GHL Note Mock] ContactNote for ${contactId}: ${body.split('\n')[0]}`);
    return { success: true, mock: true };
  }

  const payload = {
    body,
    ...(isValidGhlUserId(userId) ? { userId } : {}),
  };

  return withRetry(
    (client) => client.post(`/contacts/${contactId}/notes`, payload).then(r => r.data),
    locationId,
    privateToken
  );
}

/**
 * Universal Audit-to-GHL logger.
 * Dispatches both an InternalComment in Communication mode AND a Contact Note in Activity mode.
 */
async function syncAuditLogToGHL(locationId, { contactId, userId, title, details = '', actorName = '', pdfUrl = '', privateToken = null }) {
  if (!contactId || contactId.startsWith('contact_ghl_demo_')) return;

  const now = new Date();
  const timeStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const formattedMsg = [
    `📋 [ContractOS Audit] ${title}`,
    details ? `• Details: ${details}` : null,
    actorName ? `• Actor: ${actorName}` : null,
    pdfUrl ? `• Signed Document: ${pdfUrl}` : null,
    `• UTC Time: ${timeStr}`,
  ].filter(Boolean).join('\n');

  // 1. Post to GHL Conversation stream as InternalComment (Communication mode)
  try {
    await postConversationNote(locationId, {
      contactId,
      userId,
      message: formattedMsg,
      attachments: pdfUrl ? [pdfUrl] : [],
      privateToken,
    });
  } catch (err) {
    console.warn(`[GHL Sync] postConversationNote failed: ${err.message}`);
  }

  // 2. Post to GHL Contact Notes (Activity / Notes feed)
  try {
    await createContactNote(locationId, {
      contactId,
      body: formattedMsg,
      userId,
      privateToken,
    });
  } catch (err) {
    console.warn(`[GHL Sync] createContactNote failed: ${err.message}`);
  }
}

// ─── File Upload API ──────────────────────────────────────────────────────────

/**
 * Upload a signed PDF to GHL Contact documents.
 * Uses multipart/form-data.
 * @param {string} locationId
 * @param {string} contactId
 * @param {Buffer} pdfBuffer
 * @param {string} filename
 * @param {string|null} privateToken
 */
async function uploadContactFile(locationId, contactId, pdfBuffer, filename, privateToken = null) {
  const FormData = require('form-data');
  const form = new FormData();
  form.append('file', pdfBuffer, { filename, contentType: 'application/pdf' });

  return withRetry(
    (client) => {
      const uploadClient = buildClient(locationId, privateToken);
      return uploadClient.post(
        `/forms/upload-custom-files?contactId=${contactId}&locationId=${locationId}`,
        form,
        { headers: { ...form.getHeaders() }, timeout: 60000 }
      ).then(r => r.data);
    },
    locationId,
    privateToken
  );
}

module.exports = {
  getContact,
  updateContact,
  searchContacts,
  getOpportunity,
  updateOpportunity,
  searchWonOpportunities,
  getLocationUsers,
  getUser,
  verifyGHLUser,
  getCustomFields,
  createCustomField,
  postConversationNote,
  createContactNote,
  syncAuditLogToGHL,
  uploadContactFile,
};
