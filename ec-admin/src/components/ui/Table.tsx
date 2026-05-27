import React from 'react'
import { cn } from '../../lib/utils'

export interface TableProps {
  children: React.ReactNode
  className?: string
  loading?: boolean
}

export interface TableRowProps {
  children: React.ReactNode
  className?: string
}

export interface TableHeaderProps {
  children: React.ReactNode
  className?: string
}

export interface TableCellProps {
  children: React.ReactNode
  className?: string
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ children, className, loading }, ref) => {
    return (
      <div className="w-full overflow-x-auto">
        <table
          ref={ref}
          className={cn('min-w-full divide-y divide-gray-200', className)}
        >
          {children}
        </table>
        {loading && (
          <div className="flex justify-center items-center py-12">
            <svg
              className="animate-spin h-8 w-8 text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </div>
    )
  }
)

Table.displayName = 'Table'

const TableHeader = React.forwardRef<HTMLTableCellElement, TableHeaderProps>(
  ({ children, className }, ref) => (
    <thead ref={ref} className={cn('bg-gray-50', className)}>
      <tr>{children}</tr>
    </thead>
  )
)

TableHeader.displayName = 'TableHeader'

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ children, ...props }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return (
      <tbody
        ref={ref}
        className={cn('bg-white divide-y divide-gray-200', props.className)}
        {...props}
      >
        {children}
      </tbody>
    )
  }
)

TableBody.displayName = 'TableBody'

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ children, className }, ref) => (
    <tr ref={ref} className={cn('hover:bg-gray-50 transition-colors', className)}>
      {children}
    </tr>
  )
)

TableRow.displayName = 'TableRow'

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ children, className }, ref) => (
    <td
      ref={ref}
      className={cn('px-6 py-4 whitespace-nowrap', className)}
    >
      {children}
    </td>
  )
)

TableCell.displayName = 'TableCell'

export { TableHeader, TableBody, TableRow, TableCell }
export default Table