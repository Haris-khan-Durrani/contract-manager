/**
 * settings.js — System Settings Management Routes
 * Restricted to SUPER_ADMIN.
 */
const express = require('express');
const router = express.Router();
const { ghlAuthMiddleware } = require('../middleware/ghlAuth');
const { loadAppUser, requirePermission } = require('../middleware/rbac');
const settingsService = require('../services/settingsService');

// ─── GET /api/settings — List all settings (masked secrets) ─────────────────
router.get('/', ghlAuthMiddleware, loadAppUser, requirePermission('settings:manage'), async (req, res) => {
  try {
    const list = settingsService.getAll(true);
    res.json({ settings: list });
  } catch (err) {
    console.error('[Settings] Get error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve system settings.' });
  }
});

// ─── PUT /api/settings — Update settings ────────────────────────────────────
router.put('/', ghlAuthMiddleware, loadAppUser, requirePermission('settings:manage'), async (req, res) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Invalid settings payload.' });
    }

    const { locationId, privateToken } = req.ghlUser;
    const ghlService = require('../services/ghlService');

    // If company stamp was sent as base64, store directly in GoHighLevel Media Library
    if (settings.COMPANY_STAMP_URL && settings.COMPANY_STAMP_URL.startsWith('data:image/')) {
      try {
        const matches = settings.COMPANY_STAMP_URL.match(/^data:([A-Za-z0-9-+\/]+);base64,(.+)$/);
        if (matches) {
          const mimeType = matches[1];
          const buffer = Buffer.from(matches[2], 'base64');
          const ext = mimeType.includes('png') ? 'png' : 'jpg';
          const filename = `company_stamp_${Date.now()}.${ext}`;
          const ghlUrl = await ghlService.uploadMediaFile({
            locationId,
            buffer,
            filename,
            mimeType,
            privateToken,
          });
          if (ghlUrl) {
            settings.COMPANY_STAMP_URL = ghlUrl;
          }
        }
      } catch (uploadErr) {
        console.warn('[Settings Stamp] GHL Media upload fallback notice:', uploadErr.message);
      }
    }

    await settingsService.bulkUpdate(settings);
    const updated = settingsService.getAll(true);
    res.json({ message: 'Settings saved successfully in MySQL.', settings: updated });
  } catch (err) {
    console.error('[Settings] Update error:', err.message);
    res.status(500).json({ error: 'Failed to update system settings.' });
  }
});

module.exports = router;
