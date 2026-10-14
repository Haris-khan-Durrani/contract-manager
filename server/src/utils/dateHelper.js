/**
 * dateHelper.js — Universal UTC & ISO Date Normalizer
 *
 * Ensures all SQL DATETIME strings (e.g. from SQLite or MySQL without tz)
 * are properly suffixed with 'Z' so clients interpret them strictly as UTC
 * instead of falling back to local browser timezone.
 */

function toIsoUtcString(val) {
  if (!val) return val;
  if (val instanceof Date) return val.toISOString();
  if (typeof val === 'string') {
    const s = val.trim();
    if (!s) return s;
    // Already has timezone offset or Z
    if (/Z$|[+-]\d{2}:?\d{2}$/i.test(s)) return s;
    // Standard SQL datetime format "YYYY-MM-DD HH:mm:ss" or "YYYY-MM-DDTHH:mm:ss"
    if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}/.test(s)) {
      return s.replace(' ', 'T') + (s.includes('.') ? 'Z' : '.000Z');
    }
  }
  try {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toISOString();
  } catch (_) {}
  return val;
}

module.exports = {
  toIsoUtcString,
};
