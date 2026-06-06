/**
 * Basic HTML sanitizer to prevent XSS via dangerouslySetInnerHTML.
 * Removes scripts, event handlers, javascript URLs, and dangerous tags.
 * For production, consider DOMPurify for more comprehensive sanitization.
 */
const sanitizeHtml = (html) => {
  if (!html || typeof html !== 'string') return '';

  return html
    // Remove script tags and their contents
    .replace(/<script[\s\S]*?>[^]*?<\/script>/gi, '')
    // Remove style tags (can contain CSS-based attacks)
    .replace(/<style[\s\S]*?>[^]*?<\/style>/gi, '')
    // Remove iframe, object, embed, form tags
    .replace(/<(iframe|object|embed|form|input|textarea|button)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(iframe|object|embed|form|input|textarea|button)\s*\/?>/gi, '')
    // Remove on* event handlers (onclick, onerror, etc.)
    .replace(/\s+on\w+\s*=\s*["']?[^"'>]*["']?/gi, '')
    // Remove javascript: URLs
    .replace(/\s+(href|src|action)\s*=\s*["']?javascript:[^"'>]*["']?/gi, '')
    // Remove data: URLs (can contain scripts)
    .replace(/\s+(href|src|action)\s*=\s*["']?data:[^"'>]*["']?/gi, '')
    // Remove meta refresh
    .replace(/<meta[^>]*http-equiv\s*=\s*["']?refresh["']?[^>]*>/gi, '')
    // Remove link tags (can load external stylesheets with expressions)
    .replace(/<link[^>]*>/gi, '')
    // Remove base tag (can redirect relative URLs)
    .replace(/<base[^>]*>/gi, '');
};

module.exports = { sanitizeHtml };
