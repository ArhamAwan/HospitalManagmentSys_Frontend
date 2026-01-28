import { Button } from '@/components/ui/button'
import { X, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
}

export function ErrorMessage({ message, onRetry, onDismiss, className }: ErrorMessageProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <p className="flex-1">{message}</p>
      <div className="flex items-center gap-2">
        {onRetry && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            aria-label="Retry"
          >
            <RotateCcw className="mr-1 h-4 w-4" />
            Retry
          </Button>
        )}
        {onDismiss && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
