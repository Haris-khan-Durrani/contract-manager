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
    // 1. Read destination URL and signing secret from saved integration settings
    let targetUrl = (settingsService.get('OPERATIONS_WEBHOOK_URL') || '').trim();
    let targetSecret = (settingsService.get('OPERATIONS_WEBHOOK_SECRET') || '').trim();

    // Allow testing an unsaved destination URL if explicitly supplied in request
    if (req.body?.webhookUrl && typeof req.body.webhookUrl === 'string' && req.body.webhookUrl.trim()) {
      const candidateUrl = req.body.webhookUrl.trim();
      if (!targetUrl || candidateUrl !== targetUrl) {
        targetUrl = candidateUrl;
      }
    }

    // Allow testing an unsaved secret if explicitly entered in UI (must not be masked with bullets)
    if (req.body?.webhookSecret && typeof req.body.webhookSecret === 'string') {
      const candidateSecret = req.body.webhookSecret.trim();
      if (candidateSecret && !candidateSecret.includes('••••')) {
        targetSecret = candidateSecret;
      }
    }

    if (!targetUrl) {
      return res.status(400).json({
        success: false,
        error: 'Operations Webhook Destination URL is not configured. Please save or enter a destination URL.',
      });
    }

    if (!targetSecret) {
      return res.status(400).json({
        success: false,
        error: 'Operations Webhook Signing Secret is not configured. Please save or enter a signing secret.',
      });
    }

    const startTime = Date.now();

    // 2. Exact JSON body: {"event":"webhook.ping"}
    // 6. Serialize the body once, sign it, and send those same bytes
    const rawBody = JSON.stringify({ event: 'webhook.ping' });

    // 3. Calculate HMAC-SHA256 over the exact raw JSON bytes, using the saved signing secret as a UTF-8 string
    // 4. Resulting 64-character hexadecimal digest in X-Webhook-Signature, without a sha256= prefix
    const signature = crypto
      .createHmac('sha256', Buffer.from(targetSecret, 'utf8'))
      .update(Buffer.from(rawBody, 'utf8'))
      .digest('hex');

    // 5. Set Content-Type: application/json and X-Webhook-Event: webhook.ping
    const webhookRes = await axios.post(targetUrl, rawBody, {
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Event': 'webhook.ping',
        'X-Webhook-Signature': signature,
      },
      timeout: 10000,
      transformRequest: [(data) => data],
    });

    const durationMs = Date.now() - startTime;

    // Expected success: HTTP 200 with: {"ok":true,"service":"operations","test":true}
    return res.json({
      success: true,
      message: `Test ping received HTTP ${webhookRes.status} from destination.`,
      status: webhookRes.status,
      durationMs,
      targetUrl,
      responseData: webhookRes.data,
    });
  } catch (err) {
    const status = err.response?.status || (err.code === 'ECONNABORTED' ? 504 : 502);
    const responseData = err.response?.data;

    let responseSummary = err.message;
    if (responseData) {
      if (typeof responseData === 'string') {
        responseSummary = responseData;
      } else if (responseData.error || responseData.message) {
        responseSummary = responseData.error || responseData.message;
      } else {
        try {
          responseSummary = JSON.stringify(responseData);
        } catch (_) {
          responseSummary = String(responseData);
        }
      }
    }

    // Display the receiver's response body on failure, not just its HTTP status.
    // Never log or display the signing secret.
    console.error(`[Settings] Test webhook ping failed (HTTP ${status}):`, responseSummary);

    return res.status(200).json({
      success: false,
      status,
      error: `Webhook delivery failed (HTTP ${status}): ${responseSummary}`,
      responseData: responseData || null,
      targetUrl: req.body?.webhookUrl || settingsService.get('OPERATIONS_WEBHOOK_URL') || '',
    });
  }
});

module.exports = router;
