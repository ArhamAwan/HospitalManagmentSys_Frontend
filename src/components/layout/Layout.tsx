import { useState } from 'react'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: React.ReactNode
  className?: string
}

export function Layout({ children, className }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
   const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className={cn('flex min-h-screen flex-col bg-background text-[15px] md:text-sm', className)}>
      <Navbar
        onMenuClick={() => setSidebarOpen((o) => !o)}
        onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
        sidebarCollapsed={sidebarCollapsed}
      />
      <div className="flex flex-1">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={sidebarCollapsed}
        />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  )
}
