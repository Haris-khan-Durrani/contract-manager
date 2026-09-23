/**
 * formulaEngine.js — Safe Mathematical Expression Parser
 *
 * SECURITY: This engine NEVER uses eval(), new Function(), or any dynamic
 * code execution mechanism. All computation is done through explicit parsing.
 *
 * Supported operations:
 *   +, -, *, /, %
 *   min(a, b)
 *   max(a, b)
 *   round(value, decimals?)
 *   percentage(value, pct)   → value * pct / 100
 *
 * Calculated fields in forms reference other fields by their key:
 *   "formula": "professional_fee + government_fee + vat_amount"
 *   "formula": "round(total * 0.05, 2)"
 *   "formula": "percentage(contract_amount, 20)"
 *
 * Values are resolved from the context object.
 */

/**
 * Tokenize an expression string into tokens.
 * Supports: numbers, identifiers, operators, parentheses, commas.
 */
function tokenize(expr) {
  const tokens = [];
  let i = 0;

  while (i < expr.length) {
    const ch = expr[i];

    // Whitespace
    if (/\s/.test(ch)) { i++; continue; }

    // Number (integer or decimal)
    if (/[0-9.]/.test(ch)) {
      let num = '';
      while (i < expr.length && /[0-9.]/.test(expr[i])) num += expr[i++];
      tokens.push({ type: 'NUMBER', value: parseFloat(num) });
      continue;
    }

    // Identifier or function name
    if (/[a-zA-Z_]/.test(ch)) {
      let ident = '';
      while (i < expr.length && /[a-zA-Z0-9_.]/.test(expr[i])) ident += expr[i++];
      tokens.push({ type: 'IDENT', value: ident });
      continue;
    }

    // Operators and punctuation
    if (['+', '-', '*', '/', '%', '(', ')', ','].includes(ch)) {
      tokens.push({ type: 'OP', value: ch });
      i++;
      continue;
    }

    throw new Error(`[FormulaEngine] Unsupported character: "${ch}" in expression: "${expr}"`);
  }

  return tokens;
}

/**
 * Parser: Recursive Descent for safe arithmetic expressions.
 */
class Parser {
  constructor(tokens, context) {
    this.tokens  = tokens;
    this.pos     = 0;
    this.context = context;
  }

  peek()    { return this.tokens[this.pos]; }
  consume() { return this.tokens[this.pos++]; }

  expect(type, value) {
    const t = this.consume();
    if (t?.type !== type || (value !== undefined && t.value !== value)) {
      throw new Error(`[FormulaEngine] Expected ${type} "${value}", got ${t?.type} "${t?.value}"`);
    }
    return t;
  }

  parse() {
    const result = this.parseAddSub();
    if (this.peek()) {
      throw new Error(`[FormulaEngine] Unexpected token: "${this.peek().value}"`);
    }
    return result;
  }

  parseAddSub() {
    let left = this.parseMulDiv();
    while (this.peek() && ['+', '-'].includes(this.peek().value)) {
      const op = this.consume().value;
      const right = this.parseMulDiv();
      left = op === '+' ? left + right : left - right;
    }
    return left;
  }

  parseMulDiv() {
    let left = this.parseUnary();
    while (this.peek() && ['*', '/', '%'].includes(this.peek().value)) {
      const op = this.consume().value;
      const right = this.parseUnary();
      if (op === '*') left = left * right;
      else if (op === '/') left = right !== 0 ? left / right : 0;
      else left = left % right;
    }
    return left;
  }

  parseUnary() {
    if (this.peek()?.value === '-') {
      this.consume();
      return -this.parsePrimary();
    }
    return this.parsePrimary();
  }

  parsePrimary() {
    const t = this.peek();
    if (!t) throw new Error('[FormulaEngine] Unexpected end of expression.');

    // Number literal
    if (t.type === 'NUMBER') {
      this.consume();
      return t.value;
    }

    // Identifier — could be a function call or a context field reference
    if (t.type === 'IDENT') {
      this.consume();
      const name = t.value;

      // Check if next token is '(' — function call
      if (this.peek()?.value === '(') {
        this.consume(); // consume '('
        const args = [];
        while (!(this.peek()?.value === ')')) {
          args.push(this.parseAddSub());
          if (this.peek()?.value === ',') this.consume();
        }
        this.expect('OP', ')');
        return this.callFunction(name, args);
      }

      // Context field reference — resolve from data context
      return this.resolveIdent(name);
    }

    // Parenthesised sub-expression
    if (t.value === '(') {
      this.consume();
      const val = this.parseAddSub();
      this.expect('OP', ')');
      return val;
    }

    throw new Error(`[FormulaEngine] Unexpected token: "${t.value}"`);
  }

  resolveIdent(name) {
    // Support dot notation: e.g. "form.contract_amount"
    const parts = name.split('.');
    let current = this.context;
    for (const part of parts) {
      if (current == null) return 0;
      current = current[part];
    }
    const num = parseFloat(current);
    return isNaN(num) ? 0 : num;
  }

  callFunction(name, args) {
    switch (name) {
      case 'min':        return Math.min(...args);
      case 'max':        return Math.max(...args);
      case 'round':      return args.length >= 2
        ? Math.round(args[0] * Math.pow(10, args[1])) / Math.pow(10, args[1])
        : Math.round(args[0]);
      case 'percentage': return args.length >= 2 ? (args[0] * args[1]) / 100 : 0;
      default:
        throw new Error(`[FormulaEngine] Unknown function: "${name}". Allowed: min, max, round, percentage.`);
    }
  }
}

/**
 * Evaluate a formula expression string safely.
 * @param {string} formula  — e.g. "professional_fee + government_fee + percentage(contract_amount, 5)"
 * @param {object} context  — flat or nested object with field values
 * @returns {number}
 */
function evaluate(formula, context = {}) {
  if (!formula || typeof formula !== 'string') return 0;

  try {
    const tokens = tokenize(formula.trim());
    const parser = new Parser(tokens, context);
    const result = parser.parse();
    return typeof result === 'number' && isFinite(result) ? result : 0;
  } catch (err) {
    console.error(`[FormulaEngine] Evaluation error: ${err.message}`);
    return 0;
  }
}

/**
 * Resolve all calculated fields in a form schema against the current context.
 * @param {Array}  fields  — form field schema array
 * @param {object} context
 * @returns {object} — map of { fieldKey: computedValue }
 */
function resolveCalculatedFields(fields, context) {
  const results = {};
  const calcFields = fields.filter(f => f.type === 'calculated' && f.formula);

  for (const field of calcFields) {
    const mergedContext = { ...context, ...results }; // Later calcs can reference earlier ones
    results[field.key] = evaluate(field.formula, mergedContext);
  }

  return results;
}

module.exports = { evaluate, resolveCalculatedFields };
