import type { ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from '../components/ui/Sidebar'


type NavItem = {
  label: string
  to?: string
  icon: ReactNode
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    to: '/',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="11" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="18" width="7" height="3" rx="1.5" />
      </svg>
    ),
  },
  {
    label: 'Categories',
    to: '/categories',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M4 7.5 12 3l8 4.5-8 4.5-8-4.5Z" />
        <path d="M4 12.5 12 17l8-4.5" />
        <path d="M4 17 12 21l8-4" />
      </svg>
    ),
  },
  {
    label: 'Products',
    to: '/products',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M4 7h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" />
        <path d="M9 7V5a3 3 0 0 1 6 0v2" />
        <path d="M4 11h16" />
      </svg>
    ),
  },
  {
    label: 'Orders',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="9" cy="19" r="1.5" />
        <circle cx="17" cy="19" r="1.5" />
        <path d="M3 4h2l2.7 10.4a1 1 0 0 0 1 .8h8.6a1 1 0 0 0 1-.8L20 7H7" />
      </svg>
    ),
  },
]




function SvgIcon({ children, size = 20 }: { children: ReactNode; size?: number }) {
  return (
    <span className="flex size-5 shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      {children}
    </span>
  )
}

function SidebarLink({ item }: { item: NavItem }) {
  const { collapsed } = useSidebar()

  if (!item.to) {
    return (
      <div
        key={item.label}
        className="flex items-center gap-4 rounded-[18px] border border-transparent px-4 py-3 text-[15px] text-[var(--muted)] opacity-80"
      >
        <SvgIcon>{item.icon}</SvgIcon>
        {!collapsed && <span className="font-mono text-[0.95rem]">{item.label}</span>}
      </div>
    )
  }

  return (
    <NavLink
      key={item.label}
      to={item.to}
      end={item.to === '/'}
      title={item.label}
      className={({ isActive }) =>
        [
          'group relative flex items-center gap-4 rounded-[18px] border px-4 py-3 transition duration-200',
          isActive
            ? 'border-[var(--line-strong)] bg-[rgba(167,180,255,0.12)] text-[var(--accent)] shadow-[inset_3px_0_0_0_#cad3ff]'
            : 'border-transparent text-[var(--muted)] hover:border-[var(--line)] hover:bg-[rgba(255,255,255,0.03)] hover:text-white',
        ].join(' ')
      }
    >
      <SvgIcon>{item.icon}</SvgIcon>
      {!collapsed && <span className="font-mono text-[0.95rem]">{item.label}</span>}
    </NavLink>
  )
}

