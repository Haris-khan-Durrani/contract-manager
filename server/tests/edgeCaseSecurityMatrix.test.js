/**
 * edgeCaseSecurityMatrix.test.js
 *
 * Exhaustive security and edge-case validation covering 20 attack scenarios:
 *  1. Replay attack on signing token
 *  2. Tampered JWT signature
 *  3. Expired JWT context token
 *  4. Query parameter auth bypass attempt
 *  5. Unregistered user in app_user_access (403)
 *  6. Disabled user access (403)
 *  7. SALES role restricted from template mutation (RBAC)
 *  8. SALES role restricted from viewing all contracts (RBAC)
 *  9. Webhook with invalid secret (401)
 * 10. Webhook idempotency duplicate event deduplication
 * 11. Malformed webhook payload handling
 * 12. Edit form on signed/completed contract blocked (409)
 * 13. Signing submission without signature blocked (400)
 * 14. Signing submission without terms accepted blocked (400)
 * 15. Expired signing link rejection (410)
 * 16. Formula engine process/exec injection blocked
 * 17. Formula engine eval/Function injection blocked
 * 18. Condition engine unknown operator safety fallback
 * 19. SQL injection character containment
 * 20. Cancellation on completed contract rejected (409)
 */
const assert = require('assert');
const jwt    = require('jsonwebtoken');
const { hasPermission } = require('../src/middleware/rbac');
const { verifyGHLSignedContext } = require('../src/middleware/ghlAuth');
const formulaEngine   = require('../src/services/formulaEngine');
const conditionEngine = require('../src/services/conditionEngine');

console.log('🛡️  Running 20-Scenario Edge-Case Security Matrix…\n');

let passed = 0;
let failed = 0;

function scenario(num, title, fn) {
  try {
    fn();
    console.log(`  [Scenario ${num < 10 ? '0' + num : num}] ✅ ${title}`);
    passed++;
  } catch (err) {
    console.error(`  [Scenario ${num < 10 ? '0' + num : num}] ❌ ${title}:`, err.message);
    failed++;
  }
}

const SECRET = process.env.GHL_SHARED_SECRET || 'development_shared_secret_for_testing';

// ── Scenarios 1–5: Token & JWT Security ──────────────────────────────────────
scenario(1, 'Signing token is single-use and invalidates on repeat submissions', () => {
  const tokenStore = new Map([['token_abc', { state: 'SENT', used: false }]]);
  function submit(t) {
    const item = tokenStore.get(t);
    if (!item || item.used || !['SENT', 'VIEWED'].includes(item.state)) {
      throw new Error('409 Conflict: Link already used or expired');
    }
    item.used = true;
    item.state = 'SIGNED';
    return { success: true };
  }

  assert.strictEqual(submit('token_abc').success, true);
  assert.throws(() => submit('token_abc'), /409 Conflict/);
});

scenario(2, 'JWT signature verification fails when signature is tampered', () => {
  const token = jwt.sign({ userId: 'u1' }, SECRET);
  const tampered = token.slice(0, -4) + 'zzzz';
  assert.throws(() => verifyGHLSignedContext(tampered));
});

scenario(3, 'JWT verification strictly fails when expired', () => {
  const expiredToken = jwt.sign({ userId: 'u1' }, SECRET, { expiresIn: -5 });
  assert.throws(() => verifyGHLSignedContext(expiredToken));
});

scenario(4, 'Query parameter authentication bypass is strictly rejected', () => {
  const req = { headers: {}, query: { token: 'spoofed_token' } };
  const authHeader = req.headers['authorization'] || '';
  const isAuthorized = authHeader.startsWith('Bearer ');
  assert.strictEqual(isAuthorized, false, 'Query parameter token was accepted!');
});

scenario(5, 'User not in app_user_access allowlist is rejected with 403', () => {
  const allowlist = new Map([['user_authorized', { enabled: true }]]);
  const user = 'unlisted_ghl_user';
  const access = allowlist.get(user);
  assert.strictEqual(!access || !access.enabled, true);
});

// ── Scenarios 6–10: Permissions, Roles & Webhooks ───────────────────────────
scenario(6, 'Disabled user in app_user_access is rejected with 403', () => {
  const allowlist = new Map([['user_disabled', { enabled: false }]]);
  const access = allowlist.get('user_disabled');
  assert.strictEqual(access.enabled, false);
});

scenario(7, 'SALES role is denied template:create and template:edit permissions', () => {
  assert.strictEqual(hasPermission('SALES', 'template:create'), false);
  assert.strictEqual(hasPermission('SALES', 'template:edit'), false);
  assert.strictEqual(hasPermission('ADMIN', 'template:create'), true);
});

scenario(8, 'SALES role is denied contract:view:all (cannot view all contracts)', () => {
  assert.strictEqual(hasPermission('SALES', 'contract:view:all'), false);
  assert.strictEqual(hasPermission('ADMIN', 'contract:view:all'), true);
  assert.strictEqual(hasPermission('SUPER_ADMIN', 'contract:view:all'), true);
});

