/**
 * ghl.js — HighLevel Integration Endpoints
 *
 * Exposes safe, cached, throttled HighLevel data to the frontend:
 *  - Custom fields discovery (contact & opportunity)
 *  - Create custom field in GHL
 *  - Refresh field cache
 *  - Contact search (for manual creation wizard)
 *  - Location users list
 */
const express = require('express');
const router  = express.Router();
const { ghlAuthMiddleware } = require('../middleware/ghlAuth');
const { loadAppUser, requirePermission } = require('../middleware/rbac');
const ghlService    = require('../services/ghlService');
const ghlFieldCache = require('../services/ghlFieldCache');
const settingsService = require('../services/settingsService');

router.use(ghlAuthMiddleware, loadAppUser);

// ─── GET /api/ghl/custom-fields ───────────────────────────────────────────────
router.get('/custom-fields', async (req, res) => {
  try {
    const { locationId } = req.ghlUser;
    const { model } = req.query; // 'contact' | 'opportunity' | undefined

    const fields = await ghlFieldCache.getFields(locationId, model);
    res.json({ fields });
  } catch (err) {
    console.error('[GHL Route] Get custom fields error:', err.message);
    res.status(500).json({ error: 'Failed to fetch GHL custom fields.' });
  }
});

// ─── POST /api/ghl/custom-fields/refresh — Bust cache & refetch ───────────────
router.post('/custom-fields/refresh', requirePermission('settings:view'), async (req, res) => {
  try {
    const { locationId } = req.ghlUser;
    ghlFieldCache.invalidate(locationId);
    const fields = await ghlFieldCache.getFields(locationId);
    res.json({ success: true, count: fields.length, fields });
  } catch (err) {
    console.error('[GHL Route] Refresh fields error:', err.message);
    res.status(500).json({ error: 'Failed to refresh GHL fields.' });
  }
});

// ─── POST /api/ghl/custom-fields — Create new field in GHL ────────────────────
router.post('/custom-fields', requirePermission('form:create'), async (req, res) => {
  try {
    const { locationId } = req.ghlUser;
    const { name, dataType, model = 'contact', acceptedValues } = req.body;

    if (!name || !dataType) {
      return res.status(400).json({ error: 'Field name and dataType are required.' });
    }

    const fieldDef = {
      name,
      dataType,
      model,
      ...(acceptedValues?.length ? { acceptedFormat: acceptedValues } : {}),
    };

    const newField = await ghlService.createCustomField(locationId, fieldDef);

    // Invalidate cache so new field appears immediately
    ghlFieldCache.invalidate(locationId);

    res.status(201).json({ field: newField });
  } catch (err) {
    console.error('[GHL Route] Create custom field error:', err.message);
    res.status(500).json({ error: 'Failed to create GHL custom field.' });
  }
});

// ─── GET /api/ghl/won-opportunities — Search only WON deals/clients ───────────
router.get('/won-opportunities', async (req, res) => {
  try {
    const { locationId, privateToken, userId } = req.ghlUser;
    const { role } = req.appUser || {};
    const { q = '', pipelineId } = req.query;

    const restrictToAssigned = settingsService.get('RESTRICT_CONTACTS_TO_ASSIGNED', 'true') !== 'false';
    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
    const assignedUserId = (!isAdmin && restrictToAssigned) ? userId : null;

    const opportunities = await ghlService.searchWonOpportunities(locationId, q, pipelineId, privateToken, assignedUserId);
    res.json({ opportunities: opportunities || [] });
  } catch (err) {
    console.error('[GHL Route] Search won opportunities error:', err.message);
    res.json({ opportunities: [] });
  }
});

// ─── GET /api/ghl/contacts — Search contacts ──────────────────────────────────
router.get('/contacts', async (req, res) => {
  try {
    const { locationId, privateToken, userId } = req.ghlUser;
    const { role } = req.appUser || {};
    const query = (req.query.q || req.query.search || '').trim();

    const restrictToAssigned = settingsService.get('RESTRICT_CONTACTS_TO_ASSIGNED', 'true') !== 'false';
    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
    const assignedUserId = (!isAdmin && restrictToAssigned) ? userId : null;

    const opps = await ghlService.searchWonOpportunities(locationId, query, null, privateToken, assignedUserId);
    const contacts = (opps || []).map(d => ({
      ...d.contact,
      opportunityId: d.id,
      opportunityName: d.name,
      monetaryValue: d.monetaryValue,
      status: d.status,
      pipelineName: d.pipelineName,
      pipelineStageName: d.pipelineStageName,
    }));
    return res.json({ contacts });
  } catch (err) {
    console.error('[GHL Route] Search contacts error:', err.message);
    res.json({ contacts: [] });
  }
});

// ─── GET /api/ghl/users — Get location team members ───────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { locationId, privateToken } = req.ghlUser;
    let users = [];
    try {
      users = await ghlService.getLocationUsers(locationId, privateToken);
    } catch (err) {
      users = [
        { id: req.ghlUser.userId, name: req.ghlUser.name || 'Authorized User', email: req.ghlUser.email || 'user@ghlcrm.com' },
      ];
    }
    res.json({ users: users || [] });
  } catch (err) {
    console.error('[GHL Route] Get users error:', err.message);
    res.status(500).json({ error: 'Failed to get location users.' });
  }
});

module.exports = router;
