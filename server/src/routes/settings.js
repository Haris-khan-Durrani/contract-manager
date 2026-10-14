/**
 * settings.js — System Settings Management Routes
 * Restricted to SUPER_ADMIN.
 */
const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
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

    // If company stamp was sent as base64, store directly in GoHighLevel Media Library or persistent local storage
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

    // If company signature was sent as base64, store directly in GoHighLevel Media Library or persistent local storage
    if (settings.COMPANY_SIGNATURE_URL && settings.COMPANY_SIGNATURE_URL.startsWith('data:image/')) {
      try {
        const matches = settings.COMPANY_SIGNATURE_URL.match(/^data:([A-Za-z0-9-+\/]+);base64,(.+)$/);
        if (matches) {
          const mimeType = matches[1];
          const buffer = Buffer.from(matches[2], 'base64');
          const ext = mimeType.includes('png') ? 'png' : 'jpg';
          const filename = `company_signature_${Date.now()}.${ext}`;
          const ghlUrl = await ghlService.uploadMediaFile({
            locationId,
            buffer,
            filename,
            mimeType,
            privateToken,
          });
          if (ghlUrl) {
            settings.COMPANY_SIGNATURE_URL = ghlUrl;
          }
        }
      } catch (uploadErr) {
        console.warn('[Settings Signature] GHL Media upload fallback notice:', uploadErr.message);
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

// ─── POST /api/settings/test-operations-webhook ──────────────────────────────
// Send a test ping to the configured Operations Webhook URL to verify integration
router.post('/test-operations-webhook', ghlAuthMiddleware, loadAppUser, requirePermission('settings:manage'), async (req, res) => {
  try {
    const { webhookUrl, webhookSecret } = req.body;
    const targetUrl = (webhookUrl || settingsService.get('OPERATIONS_WEBHOOK_URL') || '').trim();
    const targetSecret = (webhookSecret || settingsService.get('OPERATIONS_WEBHOOK_SECRET') || '').trim();

    if (!targetUrl) {
      return res.status(400).json({ error: 'Please provide or save an Operations Webhook URL first.' });
    }

    const startTime = Date.now();
    const testPayload = {
      event: 'client_dossier.test_ping',
      eventId: `evt_test_${Date.now()}`,
      timestamp: new Date().toISOString(),
      test: true,
      message: 'Test ping from Contract & Client Summary Management System',
      handover: {
        action: 'TEST_PING',
        sharedByUserId: req.ghlUser?.userId || 'usr_admin_test',
        sharedByName: req.appUser?.name || 'Administrator',
        sharedAt: new Date().toISOString(),
        counsellorName: 'Akram Mammeri',
        registeredBranch: 'Dubai HQ',
      },
      client: {
        ghlContactId: 'sample_contact_123',
        fullName: 'Test Client (Ahmed Al Mansoor)',
        email: 'test.client@example.com',
        phone: '+971500000000',
        nationality: 'United Arab Emirates',
      },
      contract: {
        id: 9999,
        templateName: 'Cyprus Permanent Residency Agreement (Sample)',
        contractType: 'IMMIGRATION_SERVICES',
        state: 'COMPLETED',
        signedAt: new Date().toISOString(),
      },
      documents: {
        signedContractPdfUrl: 'https://example.com/sample_signed_contract.pdf',
        clientSummaryPdfUrl: 'https://example.com/sample_client_summary.pdf',
        packageZipUrl: 'https://example.com/sample_case_package.zip',
        attachments: [
          { name: 'sample_passport.pdf', url: 'https://example.com/sample_passport.pdf', mimeType: 'application/pdf', sizeBytes: 524288, category: 'Identity' },
        ],
      },
    };

    const signature = crypto
      .createHmac('sha256', targetSecret || 'ops_secret')
      .update(JSON.stringify(testPayload))
      .digest('hex');

    const webhookRes = await axios.post(targetUrl, testPayload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Event-Type': 'TEST_PING',
        ...(targetSecret ? { Authorization: `Bearer ${targetSecret}` } : {}),
      },
      timeout: 10000,
    });

    const durationMs = Date.now() - startTime;

    res.json({
      success: true,
      message: `Test ping received HTTP ${webhookRes.status} (${webhookRes.statusText || 'OK'}) from destination.`,
      status: webhookRes.status,
      durationMs,
      targetUrl,
    });
  } catch (err) {
    console.error('[Settings] Test webhook error:', err.message);
    const status = err.response?.status || 502;
    const responseData = err.response?.data;
    res.status(200).json({
      success: false,
      error: `Webhook delivery failed: ${err.message}`,
      status,
      responseData,
    });
  }
});

module.exports = router;
