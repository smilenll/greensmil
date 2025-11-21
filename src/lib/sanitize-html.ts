import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Works in both server and client environments
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre', 'table', 'thead',
      'tbody', 'tr', 'th', 'td', 'img', 'span', 'div'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'style', 'class', 'src', 'alt', 'title',
      'width', 'height', 'align'
    ],
    ALLOW_DATA_ATTR: false,
  });
}
