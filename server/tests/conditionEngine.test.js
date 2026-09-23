/**
 * conditionEngine.test.js
 *
 * Tests all 14 authoritative comparison operators + nested AND/OR logic.
 */
const assert = require('assert');
const conditionEngine = require('../src/services/conditionEngine');

console.log('🧪 Running Condition Engine Test Suite…\n');

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

// ── 1. Equality & Negation ──────────────────────────────────────────────────
it('EQUALS operator with matching string', () => {
  const rule = { field: 'plan', operator: 'EQUALS', value: 'Enterprise' };
  assert.strictEqual(conditionEngine.evaluateRule(rule, { plan: 'Enterprise' }), true);
  assert.strictEqual(conditionEngine.evaluateRule(rule, { plan: 'Starter' }), false);
});

it('EQUALS operator with case-insensitivity', () => {
  const rule = { field: 'status', operator: 'EQUALS', value: 'active' };
  assert.strictEqual(conditionEngine.evaluateRule(rule, { status: 'ACTIVE' }), true);
});

it('NOT_EQUALS operator', () => {
  const rule = { field: 'state', operator: 'NOT_EQUALS', value: 'TX' };
  assert.strictEqual(conditionEngine.evaluateRule(rule, { state: 'CA' }), true);
  assert.strictEqual(conditionEngine.evaluateRule(rule, { state: 'TX' }), false);
});

// ── 2. Numeric Comparisons ──────────────────────────────────────────────────
it('GREATER_THAN operator', () => {
  const rule = { field: 'deal_value', operator: 'GREATER_THAN', value: 5000 };
  assert.strictEqual(conditionEngine.evaluateRule(rule, { deal_value: 10000 }), true);
  assert.strictEqual(conditionEngine.evaluateRule(rule, { deal_value: 5000 }), false);
  assert.strictEqual(conditionEngine.evaluateRule(rule, { deal_value: 2000 }), false);
});

it('GREATER_THAN_OR_EQUAL operator', () => {
  const rule = { field: 'qty', operator: 'GREATER_THAN_OR_EQUAL', value: 10 };
  assert.strictEqual(conditionEngine.evaluateRule(rule, { qty: 10 }), true);
  assert.strictEqual(conditionEngine.evaluateRule(rule, { qty: 9 }), false);
});

it('LESS_THAN operator', () => {
  const rule = { field: 'discount', operator: 'LESS_THAN', value: 0.2 };
  assert.strictEqual(conditionEngine.evaluateRule(rule, { discount: 0.15 }), true);
  assert.strictEqual(conditionEngine.evaluateRule(rule, { discount: 0.25 }), false);
});

it('LESS_THAN_OR_EQUAL operator', () => {
  const rule = { field: 'risk_score', operator: 'LESS_THAN_OR_EQUAL', value: 50 };
  assert.strictEqual(conditionEngine.evaluateRule(rule, { risk_score: 50 }), true);
  assert.strictEqual(conditionEngine.evaluateRule(rule, { risk_score: 51 }), false);
});

// ── 3. String Partial Matching ──────────────────────────────────────────────
it('CONTAINS operator', () => {
  const rule = { field: 'company', operator: 'CONTAINS', value: 'Corp' };
  assert.strictEqual(conditionEngine.evaluateRule(rule, { company: 'Acme Corp International' }), true);
  assert.strictEqual(conditionEngine.evaluateRule(rule, { company: 'Globex Ltd' }), false);
});

it('NOT_CONTAINS operator', () => {
  const rule = { field: 'domain', operator: 'NOT_CONTAINS', value: 'gmail' };
  assert.strictEqual(conditionEngine.evaluateRule(rule, { domain: 'enterprise.com' }), true);
  assert.strictEqual(conditionEngine.evaluateRule(rule, { domain: 'john@gmail.com' }), false);
});

