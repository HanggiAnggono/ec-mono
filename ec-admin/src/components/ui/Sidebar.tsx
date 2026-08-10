import * as React from 'react'
import { PanelLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent } from './Sheet'

const SIDEBAR_WIDTH = '280px'
const SIDEBAR_WIDTH_ICON = '4.5rem'
const MOBILE_BREAKPOINT = 1024

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => setIsMobile(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isMobile
}

type SidebarContextValue = {
  collapsed: boolean
  toggleSidebar: () => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) throw new Error('useSidebar must be used within a SidebarProvider')
  return context
}

function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()
  const [collapsed, setCollapsed] = React.useState(false)
  const [openMobile, setOpenMobile] = React.useState(false)

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) setOpenMobile((open) => !open)
    else setCollapsed((value) => !value)
  }, [isMobile])

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'b' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleSidebar])

  const value = React.useMemo(
    () => ({ collapsed, toggleSidebar, openMobile, setOpenMobile, isMobile }),
    [collapsed, toggleSidebar, openMobile, isMobile]
  )

  return (
    <SidebarContext.Provider value={value}>
      <div
        style={{ '--sidebar-width': SIDEBAR_WIDTH, '--sidebar-width-icon': SIDEBAR_WIDTH_ICON } as React.CSSProperties}
        className="min-h-screen"
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

function Sidebar({ children, className }: { children: React.ReactNode; className?: string }) {
  const { collapsed, isMobile, openMobile, setOpenMobile } = useSidebar()

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent side="left" className={cn('flex flex-col px-5 py-6', className)}>
          {children}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        'group hidden shrink-0 border-r border-sidebar-border bg-sidebar px-5 py-6 backdrop-blur-2xl transition-[width] duration-200 ease-linear lg:block',
        className
      )}
      style={{ width: collapsed ? SIDEBAR_WIDTH_ICON : SIDEBAR_WIDTH }}
    >
      <div className="flex h-full flex-col overflow-hidden">{children}</div>
    </aside>
  )
}

function SidebarInset({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex min-h-screen min-w-0 flex-1 flex-col', className)}>{children}</div>
}

function SidebarTrigger({ className }: { className?: string }) {
  const { toggleSidebar } = useSidebar()
  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-label="Toggle sidebar"
      title="Toggle sidebar (cmd/ctrl+b)"
      className={cn(
        'flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-[rgba(255,255,255,0.03)] text-[#d6ddff] transition hover:border-[var(--line-strong)] hover:bg-[rgba(255,255,255,0.06)]',
        className
      )}
    >
      <PanelLeft className="h-5 w-5" />
    </button>
  )
}

function SidebarHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  const { collapsed } = useSidebar()
  return (
    <div className={cn('border-b border-sidebar-border pb-6', collapsed && 'lg:hidden', className)}>
      {children}
    </div>
  )
}

function SidebarContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <nav className={cn('mt-8 flex-1 space-y-2 overflow-y-auto overflow-x-hidden', className)}>{children}</nav>
}

function SidebarFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mt-auto border-t border-sidebar-border pt-6', className)}>{children}</div>
}

export {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  useSidebar,
}
