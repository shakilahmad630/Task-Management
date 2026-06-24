'use client'

import { useTheme } from '@/context/ThemeContext'
import { IconSun, IconMoon, IconMenu } from './Icons'

export default function Header({ title, subtitle, onMenuClick }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="page-header">
      {/* Hamburger (mobile) */}
      <button
        id="sidebar-toggle"
        className="btn btn-ghost btn-icon"
        onClick={onMenuClick}
        aria-label="Toggle sidebar"
      >
        <IconMenu size={22} />
      </button>

      {/* Page title */}
      <div style={{ flex: 1 }}>
        <h1 className="page-title" style={{ fontSize: 17 }}>{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>

      {/* Theme toggle */}
      <button
        id="theme-toggle"
        className="btn btn-ghost btn-icon"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      >
        {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
      </button>
    </header>
  )
}
