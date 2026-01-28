import { Link } from 'react-router-dom'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  to?: string
}

interface PageContainerProps {
  title?: string
  breadcrumbs?: BreadcrumbItem[]
  loading?: boolean
  children: React.ReactNode
  className?: string
}

export function PageContainer({
  title,
  breadcrumbs,
  loading = false,
  children,
  className,
}: PageContainerProps) {
  return (
    <div className={cn('relative flex flex-1 flex-col', className)}>
      {(title || breadcrumbs) && (
        <div className="border-b bg-background px-4 py-4 md:px-6">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="mb-1 text-sm text-muted-foreground">
              {breadcrumbs.map((b, i) => (
                <span key={i}>
                  {b.to ? (
                    <Link to={b.to} className="hover:underline">
                      {b.label}
                    </Link>
                  ) : (
                    <span>{b.label}</span>
                  )}
                  {i < breadcrumbs.length - 1 && <span className="mx-1">/</span>}
                </span>
              ))}
            </nav>
          )}
          {title && (
            <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
              {title}
            </h1>
          )}
        </div>
      )}
      <main className="flex-1 p-4 md:p-6" role="main">
        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <LoadingSpinner size="lg" text="Loading…" />
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  )
}
