import React from 'react'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'rectangular' | 'circular'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}) => {
  const variantStyles = {
    text: 'rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full',
  }

  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse',
    none: '',
  }

  const style: React.CSSProperties = {
    width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  }

  return (
    <div
      className={`bg-gray-200 ${variantStyles[variant]} ${animationStyles[animation]} ${className}`}
      style={style}
    />
  )
}

// Skeleton card for card components
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-soft p-6 ${className}`}>
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  )
}

// Skeleton table row
export const SkeletonTableRow: React.FC<{ columns?: number; className?: string }> = ({
  columns = 4,
  className = '',
}) => {
  return (
    <tr className={`animate-pulse ${className}`}>
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded"></div>
        </td>
      ))}
    </tr>
  )
}

// Skeleton list item
export const SkeletonListItem: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center space-x-4 p-4 ${className}`}>
      <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  )
}

export default Skeleton