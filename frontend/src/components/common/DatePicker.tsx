import React from 'react'

interface DatePickerProps {
  value?: string
  onChange: (date: string) => void
  label?: string
  error?: string
  helperText?: string
  min?: string
  max?: string
  className?: string
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  error,
  helperText,
  min,
  max,
  className = '',
}) => {
  const inputId = `date-picker-${Math.random().toString(36).substr(2, 9)}`

  const formatDateForInput = (dateString?: string): string => {
    if (!dateString) return ''
    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString
    }
    // Otherwise, convert from ISO string to YYYY-MM-DD
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type="date"
        value={formatDateForInput(value)}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  )
}

// Date Range Picker
interface DateRangePickerProps {
  startDate?: string
  endDate?: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  label?: string
  error?: string
  className?: string
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  label,
  error,
  className = '',
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="flex space-x-2">
        <div className="flex-1">
          <DatePicker
            value={startDate}
            onChange={onStartDateChange}
            label="Start Date"
            max={endDate}
          />
        </div>
        <div className="flex-1">
          <DatePicker
            value={endDate}
            onChange={onEndDateChange}
            label="End Date"
            min={startDate}
          />
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export default DatePicker