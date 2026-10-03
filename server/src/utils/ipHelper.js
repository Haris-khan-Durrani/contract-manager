/**
 * ipHelper.js — Resolves client IP address across reverse proxies and local dev
 */
function getClientIp(req) {
  if (!req) return '';
  const forwarded = req.headers ? (req.headers['x-forwarded-for'] || req.headers['cf-connecting-ip'] || req.headers['x-real-ip']) : null;
  let ip = '';
  if (forwarded) {
    const list = Array.isArray(forwarded) ? forwarded[0] : String(forwarded);
    ip = list.split(',')[0].trim();
  }
  if (!ip) {
    ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '';
  }
  if (!ip) return '—';

  // Normalize IPv6 mapped IPv4 and localhost
  if (ip === '::1' || ip === '::ffff:127.0.0.1' || ip === '127.0.0.1') {
    return '127.0.0.1 (Localhost)';
  }
  return ip.replace(/^::ffff:/, '');
}

module.exports = { getClientIp };
