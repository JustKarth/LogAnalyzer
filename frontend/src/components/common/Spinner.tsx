import React from 'react'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeStyles = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  }

  return (
    <div className={`animate-spin rounded-full border-gray-300 border-t-primary-600 ${sizeStyles[size]} ${className}`} />
  )
}

// Full page loading spinner
export const PageLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" role="status" aria-live="polite">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  )
}

// Inline loading spinner with text
export const LoadingText: React.FC<{ text?: string; className?: string }> = ({
  text = 'Loading...',
  className = '',
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Spinner size="sm" />
      <span className="text-sm text-gray-600">{text}</span>
    </div>
  )
}

export default Spinner