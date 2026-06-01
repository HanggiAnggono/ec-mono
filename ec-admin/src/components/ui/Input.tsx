import React from 'react'
import { cn } from '../../lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, type = 'text', ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block font-mono text-xs uppercase tracking-[0.2em] text-[#cfd8ff]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(
              'block w-full rounded-[16px] border border-[var(--line)] bg-[#0d1427] px-4 py-3 text-slate-100 outline-none transition placeholder:text-[var(--muted)] focus:border-[#d3dbff] focus:shadow-[0_0_0_3px_rgba(188,202,255,0.14)]',
              icon && 'pl-10',
              error && 'border-[#f2a5a9] shadow-[0_0_0_3px_rgba(242,165,169,0.12)]',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-2 text-sm text-[#ffc4ca]">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
