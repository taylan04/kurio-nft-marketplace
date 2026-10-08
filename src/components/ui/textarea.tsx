import * as React from 'react'
import { cn } from '@/lib/utils'

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn('min-h-28 w-full rounded-md border border-border bg-transparent p-3 text-sm outline-none placeholder:text-muted/80 focus:border-accent focus:ring-1 focus:ring-accent', className)} {...props} />
))
Textarea.displayName = 'Textarea'
