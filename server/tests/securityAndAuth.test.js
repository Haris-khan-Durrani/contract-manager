/**
 * securityAndAuth.test.js
 *
 * Tests:
 *  1. GHL Signed Context token verification (valid JWT)
 *  2. Tampered JWT signature rejection
 *  3. Expired JWT rejection
 *  4. Middleware rejects query param authentication attempts (security critical)
 */
const assert = require('assert');
const jwt    = require('jsonwebtoken');
const { verifyGHLSignedContext, ghlAuthMiddleware } = require('../src/middleware/ghlAuth');

console.log('🧪 Running Security & Authentication Test Suite…\n');

let passed = 0;
let failed = 0;

function it(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ ${name}:`, err.message);
    failed++;
  }
}

const SECRET = process.env.GHL_SHARED_SECRET || 'development_shared_secret_for_testing';

// ── 1. Valid Token Verification ─────────────────────────────────────────────
it('Verifies valid GHL Signed Context JWT correctly', () => {
  const payload = {
    userId:     'user_123',
    locationId: 'loc_456',
    name:       'Jane Sales',
    email:      'jane@company.com',
  };
  const token = jwt.sign(payload, SECRET, { expiresIn: '1h' });

  const verified = verifyGHLSignedContext(token);
  assert.strictEqual(verified.userId, 'user_123');
  assert.strictEqual(verified.locationId, 'loc_456');
  assert.strictEqual(verified.email, 'jane@company.com');
});

// ── 2. Tampered Signature Rejection ─────────────────────────────────────────
it('Strictly rejects tampered JWT signature', () => {
  const token = jwt.sign({ userId: 'user_123', locationId: 'loc_456' }, 'WRONG_SECRET');
  let rejected = false;
  try {
    verifyGHLSignedContext(token);
  } catch {
    rejected = true;
  }
  assert.strictEqual(rejected, true, 'Tampered token was not rejected!');
});

// ── 3. Expired Token Rejection ──────────────────────────────────────────────
it('Strictly rejects expired JWT token', () => {
  const token = jwt.sign(
    { userId: 'user_123', locationId: 'loc_456' },
    SECRET,
    { expiresIn: -10 } // Expired 10 seconds ago
  );
  let rejected = false;
  try {
    verifyGHLSignedContext(token);
  } catch {
    rejected = true;
  }
  assert.strictEqual(rejected, true, 'Expired token was not rejected!');
});

// ── 4. URL Query Param Auth Attack Prevention ────────────────────────────────
it('Middleware strictly ignores and rejects query param tokens', (done) => {
  const req = {
    headers: {},
    query: { token: 'attacker_provided_token' },
  };
  let statusCode = 0;
  let responseData = null;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
    },
  };

  const next = () => {
    assert.fail('Middleware allowed request without Authorization header!');
  };

  ghlAuthMiddleware(req, res, next);
  assert.strictEqual(statusCode, 401);
  assert.strictEqual(responseData?.error, 'Unauthorized');
});

// ── 5. Empty / Missing Header Rejection ──────────────────────────────────────
it('Middleware rejects missing Authorization header', () => {
  const req = { headers: {} };
  let statusCode = 0;
  const res = {
    status(code) { statusCode = code; return this; },
    json() {},
  };
  ghlAuthMiddleware(req, res, () => {});
  assert.strictEqual(statusCode, 401);
});

console.log(`\nSecurity & Auth Results: ${passed} passed, ${failed} failed.\n`);
if (failed > 0) process.exit(1);
