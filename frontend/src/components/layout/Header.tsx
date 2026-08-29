import React from 'react'

interface HeaderProps {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <div className="mb-6">
      {title && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex flex-wrap gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Header