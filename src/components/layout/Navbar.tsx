import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Menu, PanelLeftClose, PanelLeftOpen, User, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  RECEPTION: 'Reception',
  DOCTOR: 'Doctor',
  NURSE: 'Nurse',
  DISPLAY: 'Display',
}

interface NavbarProps {
  onMenuClick?: () => void
  onToggleSidebar?: () => void
  sidebarCollapsed?: boolean
  className?: string
}

export function Navbar({ onMenuClick, onToggleSidebar, sidebarCollapsed, className }: NavbarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
    setOpen(false)
  }

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? '?'

  return (
    <header
      className={cn(
        'flex h-14 items-center gap-4 border-b bg-card px-4 shadow-sm',
        className
      )}
      role="banner"
    >
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex"
          onClick={onToggleSidebar}
          aria-label="Collapse sidebar"
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </Button>
      </div>
      <Link
        to={user?.role === 'DOCTOR' ? '/doctor' : user?.role === 'ADMIN' ? '/admin' : '/reception'}
        className="flex items-center gap-2 font-semibold text-foreground"
      >
        <span className="hidden sm:inline">Atta Khan Memorial Hospital</span>
        <span className="sm:hidden">AKMH</span>
      </Link>
      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full" aria-label="User menu">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.username}</p>
                <p className="text-xs text-muted-foreground">
                  {user ? ROLE_LABELS[user.role] ?? user.role : ''}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={user?.role === 'DOCTOR' ? '/doctor' : '/reception'} onClick={() => setOpen(false)}>
                <User className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/account/change-password" onClick={() => setOpen(false)}>
                <KeyRound className="mr-2 h-4 w-4" />
                Change password
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
