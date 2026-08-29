import React, { useState } from 'react'
import type { TableColumn } from '../../types'

interface TableProps<T> {
  data: T[]
  columns: TableColumn[]
  onRowClick?: (row: T) => void
  sortable?: boolean
  loading?: boolean
  emptyMessage?: string
}

const Table = <T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  sortable = false,
  loading = false,
  emptyMessage = 'No data available',
}: TableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)

  const handleSort = (key: string) => {
    if (!sortable) return

    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data

    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [data, sortConfig])

  const getSortIcon = (key: string) => {
    if (!sortable || !sortConfig || sortConfig.key !== key) return null
    return sortConfig.direction === 'asc' ? '↑' : '↓'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                aria-sort={
                  sortable && column.sortable && sortConfig?.key === column.key
                    ? sortConfig.direction === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : undefined
                }
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6"
                style={{ width: column.width }}
              >
                <button type="button" disabled={!sortable || !column.sortable} onClick={() => handleSort(column.key)} className={`flex items-center ${sortable && column.sortable ? 'cursor-pointer hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500' : 'cursor-default'}`}>
                  {column.label}
                  {getSortIcon(column.key) && (
                    <span className="ml-1">{getSortIcon(column.key)}</span>
                  )}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((row, index) => (
            <tr
              key={String(row.id ?? index)}
              className={`${
                onRowClick ? 'cursor-pointer hover:bg-gray-50 focus-within:bg-gray-50' : ''
              }`}
              onClick={() => onRowClick && onRowClick(row)}
              onKeyDown={(event) => {
                if (onRowClick && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault()
                  onRowClick(row)
                }
              }}
              tabIndex={onRowClick ? 0 : undefined}
              role={onRowClick ? 'button' : undefined}
            >
              {columns.map((column) => (
                <td key={column.key} className="whitespace-nowrap px-4 py-4 sm:px-6">
                  {column.render ? (
                    column.render(row[column.key], row)
                  ) : (
                    <div className="text-sm text-gray-900">
                      {row[column.key]}
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table
