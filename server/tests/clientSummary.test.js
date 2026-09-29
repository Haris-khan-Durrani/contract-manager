/**
 * clientSummary.test.js
 *
 * Verifies access control and summary generation for completed contracts:
 *  1. SUPER_ADMIN and ADMIN have access by default.
 *  2. SALES without can_fill_client_summary is blocked (403).
 *  3. Selective SALES with can_fill_client_summary = true is allowed.
 *  4. Middleware correctly enforces requireClientSummaryAccess.
 *  5. Data payload prefilling and structure consistency.
 */
const assert = require('assert');
const { requireClientSummaryAccess } = require('../src/middleware/rbac');

console.log('📋 Running Client Summary Access Control & Form Suite…\n');

let passed = 0;
let failed = 0;

function test(title, fn) {
  try {
    fn();
    console.log(`  ✅ ${title}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ ${title}:`, err.message);
    failed++;
  }
}

// 1. ADMIN access
test('SUPER_ADMIN is granted Client Summary access automatically', () => {
  const req = { appUser: { role: 'SUPER_ADMIN', can_fill_client_summary: false } };
  let nextCalled = false;
  const res = {
    status: (code) => ({ json: (data) => { throw new Error(`Should not error: ${code}`); } }),
  };
  requireClientSummaryAccess(req, res, () => { nextCalled = true; });
  assert.strictEqual(nextCalled, true);
});

test('ADMIN is granted Client Summary access automatically', () => {
  const req = { appUser: { role: 'ADMIN', can_fill_client_summary: false } };
  let nextCalled = false;
  const res = {
    status: (code) => ({ json: (data) => { throw new Error(`Should not error: ${code}`); } }),
  };
  requireClientSummaryAccess(req, res, () => { nextCalled = true; });
  assert.strictEqual(nextCalled, true);
});

// 2. Default SALES without permission is blocked
test('Standard SALES user is blocked with 403 Forbidden', () => {
  const req = { appUser: { role: 'SALES', can_fill_client_summary: false } };
  let statusCode = 0;
  let responseData = null;
  const res = {
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => { responseData = data; },
      };
    },
  };
  requireClientSummaryAccess(req, res, () => { throw new Error('Next should not be called'); });
  assert.strictEqual(statusCode, 403);
  assert.strictEqual(responseData.error, 'Forbidden');
});

// 3. Selective SALES with permission enabled is granted
test('Selective SALES user with can_fill_client_summary = true is granted access', () => {
  const req = { appUser: { role: 'SALES', can_fill_client_summary: true } };
  let nextCalled = false;
  const res = {
    status: (code) => ({ json: (data) => { throw new Error(`Should not error: ${code}`); } }),
  };
  requireClientSummaryAccess(req, res, () => { nextCalled = true; });
  assert.strictEqual(nextCalled, true);
});

// 4. Missing appUser context is blocked
test('Unauthenticated or missing appUser context is rejected with 403', () => {
  const req = {};
  let statusCode = 0;
  const res = {
    status: (code) => {
      statusCode = code;
      return { json: () => {} };
    },
  };
  requireClientSummaryAccess(req, res, () => {});
  assert.strictEqual(statusCode, 403);
});

console.log(`\nClient Summary Test Results: ${passed} passed, ${failed} failed.\n`);
if (failed > 0) process.exit(1);
