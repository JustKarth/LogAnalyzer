import React, { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import MainContent from './MainContent'

interface LayoutProps {
  showSidebar?: boolean
}

const Layout: React.FC<LayoutProps> = ({ showSidebar = true }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()

  const sidebarItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/upload', label: 'Upload' },
    { path: '/analysis', label: 'Analysis' },
    { path: '/incidents', label: 'Incidents' },
    { path: '/reports', label: 'Reports' },
    { path: '/settings', label: 'Settings' },
  ]

  const isActive = (path: string) =>
    location.pathname === path || (path === '/dashboard' && location.pathname === '/')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <a
        href="#main-content"
        className="skip-link"
      >
        Skip to main content
      </a>
      <Navbar />
      <nav aria-label="Mobile navigation" className="flex gap-1 overflow-x-auto border-b border-gray-200 bg-white px-3 py-2 lg:hidden">
        {sidebarItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            aria-current={isActive(item.path) ? 'page' : undefined}
            className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${isActive(item.path) ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex flex-1 overflow-hidden">
        {showSidebar && (
          <Sidebar
            items={sidebarItems}
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        )}
        <MainContent>
          <Outlet />
        </MainContent>
      </div>
    </div>
  )
}

export default Layout
