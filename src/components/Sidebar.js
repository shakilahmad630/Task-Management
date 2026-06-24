'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { getInitials } from '@/lib/utils'
import {
  IconLayoutDashboard,
  IconTasks,
  IconUsers,
  IconLogout,
  IconActivity,
} from './Icons'

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', Icon: IconLayoutDashboard },
    { href: '/tasks',     label: 'Tasks',     Icon: IconTasks },
    { href: '/activity',  label: 'Activity',  Icon: IconActivity },
  ]

  if (user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN') {
    navItems.push({ href: '/users', label: 'Users', Icon: IconUsers })
  }

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay${isOpen ? ' open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar${isOpen ? ' open' : ''}`} aria-label="Sidebar navigation">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <span className="sidebar-logo-text">TaskFlow</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav" aria-label="Main navigation">
          <span className="sidebar-section-label">Menu</span>

          {navItems.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                id={`nav-${label.toLowerCase()}`}
                className={`nav-link${active ? ' active' : ''}`}
                onClick={onClose}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={18} className="nav-icon" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User + Logout */}
        <div className="sidebar-footer">
          <div className="user-info-block" onClick={logout} title="Logout" role="button" tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && logout()}
          >
            <div className="user-avatar" aria-hidden="true">
              {getInitials(user?.username || user?.email)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="user-name truncate">
                {user?.username || 'User'}
              </div>
              <div className="user-email">
                {user?.email || ''}
              </div>
            </div>
            <IconLogout size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          </div>
        </div>
      </aside>
    </>
  )
}
