/**
 * auth.js — GoHighLevel Direct Authentication & User Management
 *
 * Direct Login via:
 *   - userId
 *   - locationId
 *   - privateToken (GoHighLevel Private Integration Token)
 *
 * Routes:
 *   POST   /api/auth/login      — Direct login with userId, locationId, privateToken
 *   POST   /api/auth/verify     — Verify existing app session token
 *   POST   /api/auth/dev-token  — Quick dev/test session token
 *   GET    /api/auth/users      — List authorized users in location (ADMIN/SUPER_ADMIN)
 *   POST   /api/auth/users      — Grant access / set role for user (ADMIN/SUPER_ADMIN)
 *   PUT    /api/auth/users/:id  — Update role or toggle enabled (ADMIN/SUPER_ADMIN)
 *   DELETE /api/auth/users/:id  — Revoke access (ADMIN/SUPER_ADMIN)
 */
const express = require('express');
const router  = express.Router();
const { createSessionToken, verifySessionToken, ghlAuthMiddleware } = require('../middleware/ghlAuth');
const { loadAppUser, requirePermission } = require('../middleware/rbac');
const ghlService = require('../services/ghlService');
const settingsService = require('../services/settingsService');
const db = require('../config/db');

// ─── POST /api/auth/login ───────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    let { userId, locationId, privateToken } = req.body;

    if (!privateToken || !privateToken.toString().trim()) {
      privateToken = settingsService.get('GHL_PRIVATE_INTEGRATION_TOKEN') || '';
    }

    if (!userId || !locationId || !privateToken) {
      return res.status(400).json({
        error: 'Missing Credentials',
        message: 'userId, locationId, and privateToken are required to log in.',
      });
    }

    const trimmedUserId = userId.toString().trim();
    const trimmedLocationId = locationId.toString().trim();
    const trimmedPrivateToken = privateToken.toString().trim();

    // Verify user & retrieve CRM role from GoHighLevel
    let ghlUser;
    try {
      ghlUser = await ghlService.verifyGHLUser(trimmedUserId, trimmedLocationId, trimmedPrivateToken);
    } catch (err) {
      console.error('[Auth Login] GHL verification error:', err.response?.data || err.message);
      return res.status(401).json({
        error: 'GoHighLevel Verification Failed',
        message: 'Could not verify user with GoHighLevel CRM. Please check your User ID, Location ID, and Private Integration Token.',
      });
    }

    // Extract user profile information
    const name = ghlUser.name
      || `${ghlUser.firstName || ''} ${ghlUser.lastName || ''}`.trim()
      || trimmedUserId;
    const email = ghlUser.email || '';

    // Map GoHighLevel CRM role to Contract App Role
    const rawRole = (ghlUser.roles?.role || ghlUser.role || ghlUser.type || '').toString().toLowerCase();
    let appRole = 'SALES';
    if (rawRole.includes('admin') || rawRole.includes('agency') || rawRole.includes('owner')) {
      appRole = 'ADMIN';
    }

    // Check if database has explicit role override or disabled flag
    const [rows] = await db.execute(
      'SELECT id, app_role, enabled FROM app_user_access WHERE location_id = ? AND ghl_user_id = ? LIMIT 1',
      [trimmedLocationId, trimmedUserId]
    ).catch(() => [[]]);

    if (rows.length) {
      if (!rows[0].enabled) {
        return res.status(403).json({
          error: 'Access Disabled',
          message: 'Your user access has been disabled by an administrator for this location.',
        });
      }
      appRole = rows[0].app_role;
    } else {
      // Auto-provision user record in database
      await db.execute(
        `INSERT INTO app_user_access (location_id, ghl_user_id, app_role, enabled)
         VALUES (?, ?, ?, TRUE)
         ON DUPLICATE KEY UPDATE updated_at = NOW()`,
        [trimmedLocationId, trimmedUserId, appRole]
      ).catch(err => console.warn('[Auth Login] DB upsert notice:', err.message));
    }

    // Issue signed session token
    const token = createSessionToken({
      userId:       trimmedUserId,
      locationId:   trimmedLocationId,
      privateToken: trimmedPrivateToken,
      role:         appRole,
      name,
      email,
    });

    return res.json({
      success: true,
      token,
      user: {
        userId:     trimmedUserId,
        locationId: trimmedLocationId,
        name,
        email,
      },
      role: appRole,
    });
  } catch (err) {
    console.error('[Auth Login] Unexpected error:', err);
    return res.status(500).json({ error: 'Login failed', message: err.message });
  }
});

// ─── POST /api/auth/verify ───────────────────────────────────────────────────
router.post('/verify', async (req, res) => {
  const authHeader = req.headers['authorization'] || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing session token.' });
  }

  const token = authHeader.slice(7);
  let payload;
  try {
    payload = verifySessionToken(token);
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }

  const { userId, locationId } = payload;
  if (!userId || !locationId) {
    return res.status(401).json({ error: 'Invalid token payload.' });
  }

  const [rows] = await db.execute(
    'SELECT app_role, enabled FROM app_user_access WHERE location_id = ? AND ghl_user_id = ? LIMIT 1',
    [locationId, userId]
  ).catch(() => [[]]);

  if (rows.length && !rows[0].enabled) {
    return res.status(403).json({
      error: 'Access Denied',
      message: "Your account has been disabled. Please contact your administrator.",
    });
  }

  const effectiveRole = rows.length ? rows[0].app_role : (payload.role || 'SALES');

  return res.json({
    userId,
    locationId,
    name:  payload.name  || payload.full_name || 'GHL User',
    email: payload.email || '',
    role:  effectiveRole,
  });
});