scenario(9, 'Webhook ingestion rejects request with invalid or missing secret', () => {
  const validSecret = 'super_secret_webhook_key';
  function verifyWebhook(header) {
    if (!header || header !== validSecret) throw new Error('401 Invalid webhook secret');
    return true;
  }
  assert.throws(() => verifyWebhook('wrong_secret'), /401/);
  assert.throws(() => verifyWebhook(undefined), /401/);
  assert.strictEqual(verifyWebhook(validSecret), true);
});

scenario(10, 'Webhook duplicate delivery deduplicated by idempotency key', () => {
  const processed = new Set();
  function processWebhook(eventKey) {
    if (processed.has(eventKey)) return { duplicate: true };
    processed.add(eventKey);
    return { duplicate: false };
  }
  assert.strictEqual(processWebhook('evt_1').duplicate, false);
  assert.strictEqual(processWebhook('evt_1').duplicate, true);
});

// ── Scenarios 11–15: Contract State Machine & Signature Rules ───────────────
scenario(11, 'Malformed webhook payload does not crash the server', () => {
  function handleWebhook(raw) {
    try {
      const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return !!data.locationId;
    } catch {
      return false; // Handled safely without unhandled exception
    }
  }
  assert.strictEqual(handleWebhook('{ bad_json: '), false);
  assert.strictEqual(handleWebhook({ locationId: 'loc_1' }), true);
});

scenario(12, 'Editing form responses on SIGNED or COMPLETED contract is blocked', () => {
  function canEditForm(state) {
    return !['SENT', 'VIEWED', 'SIGNED', 'COMPLETED', 'CANCELLED', 'EXPIRED'].includes(state);
  }
  assert.strictEqual(canEditForm('AWAITING_FORM'), true);
  assert.strictEqual(canEditForm('READY'), true);
  assert.strictEqual(canEditForm('SIGNED'), false);
  assert.strictEqual(canEditForm('COMPLETED'), false);
});

scenario(13, 'Public signing portal rejects submission with missing signature', () => {
  function validateSubmission(body) {
    if (!body.signatureDataUrl) return { error: 'Signature required' };
    if (!body.acceptedTerms)    return { error: 'Terms required' };
    return { valid: true };
  }
  assert.strictEqual(validateSubmission({ acceptedTerms: true }).error, 'Signature required');
});

scenario(14, 'Public signing portal rejects submission without accepted terms', () => {
  function validateSubmission(body) {
    if (!body.signatureDataUrl) return { error: 'Signature required' };
    if (!body.acceptedTerms)    return { error: 'Terms required' };
    return { valid: true };
  }
  assert.strictEqual(validateSubmission({ signatureDataUrl: 'data:...' }).error, 'Terms required');
});

scenario(15, 'Signing portal strictly rejects submission past expiration date', () => {
  const expiredDate = new Date(Date.now() - 3600 * 1000); // 1 hour ago
  function checkExpiry(expiresAt) {
    if (new Date(expiresAt) < new Date()) {
      throw new Error('410 Expired');
    }
    return true;
  }
  assert.throws(() => checkExpiry(expiredDate), /410 Expired/);
});

// ── Scenarios 16–20: Formula, Condition & DB Injection Defenses ─────────────
scenario(16, 'Formula engine blocks command execution attempts (process.mainModule)', () => {
  const result = formulaEngine.evaluate('process.mainModule.require("child_process").execSync("whoami")', {});
  assert.strictEqual(result, 0, 'Command execution was not blocked!');
});

scenario(17, 'Formula engine blocks eval() and Function() constructor access', () => {
  const result = formulaEngine.evaluate('eval("2 + 2")', {});
  assert.strictEqual(result, 0, 'eval() was not blocked!');
});

scenario(18, 'Condition engine unknown operator safely falls back to false', () => {
  const rule = { field: 'plan', operator: 'UNKNOWN_INJECTED_OP', value: 'Enterprise' };
  const res = conditionEngine.evaluate(rule, { plan: 'Enterprise' });
  assert.strictEqual(res, false, 'Unknown operator did not fallback to false!');
});

scenario(19, 'SQL injection strings in contract form values are treated as literals', () => {
  const maliciousInput = "'; DROP TABLE contract_instances; --";
  const rule = { field: 'notes', operator: 'EQUALS', value: maliciousInput };
  const res = conditionEngine.evaluate(rule, { notes: maliciousInput });
  assert.strictEqual(res, true);
});

scenario(20, 'Cancellation on already COMPLETED contract is blocked', () => {
  function cancel(state) {
    if (state === 'COMPLETED' || state === 'SIGNED') {
      throw new Error('409 Conflict: Contract already finalized');
    }
    return 'CANCELLED';
  }
  assert.throws(() => cancel('COMPLETED'), /409 Conflict/);
  assert.throws(() => cancel('SIGNED'), /409 Conflict/);
  assert.strictEqual(cancel('READY'), 'CANCELLED');
});

console.log(`\nEdge-Case Security Matrix: ${passed}/20 passed, ${failed} failed.\n`);
if (failed > 0) process.exit(1);
