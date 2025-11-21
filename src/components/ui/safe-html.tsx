import { sanitizeHtml } from '@/lib/sanitize-html';
import { cn } from '@/lib/utils';

interface SafeHtmlProps {
  html: string;
  className?: string;
}

/**
 * Safely renders sanitized HTML content
 * Prevents XSS attacks by sanitizing on the server
 */
export function SafeHtml({ html, className }: SafeHtmlProps) {
  const sanitized = sanitizeHtml(html);

  return (
    <div
      className={cn('prose prose-sm max-w-none dark:prose-invert', className)}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
