/**
 * rbac.js — Role-Based Access Control Middleware
 *
 * After ghlAuthMiddleware sets req.ghlUser, this middleware:
 *  1. Ensures user exists in app_user_access (auto-provisions with GHL CRM role if new).
 *  2. Rejects explicitly disabled users (enabled = false).
 *  3. Enforces role-level permission checks per route.
 */
const db = require('../config/db');

/**
 * Permission Matrix
 * Maps a permission key to the minimum roles that may perform it.
 */
const PERMISSIONS = {
  'template:create':       ['ADMIN', 'SUPER_ADMIN'],
  'template:edit':         ['ADMIN', 'SUPER_ADMIN'],
  'template:delete':       ['SUPER_ADMIN'],
  'form:create':           ['ADMIN', 'SUPER_ADMIN'],
  'form:edit':             ['ADMIN', 'SUPER_ADMIN'],
  'ghl:field:map':         ['ADMIN', 'SUPER_ADMIN'],
  'ghl:field:create':      ['ADMIN', 'SUPER_ADMIN'],
  'contract:create':       ['SALES', 'ADMIN', 'SUPER_ADMIN'],
  'contract:form:submit':  ['SALES', 'ADMIN', 'SUPER_ADMIN'],
  'contract:send':         ['SALES', 'ADMIN', 'SUPER_ADMIN'],
  'contract:view:all':     ['ADMIN', 'SUPER_ADMIN'],
  'contract:view:own':     ['SALES', 'ADMIN', 'SUPER_ADMIN'],
  'contract:cancel':       ['ADMIN', 'SUPER_ADMIN'],
  'contract:supersede':    ['ADMIN', 'SUPER_ADMIN'],
  'audit:view:all':        ['ADMIN', 'SUPER_ADMIN'],
  'audit:view:own':        ['SALES', 'ADMIN', 'SUPER_ADMIN'],
  'user:manage':           ['SUPER_ADMIN', 'ADMIN'],
  'users:manage':          ['SUPER_ADMIN', 'ADMIN'],
  'role:manage':           ['SUPER_ADMIN', 'ADMIN'],
  'settings:manage':       ['SUPER_ADMIN', 'ADMIN'],
  'settings:view':         ['SALES', 'ADMIN', 'SUPER_ADMIN'],
};

/**
 * Middleware factory: load app_user_access record and attach to req.appUser.
 * Always call this after ghlAuthMiddleware.
 */
async function loadAppUser(req, res, next) {
  try {
    const { userId, locationId, role = 'SALES' } = req.ghlUser;

    const [rows] = await db.execute(
      'SELECT id, app_role, enabled FROM app_user_access WHERE location_id = ? AND ghl_user_id = ? LIMIT 1',
      [locationId, userId]
    ).catch(() => [[]]);

    if (rows.length) {
      if (!rows[0].enabled) {
        return res.status(403).json({
          error: 'Access Denied',
          message: "Your user account has been disabled for this location. Please contact your administrator.",
        });
      }
      req.appUser = {
        id:   rows[0].id,
        role: rows[0].app_role,
      };
    } else {
      // Auto-provision user access record based on verified GHL CRM role
      const initialRole = ['SUPER_ADMIN', 'ADMIN'].includes(role) ? role : 'SALES';
      const [insertResult] = await db.execute(
        `INSERT INTO app_user_access (location_id, ghl_user_id, app_role, enabled)
         VALUES (?, ?, ?, TRUE)
         ON DUPLICATE KEY UPDATE updated_at = NOW()`,
        [locationId, userId, initialRole]
      ).catch(err => {
        console.warn('[RBAC] Could not auto-insert user access:', err.message);
        return [{ insertId: 0 }];
      });

      req.appUser = {
        id:   insertResult?.insertId || 0,
        role: initialRole,
      };
    }

    next();
  } catch (err) {
    console.error('[RBAC] loadAppUser error:', err.message);
    return res.status(500).json({ error: 'Authorization check failed.' });
  }
}

/**
 * Middleware factory: require specific roles.
 * @param {string[]} roles — e.g. ['ADMIN', 'SUPER_ADMIN']
 */
function requireRole(roles) {
  return (req, res, next) => {
    if (!req.appUser) {
      return res.status(403).json({ error: 'App user context not loaded. Call loadAppUser first.' });
    }
    if (!roles.includes(req.appUser.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `This action requires one of the following roles: ${roles.join(', ')}.`,
      });
    }
    next();
  };
}

/**
 * Middleware factory: require a named permission.
 * @param {string} permission — key from PERMISSIONS map
 */
function requirePermission(permission) {
  const allowedRoles = PERMISSIONS[permission] || [];
  return requireRole(allowedRoles);
}

/**
 * Utility: check if a role has a permission (for use in controllers).
 */
function hasPermission(role, permission) {
  const allowedRoles = PERMISSIONS[permission] || [];
  return allowedRoles.includes(role);
}

module.exports = { loadAppUser, requireRole, requirePermission, hasPermission, PERMISSIONS };
