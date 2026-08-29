import React, { useState } from 'react'
import Button from './Button'
import Input from './Input'
import Dropdown from './Dropdown'
import { Badge } from './Badge'

interface FilterOption {
  value: string
  label: string
}

interface FilterConfig {
  key: string
  label: string
  type: 'text' | 'select' | 'date'
  options?: FilterOption[]
  placeholder?: string
}

interface FilterProps {
  filters: FilterConfig[]
  onFilterChange: (filters: Record<string, string>) => void
  onReset: () => void
  activeFiltersCount?: number
  className?: string
}

const Filter: React.FC<FilterProps> = ({
  filters,
  onFilterChange,
  onReset,
  activeFiltersCount = 0,
  className = '',
}) => {
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filterValues, [key]: value }
    setFilterValues(newFilters)
    onFilterChange(newFilters)
  }

  const handleReset = () => {
    setFilterValues({})
    onReset()
  }

  const renderFilterInput = (filter: FilterConfig) => {
    switch (filter.type) {
      case 'text':
        return (
          <Input
            label={filter.label}
            placeholder={filter.placeholder}
            value={filterValues[filter.key] || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
          />
        )
      case 'select':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {filter.label}
            </label>
            <Dropdown
              options={filter.options || []}
              value={filterValues[filter.key] || ''}
              onChange={(value) => handleFilterChange(filter.key, value)}
              placeholder={filter.placeholder || 'Select...'}
            />
          </div>
        )
      case 'date':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {filter.label}
            </label>
            <input
              type="date"
              value={filterValues[filter.key] || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-soft ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            {activeFiltersCount > 0 && (
              <Badge variant="primary">{activeFiltersCount}</Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
            {activeFiltersCount > 0 && (
              <Button variant="secondary" size="sm" onClick={handleReset}>
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <div key={filter.key}>
                {renderFilterInput(filter)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Filter