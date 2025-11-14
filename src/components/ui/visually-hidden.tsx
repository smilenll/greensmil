import * as React from "react"

/**
 * VisuallyHidden component hides content visually but keeps it accessible to screen readers.
 * This is useful for maintaining accessibility without affecting the visual design.
 */
function VisuallyHidden({
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className="sr-only" {...props}>
      {children}
    </span>
  )
}

export { VisuallyHidden }
