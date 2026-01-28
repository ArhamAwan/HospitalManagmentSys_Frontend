import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  UserPlus,
  Search,
  ListOrdered,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface SidebarProps {
  open?: boolean
  onClose?: () => void
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
  { to: '/doctor', label: 'Queue', icon: ListOrdered, roles: ['DOCTOR', 'ADMIN'] },
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN'] },
]

export function Sidebar({ open = false, onClose, className }: SidebarProps) {
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
          'fixed left-0 top-0 z-50 h-full w-64 border-r bg-card transition-transform md:static md:z-auto md:translate-x-0 md:transition-none',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          className
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex h-14 items-center justify-between border-b px-4 md:justify-start">
          <span className="font-semibold text-foreground">Menu</span>
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
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
