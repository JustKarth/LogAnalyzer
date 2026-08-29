import React from 'react'
import { Link, useLocation } from 'react-router-dom'

interface SidebarItem {
  path: string
  label: string
  icon?: React.ReactNode
}

interface SidebarProps {
  items: SidebarItem[]
  collapsed?: boolean
  onToggle?: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ items, collapsed = false, onToggle }) => {
  const location = useLocation()
  const isActive = (path: string) =>
    location.pathname === path || (path === '/dashboard' && location.pathname === '/')

  return (
    <aside
      aria-label="Primary navigation"
      className={`hidden bg-white border-r border-gray-200 transition-all duration-300 lg:block ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4">
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="w-full flex items-center justify-center p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          <svg
            className={`w-6 h-6 text-gray-600 transition-transform ${
              collapsed ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <nav className="mt-2">
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            aria-current={isActive(item.path) ? 'page' : undefined}
            className={`flex items-center px-4 py-3 mx-2 rounded-md transition-colors ${
              isActive(item.path)
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title={collapsed ? item.label : undefined}
          >
            {item.icon && (
              <span className={`flex-shrink-0 ${collapsed ? 'mx-auto' : 'mr-3'}`}>
                {item.icon}
              </span>
            )}
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
