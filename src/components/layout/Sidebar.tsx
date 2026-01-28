import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  UserPlus,
  Search,
  ListOrdered,
  CreditCard,
  Users,
  Settings2,
  SlidersHorizontal,
  History,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface SidebarProps {
  open?: boolean
  onClose?: () => void
  collapsed?: boolean
  className?: string
}

interface NavItem {
  to: string
  label: string
  icon: React.ElementType
  roles: string[]
}

const NAV_ITEMS: NavItem[] = [
  { to: '/reception', label: 'Dashboard', icon: LayoutDashboard, roles: ['RECEPTION', 'ADMIN'] },
  { to: '/reception/register', label: 'Register Patient', icon: UserPlus, roles: ['RECEPTION', 'ADMIN'] },
  { to: '/reception/search', label: 'Search Patient', icon: Search, roles: ['RECEPTION', 'ADMIN'] },
  { to: '/reception/billing', label: 'Billing', icon: CreditCard, roles: ['RECEPTION', 'ADMIN'] },
  { to: '/doctor', label: 'Queue', icon: ListOrdered, roles: ['DOCTOR', 'ADMIN'] },
  { to: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard, roles: ['ADMIN'] },
  { to: '/admin/users', label: 'Users', icon: Users, roles: ['ADMIN'] },
  { to: '/admin/config', label: 'Configuration', icon: Settings2, roles: ['ADMIN'] },
  { to: '/admin/settings', label: 'Settings', icon: SlidersHorizontal, roles: ['ADMIN'] },
  { to: '/admin/audit-logs', label: 'Audit logs', icon: History, roles: ['ADMIN'] },
]

export function Sidebar({
  open = false,
  onClose,
  collapsed = false,
  className,
}: SidebarProps) {
  const { user } = useAuth()
  const role = user?.role ?? ''
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role))

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          // On mobile we show the sidebar as an overlay that sits
          // beneath the navbar (h-14) and fills the remaining height.
          'fixed left-0 top-14 z-50 h-[calc(100vh-3.5rem)] border-r bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 transition-transform',
          // On desktop it participates in the normal layout flow.
          'md:static md:z-auto md:h-auto md:translate-x-0 md:transition-none',
          'w-64 md:w-64',
          collapsed && 'md:w-20',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          className
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex h-14 items-center justify-between border-b px-4 md:justify-start">
          <span
            className={cn(
              'font-semibold tracking-tight text-foreground transition-opacity duration-150',
              collapsed && 'md:opacity-0 md:pointer-events-none md:select-none'
            )}
          >
            Menu
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onClose}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <nav className="flex flex-col gap-1 p-2">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={`${item.to}-${item.label}`}
                to={item.to}
                end={item.to === '/reception' || item.to === '/doctor' || item.to === '/admin'}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    collapsed && 'md:justify-center md:gap-0',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span
                  className={cn(
                    'truncate',
                    collapsed && 'hidden md:hidden'
                  )}
                >
                  {item.label}
                </span>
              </NavLink>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