function UtilityButton({ label, icon }: { label: string; icon: ReactNode }) {
  return (
    <button
      type="button"
      className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-[rgba(255,255,255,0.03)] text-[#d6ddff] transition hover:border-[var(--line-strong)] hover:bg-[rgba(255,255,255,0.06)]"
      aria-label={label}
    >
      {icon}
    </button>
  )
}

function AdminLayoutShell() {
  const { user, logout } = useAuth()
  const { collapsed } = useSidebar()

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(158,176,255,0.16),_transparent_20%),linear-gradient(180deg,_#0b1020_0%,_#090e1b_100%)] text-[var(--text)]">
      <div className="relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30" />
        <div className="relative flex min-h-screen">
          <Sidebar>
            <SidebarHeader>
              <p className="font-display text-[2rem] font-semibold tracking-[-0.04em] text-[var(--accent)]">
                {collapsed ? 'NM' : 'Neon Market'}
              </p>
              {!collapsed && (
                <p className="font-mono mt-1 text-[11px] uppercase tracking-[0.36em] text-[#cfd8ff]">
                  Admin Console
                </p>
              )}
            </SidebarHeader>

            <SidebarContent>
              {navItems.map((item) => (
                <SidebarLink key={item.label} item={item} />
              ))}
            </SidebarContent>

            <SidebarFooter>
              <div className="flex items-center gap-4 rounded-[18px] border border-transparent px-4 py-3 text-[var(--muted)]">
                <SvgIcon size={20}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M10.3 3.3a1 1 0 0 1 1.4 0l.7.7a1 1 0 0 0 1 .24l1-.27a1 1 0 0 1 1.2.7l.3 1a1 1 0 0 0 .7.7l1 .3a1 1 0 0 1 .7 1.2l-.27 1a1 1 0 0 0 .24 1l.7.7a1 1 0 0 1 0 1.4l-.7.7a1 1 0 0 0-.24 1l.27 1a1 1 0 0 1-.7 1.2l-1 .3a1 1 0 0 0-.7.7l-.3 1a1 1 0 0 1-1.2.7l-1-.27a1 1 0 0 0-1 .24l-.7.7a1 1 0 0 1-1.4 0l-.7-.7a1 1 0 0 0-1-.24l-1 .27a1 1 0 0 1-1.2-.7l-.3-1a1 1 0 0 0-.7-.7l-1-.3a1 1 0 0 1-.7-1.2l.27-1a1 1 0 0 0-.24-1l-.7-.7a1 1 0 0 1 0-1.4l.7-.7a1 1 0 0 0 .24-1l-.27-1a1 1 0 0 1 .7-1.2l1-.3a1 1 0 0 0 .7-.7l.3-1a1 1 0 0 1 1.2-.7l1 .27a1 1 0 0 0 1-.24l.7-.7Z" />
                    <circle cx="12" cy="12" r="3.25" />
                  </svg>
                </SvgIcon>
                {!collapsed && <span className="font-mono text-[0.95rem]">Settings</span>}
              </div>
            </SidebarFooter>
          </Sidebar>

          <SidebarInset>
            <header className="border-b border-[var(--line)] bg-[rgba(13,18,32,0.78)] backdrop-blur-2xl">
              <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-7">
                <div className="flex items-center gap-3">
                  <SidebarTrigger />
                  <div className="relative max-w-[560px] flex-1">
                    <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="11" cy="11" r="6" />
                      <path d="m20 20-4.2-4.2" />
                    </svg>
                    <input
                      type="search"
                      placeholder="Search Neon Market..."
                      className="h-12 w-full rounded-[18px] border border-[var(--line-strong)] bg-[#0c1325] pl-12 pr-4 text-[15px] text-white outline-none transition placeholder:text-[var(--muted)] focus:border-[#d3dbff] focus:shadow-[0_0_0_3px_rgba(188,202,255,0.14)]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <UtilityButton
                    label="Notifications"
                    icon={
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M15 18H5.5a1.5 1.5 0 0 1-1.1-2.5c1.1-1.1 1.6-2.6 1.6-4.1V10a6 6 0 1 1 12 0v1.4c0 1.5.6 3 1.6 4.1a1.5 1.5 0 0 1-1.1 2.5H15Z" />
                        <path d="M10 20a2 2 0 0 0 4 0" />
                      </svg>
                    }
                  />

                  {/* Profile and Logout info */}
                  <div className="flex items-center gap-3 pl-2 border-l border-[var(--line)]">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-white">{user?.firstname || user?.username || 'Admin'}</p>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">Administrator</p>
                    </div>

                    <button
                      type="button"
                      onClick={logout}
                      title="Log Out"
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-[rgba(255,255,255,0.03)] text-[#ffb8be] transition hover:border-[#ff949b] hover:bg-[rgba(255,100,100,0.08)] cursor-pointer"
                      aria-label="Log Out"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </header>

            <main className="flex-1 px-4 py-5 sm:px-6 lg:px-7">
              <Outlet />
            </main>
          </SidebarInset>
        </div>
      </div>
    </div>
  )
}

function AdminLayout() {
  return (
    <SidebarProvider>
      <AdminLayoutShell />
    </SidebarProvider>
  )
}


export default AdminLayout