// ─── POST /api/auth/dev-token (Development only) ───────────────────────────
router.post('/dev-token', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Dev tokens disabled in production.' });
  }

  const { role = 'SUPER_ADMIN' } = req.body;
  const settingsService = require('../services/settingsService');
  const locationId = settingsService.get('INITIAL_LOCATION_ID', 'loc_default_001');
  const userId = role === 'SUPER_ADMIN' ? 'user_superadmin_001' : role === 'ADMIN' ? 'user_admin_001' : 'user_sales_001';
  const privateToken = settingsService.get('GHL_PRIVATE_INTEGRATION_TOKEN', 'pit_dev_token_sample');

  // Ensure record exists in app_user_access for local dev
  await db.execute(
    `INSERT INTO app_user_access (location_id, ghl_user_id, app_role, enabled)
     VALUES (?, ?, ?, TRUE)
     ON DUPLICATE KEY UPDATE app_role = ?, enabled = TRUE`,
    [locationId, userId, role, role]
  ).catch(() => {});

  const token = createSessionToken({
    userId,
    locationId,
    privateToken,
    name: `Dev ${role} User`,
    email: `${role.toLowerCase()}@localdev.com`,
    role,
  });

  res.json({ token, role, userId, locationId });
});

// ─── User Access Management (Restricted to ADMIN / SUPER_ADMIN) ──────────────

router.get('/users', ghlAuthMiddleware, loadAppUser, requirePermission('users:manage'), async (req, res) => {
  try {
    const { locationId } = req.ghlUser;
    const [users] = await db.execute(
      `SELECT id, location_id, ghl_user_id, app_role, enabled, signature_png_url, created_at, updated_at
       FROM app_user_access
       WHERE location_id = ?
       ORDER BY created_at DESC`,
      [locationId]
    );

    res.json({ users });
  } catch (err) {
    console.error('[Auth Users] List error:', err.message);
    res.status(500).json({ error: 'Failed to list user permissions.' });
  }
});

router.post('/users', ghlAuthMiddleware, loadAppUser, requirePermission('users:manage'), async (req, res) => {
  try {
    const { locationId } = req.ghlUser;
    const { ghlUserId, appRole = 'SALES', enabled = true, signature_png_url = null } = req.body;

    if (!ghlUserId) {
      return res.status(400).json({ error: 'ghlUserId is required.' });
    }
    if (!['SUPER_ADMIN', 'ADMIN', 'SALES'].includes(appRole)) {
      return res.status(400).json({ error: 'Invalid app role.' });
    }

    const [result] = await db.execute(
      `INSERT INTO app_user_access (location_id, ghl_user_id, app_role, enabled, signature_png_url)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE app_role = VALUES(app_role), enabled = VALUES(enabled), signature_png_url = COALESCE(VALUES(signature_png_url), signature_png_url), updated_at = NOW()`,
      [locationId, ghlUserId, appRole, enabled, signature_png_url]
    );

    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('[Auth Users] Grant error:', err.message);
    res.status(500).json({ error: 'Failed to grant user access.' });
  }
});

router.put('/users/:id', ghlAuthMiddleware, loadAppUser, requirePermission('users:manage'), async (req, res) => {
  try {
    const { locationId } = req.ghlUser;
    const { appRole, enabled, signature_png_url } = req.body;

    await db.execute(
      `UPDATE app_user_access
       SET app_role = COALESCE(?, app_role),
           enabled = COALESCE(?, enabled),
           signature_png_url = CASE WHEN ? = 1 THEN ? ELSE signature_png_url END,
           updated_at = NOW()
       WHERE id = ? AND location_id = ?`,
      [
        appRole || null,
        enabled !== undefined ? enabled : null,
        signature_png_url !== undefined ? 1 : 0,
        signature_png_url !== undefined ? signature_png_url : null,
        req.params.id,
        locationId
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('[Auth Users] Update error:', err.message);
    res.status(500).json({ error: 'Failed to update user access.' });
  }
});

router.post('/users/:id/signature', ghlAuthMiddleware, loadAppUser, requirePermission('users:manage'), async (req, res) => {
  try {
    const { locationId, privateToken } = req.ghlUser;
    let { signaturePng } = req.body;

    if (signaturePng && signaturePng.startsWith('data:image/')) {
      try {
        const matches = signaturePng.match(/^data:([A-Za-z0-9-+\/]+);base64,(.+)$/);
        if (matches) {
          const mimeType = matches[1];
          const buffer = Buffer.from(matches[2], 'base64');
          const ext = mimeType.includes('png') ? 'png' : 'jpg';
          const filename = `sig_user_${req.params.id}_${Date.now()}.${ext}`;
          const ghlUrl = await ghlService.uploadMediaFile({
            locationId,
            buffer,
            filename,
            mimeType,
            privateToken,
          });
          if (ghlUrl) {
            signaturePng = ghlUrl;
          }
        }
      } catch (uploadErr) {
        console.warn('[Auth Signature] GHL Media upload fallback notice:', uploadErr.message);
      }
    }

    await db.execute(
      'UPDATE app_user_access SET signature_png_url = ?, updated_at = NOW() WHERE id = ? AND location_id = ?',
      [signaturePng || null, req.params.id, locationId]
    );
    res.json({ success: true, signature_png_url: signaturePng || null });
  } catch (err) {
    console.error('[Auth Users] Signature upload error:', err.message);
    res.status(500).json({ error: 'Failed to save user signature.' });
  }
});

router.delete('/users/:id', ghlAuthMiddleware, loadAppUser, requirePermission('users:manage'), async (req, res) => {
  try {
    const { locationId } = req.ghlUser;
    await db.execute(
      'DELETE FROM app_user_access WHERE id = ? AND location_id = ?',
      [req.params.id, locationId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('[Auth Users] Delete error:', err.message);
    res.status(500).json({ error: 'Failed to revoke user access.' });
  }
});

module.exports = router;
