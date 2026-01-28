import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/**
 * A Card wrapper that matches the reception dashboard design scheme:
 * soft gradient surface, subtle shadow, and rounded corners.
 */
export function SurfaceCard({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Card>) {
  return (
    <Card
      className={cn(
        'overflow-hidden border bg-gradient-to-br from-muted/60 via-background to-background shadow-sm',
        className
      )}
      {...props}
    />
  )
}

