/**
 * conditionEngine.js — Authoritative Shared Condition Engine
 *
 * This is the SINGLE condition evaluator used for:
 *   1. Form field visibility (show/hide)
 *   2. Contract clause inclusion/exclusion
 *   3. Template creation / webhook routing rules
 *   4. Validation logic
 *
 * The Vue frontend may run a mirrored version for instant UI preview,
 * but the backend is ALWAYS the authoritative result before snapshot.
 *
 * Condition JSON Schema:
 * {
 *   "operator": "AND" | "OR",
 *   "conditions": [
 *     { "field": "form.payment_type", "operator": "equals", "value": "installment" },
 *     { "operator": "OR", "conditions": [ ... ] }   ← nested groups
 *   ]
 * }
 *
 * Supported operators: equals, not_equals, contains, not_contains,
 * greater_than, less_than, greater_or_equal, less_or_equal,
 * is_empty, is_not_empty, in, not_in, starts_with, ends_with
 */

/**
 * Resolve a field path like "form.payment_type" against the data context.
 * @param {string} fieldPath — dot-notation field key, e.g. "form.payment_type"
 * @param {object} context — { form, contact, opportunity, calc, system }
 */
function resolveField(fieldPath, context) {
  if (!fieldPath || typeof fieldPath !== 'string') return undefined;
  if (context && context[fieldPath] !== undefined) return context[fieldPath];
  const parts = fieldPath.split('.');
  let current = context;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = current[part];
  }
  return current;
}

/**
 * Evaluate a single condition leaf node.
 * @param {object} condition — { field, operator, value }
 * @param {object} context
 */
function evaluateLeaf(condition, context) {
  const { field, operator, value } = condition;
  const actual = resolveField(field, context);
  const op = (operator || '').toLowerCase();

  switch (op) {
    case 'equals':
      return String(actual).toLowerCase() === String(value).toLowerCase();

    case 'not_equals':
      return String(actual).toLowerCase() !== String(value).toLowerCase();

    case 'contains':
      return typeof actual === 'string' && actual.toLowerCase().includes(String(value).toLowerCase());

    case 'not_contains':
      return !(typeof actual === 'string' && actual.toLowerCase().includes(String(value).toLowerCase()));

    case 'greater_than':
      return parseFloat(actual) > parseFloat(value);

    case 'less_than':
      return parseFloat(actual) < parseFloat(value);

    case 'greater_or_equal':
    case 'greater_than_or_equal':
      return parseFloat(actual) >= parseFloat(value);

    case 'less_or_equal':
    case 'less_than_or_equal':
      return parseFloat(actual) <= parseFloat(value);

    case 'is_empty':
      return actual === null || actual === undefined || actual === '';

    case 'is_not_empty':
      return actual !== null && actual !== undefined && actual !== '';

    case 'in': {
      const list = Array.isArray(value)
        ? value
        : String(value || '').split(',').map(s => s.trim());
      return list.map(v => String(v).toLowerCase()).includes(String(actual).toLowerCase());
    }

    case 'not_in': {
      const list = Array.isArray(value)
        ? value
        : String(value || '').split(',').map(s => s.trim());
      return !list.map(v => String(v).toLowerCase()).includes(String(actual).toLowerCase());
    }

    case 'starts_with':
      return typeof actual === 'string' && actual.toLowerCase().startsWith(String(value).toLowerCase());

    case 'ends_with':
      return typeof actual === 'string' && actual.toLowerCase().endsWith(String(value).toLowerCase());

    default:
      console.warn(`[ConditionEngine] Unknown operator: "${operator}". Defaulting to false.`);
      return false;
  }
}

/**
 * Recursively evaluate a condition group or leaf.
 * @param {object} node — either a group { operator, conditions } or a leaf { field, operator, value }
 * @param {object} context
 */
function evaluate(node, context) {
  if (!node || typeof node !== 'object') return true;

  // Group node: has a logical operator and sub-conditions
  if (Array.isArray(node.conditions)) {
    const results = node.conditions.map(child => evaluate(child, context));
    const op = (node.operator || node.logicalOperator || 'AND').toUpperCase();

    if (op === 'OR')  return results.some(Boolean);
    return results.every(Boolean);
  }

  // Leaf node: direct field comparison
  return evaluateLeaf(node, context);
}

/**
 * Filter a list of form fields to only visible ones based on their visibilityRules.
 * @param {Array}  fields  — form field schema array
 * @param {object} context — current form values context
 */
function getVisibleFields(fields, context) {
  return fields.filter(field => {
    if (!field.visibilityRules) return true; // No rule = always visible
    return evaluate(field.visibilityRules, context);
  });
}

/**
 * Filter contract document blocks to only active ones based on conditions.
 * @param {Array}  blocks  — document schema block array (clauses, sections)
 * @param {object} context — current data context
 */
function getActiveBlocks(blocks, context) {
  return blocks.filter(block => {
    if (!block.conditions) return true; // No condition = always included
    return evaluate(block.conditions, context);
  });
}

module.exports = {
  evaluate,
  evaluateRule: evaluate,
  evaluateRuleGroup: evaluate,
  getVisibleFields,
  getActiveBlocks,
  resolveField,
};
