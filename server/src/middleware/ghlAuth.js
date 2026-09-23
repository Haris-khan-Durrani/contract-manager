/**
 * ghlAuth.js — GoHighLevel Direct Authentication & Session Middleware
 *
 * Authenticates requests via Bearer JWT session token containing:
 * { userId, locationId, privateToken, role, name, email }
 *
 * Populates req.ghlUser with the authenticated credentials.
 */
const jwt = require('jsonwebtoken');
const settingsService = require('../services/settingsService');

/**
 * Sign a new session JWT token with user credentials and GHL context.
 */
function createSessionToken(payload) {
  const secret = settingsService.get('JWT_SECRET', 'contractmanager_secure_jwt_secret_dev');
  const expiresIn = settingsService.get('JWT_EXPIRES_IN', '7d');
  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Verify Session JWT token.
 * Falls back to GHL_SHARED_SECRET if signed by legacy secret.
 */
function verifySessionToken(token) {
  const jwtSecret = settingsService.get('JWT_SECRET', 'contractmanager_secure_jwt_secret_dev');
  const ghlSecret = settingsService.get('GHL_SHARED_SECRET', 'development_shared_secret_for_testing');

  try {
    return jwt.verify(token, jwtSecret);
  } catch (err) {
    try {
      return jwt.verify(token, ghlSecret);
    } catch (err2) {
      throw new Error(`Invalid or expired session token: ${err.message}`);
    }
  }
}

/**
 * Backward compatibility alias for verifyGHLSignedContext
 */
function verifyGHLSignedContext(token) {
  return verifySessionToken(token);
}

/**
 * Express middleware: authenticate requests via Bearer session token.
 * Attaches req.ghlUser = { userId, locationId, privateToken, name, email, role }
 */
async function ghlAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid Authorization header. Please log in with your GoHighLevel credentials.',
      });
    }

    const token = authHeader.slice(7);
    const payload = verifySessionToken(token);

    if (!payload.userId || !payload.locationId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Session token is missing required fields (userId, locationId).',
      });
    }

    req.ghlUser = {
      userId:       payload.userId,
      locationId:   payload.locationId,
      privateToken: payload.privateToken || null,
      name:         payload.name || payload.full_name || 'GHL User',
      email:        payload.email || '',
      role:         payload.role || 'SALES',
    };

    req.appSession = { token };
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: err.message,
    });
  }
}

module.exports = {
  ghlAuthMiddleware,
  createSessionToken,
  verifySessionToken,
  verifyGHLSignedContext,
};
