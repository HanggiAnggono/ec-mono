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

export interface TableHeadCellProps {
  children: React.ReactNode
  className?: string
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ children, className, loading }, ref) => {
    return (
      <div className="w-full overflow-x-auto rounded-[26px] border border-[var(--line)] bg-[rgba(22,31,53,0.9)] shadow-[0_18px_50px_-28px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <table
          ref={ref}
          className={cn('min-w-full border-separate border-spacing-0', className)}
        >
          {children}
        </table>
        {loading && (
          <div className="flex items-center justify-center py-12">
            <svg
              className="h-8 w-8 animate-spin text-[#90abff]"
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

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ children, className }, ref) => (
    <thead ref={ref} className={cn('bg-[rgba(255,255,255,0.03)]', className)}>
      {children}
    </thead>
  )
)

TableHeader.displayName = 'TableHeader'

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ children, className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('bg-transparent', className)}
    {...props}
  >
    {children}
  </tbody>
))

TableBody.displayName = 'TableBody'

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ children, className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn('border-t border-[var(--line)] transition-colors hover:bg-white/4', className)}
    {...props}
  >
      {children}
    </tr>
))

TableRow.displayName = 'TableRow'

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ children, className }, ref) => (
    <td
      ref={ref}
      className={cn('whitespace-nowrap px-6 py-5 align-middle text-slate-200', className)}
    >
      {children}
    </td>
  )
)

TableCell.displayName = 'TableCell'

const TableHeadCell = React.forwardRef<
  HTMLTableCellElement,
  TableHeadCellProps
>(({ children, className }, ref) => (
  <th
      ref={ref}
      scope="col"
      className={cn(
        'px-6 py-4 text-left font-mono text-[12px] font-medium uppercase tracking-[0.2em] text-[#b4bfdc]',
        className
      )}
    >
    {children}
  </th>
))

TableHeadCell.displayName = 'TableHeadCell'

export { TableHeader, TableBody, TableRow, TableCell, TableHeadCell }
export default Table