it('STARTS_WITH operator', () => {
  const rule = { field: 'sku', operator: 'STARTS_WITH', value: 'PROD-' };
  assert.strictEqual(conditionEngine.evaluateRule(rule, { sku: 'PROD-9982' }), true);
  assert.strictEqual(conditionEngine.evaluateRule(rule, { sku: 'SERV-1002' }), false);
});

it('ENDS_WITH operator', () => {
  const rule = { field: 'filename', operator: 'ENDS_WITH', value: '.pdf' };
  assert.strictEqual(conditionEngine.evaluateRule(rule, { filename: 'document.pdf' }), true);
  assert.strictEqual(conditionEngine.evaluateRule(rule, { filename: 'image.png' }), false);
});

// ── 4. List Membership ──────────────────────────────────────────────────────
it('IN operator with comma-separated list or array', () => {
  const rule = { field: 'tier', operator: 'IN', value: 'Gold, Platinum, Diamond' };
  assert.strictEqual(conditionEngine.evaluateRule(rule, { tier: 'Platinum' }), true);
  assert.strictEqual(conditionEngine.evaluateRule(rule, { tier: 'Silver' }), false);
});

it('NOT_IN operator', () => {
  const rule = { field: 'status', operator: 'NOT_IN', value: 'cancelled, archived' };
  assert.strictEqual(conditionEngine.evaluateRule(rule, { status: 'active' }), true);
  assert.strictEqual(conditionEngine.evaluateRule(rule, { status: 'cancelled' }), false);
});

// ── 5. Null & Empty Checks ──────────────────────────────────────────────────
it('IS_EMPTY operator', () => {
  const rule = { field: 'notes', operator: 'IS_EMPTY' };
  assert.strictEqual(conditionEngine.evaluateRule(rule, { notes: '' }), true);
  assert.strictEqual(conditionEngine.evaluateRule(rule, { notes: null }), true);
  assert.strictEqual(conditionEngine.evaluateRule(rule, {}), true);
  assert.strictEqual(conditionEngine.evaluateRule(rule, { notes: 'Some notes' }), false);
});

it('IS_NOT_EMPTY operator', () => {
  const rule = { field: 'tax_id', operator: 'IS_NOT_EMPTY' };
  assert.strictEqual(conditionEngine.evaluateRule(rule, { tax_id: 'US-991823' }), true);
  assert.strictEqual(conditionEngine.evaluateRule(rule, { tax_id: '' }), false);
  assert.strictEqual(conditionEngine.evaluateRule(rule, { tax_id: null }), false);
});

// ── 6. Nested AND / OR Evaluation ───────────────────────────────────────────
it('Compound AND group', () => {
  const group = {
    logicalOperator: 'AND',
    conditions: [
      { field: 'deal_value', operator: 'GREATER_THAN', value: 10000 },
      { field: 'region',     operator: 'EQUALS',       value: 'EMEA' },
    ],
  };
  assert.strictEqual(conditionEngine.evaluateRuleGroup(group, { deal_value: 20000, region: 'EMEA' }), true);
  assert.strictEqual(conditionEngine.evaluateRuleGroup(group, { deal_value: 20000, region: 'APAC' }), false);
  assert.strictEqual(conditionEngine.evaluateRuleGroup(group, { deal_value: 5000,  region: 'EMEA' }), false);
});

it('Compound OR group', () => {
  const group = {
    logicalOperator: 'OR',
    conditions: [
      { field: 'tier',     operator: 'EQUALS', value: 'VIP' },
      { field: 'revenue',  operator: 'GREATER_THAN', value: 50000 },
    ],
  };
  assert.strictEqual(conditionEngine.evaluateRuleGroup(group, { tier: 'VIP', revenue: 1000 }), true);
  assert.strictEqual(conditionEngine.evaluateRuleGroup(group, { tier: 'Regular', revenue: 75000 }), true);
  assert.strictEqual(conditionEngine.evaluateRuleGroup(group, { tier: 'Regular', revenue: 10000 }), false);
});

console.log(`\nCondition Engine Results: ${passed} passed, ${failed} failed.\n`);
if (failed > 0) process.exit(1);
