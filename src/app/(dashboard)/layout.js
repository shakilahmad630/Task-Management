'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { usePathname } from 'next/navigation'

const PAGE_META = {
  '/dashboard': { title: 'Dashboard',  subtitle: 'Overview of your tasks' },
  '/tasks':     { title: 'My Tasks',   subtitle: 'Manage and track your tasks' },
  '/users':     { title: 'Users Management', subtitle: 'Manage application users and roles' },
}

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const meta = PAGE_META[pathname] || { title: 'TaskFlow', subtitle: '' }

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content">
        <Header
          title={meta.title}
          subtitle={meta.subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="page-body">
          {children}
        </main>
      </div>
    </div>
  )
}
