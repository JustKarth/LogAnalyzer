import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  }

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  )
}

// Severity-specific badge
export const SeverityBadge: React.FC<{ severity: string; className?: string }> = ({
  severity,
  className = '',
}) => {
  const severityStyles: Record<string, string> = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
    info: 'bg-blue-100 text-blue-800',
  }

  const variant = severityStyles[severity.toLowerCase()] || severityStyles.info

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variant} ${className}`}
    >
      {severity.toUpperCase()}
    </span>
  )
}

// Status-specific badge
export const StatusBadge: React.FC<{ status: string; className?: string }> = ({
  status,
  className = '',
}) => {
  const statusStyles: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    error: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
  }

  const variant = statusStyles[status.toLowerCase()] || 'bg-gray-100 text-gray-800'

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variant} ${className}`}
    >
      {status}
    </span>
  )
}

export default Badge