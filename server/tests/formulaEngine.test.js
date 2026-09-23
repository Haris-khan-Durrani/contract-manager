/**
 * formulaEngine.test.js
 *
 * Tests safe math evaluation and asserts that dangerous JS/eval expressions fail.
 */
const assert = require('assert');
const formulaEngine = require('../src/services/formulaEngine');

console.log('🧪 Running Safe Formula Engine Test Suite…\n');

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

// ── Basic Arithmetic ────────────────────────────────────────────────────────
it('Basic addition and subtraction', () => {
  assert.strictEqual(formulaEngine.evaluate('10 + 5 - 3', {}), 12);
});

it('Operator precedence (* and / over + and -)', () => {
  assert.strictEqual(formulaEngine.evaluate('10 + 5 * 2', {}), 20);
  assert.strictEqual(formulaEngine.evaluate('20 - 10 / 2', {}), 15);
});

it('Parentheses overriding precedence', () => {
  assert.strictEqual(formulaEngine.evaluate('(10 + 5) * 2', {}), 30);
});

it('Variables interpolation', () => {
  const vars = { rate: 150, hours: 40, discount: 0.1 };
  const res = formulaEngine.evaluate('rate * hours * (1 - discount)', vars);
  assert.strictEqual(res, 5400);
});

it('Built-in math functions: min, max, round, percentage', () => {
  assert.strictEqual(formulaEngine.evaluate('min(10, 20)', {}), 10);
  assert.strictEqual(formulaEngine.evaluate('max(10, 20)', {}), 20);
  assert.strictEqual(formulaEngine.evaluate('round(10.5678, 2)', {}), 10.57);
  assert.strictEqual(formulaEngine.evaluate('percentage(500, 20)', {}), 100);
});

it('Handles floating point decimals cleanly', () => {
  const res = formulaEngine.evaluate('10.5 * 2 + 0.25', {});
  assert.strictEqual(res, 21.25);
});

// ── Zero-Eval Security Verification ─────────────────────────────────────────
it('Rejects JavaScript code execution attempts (process.exit, require, etc.) safely returning 0', () => {
  const res = formulaEngine.evaluate('process.exit(1)', {});
  assert.strictEqual(res, 0, 'Dangerous process.exit was executed!');
});

it('Rejects alert, console, and function calls safely returning 0', () => {
  const res = formulaEngine.evaluate('console.log("hacked")', {});
  assert.strictEqual(res, 0, 'Dangerous console.log was executed!');
});

it('Rejects semicolon statement chaining safely returning 0', () => {
  const res = formulaEngine.evaluate('10 + 5; evil()', {});
  assert.strictEqual(res, 0, 'Semicolon chaining was executed!');
});

console.log(`\nFormula Engine Results: ${passed} passed, ${failed} failed.\n`);
if (failed > 0) process.exit(1);
