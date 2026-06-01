import React from 'react'
import { cn } from '../../lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  icon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', isLoading, icon, children, disabled, ...props },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 rounded-[16px] border font-medium tracking-[0.01em] transition-all duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]'

    const variants = {
      primary:
        'border-[#cad3ff66] bg-[linear-gradient(135deg,#c0cbff_0%,#aab8f8_100%)] text-[#17213c] shadow-[0_18px_42px_-30px_rgba(192,203,255,0.9)] hover:-translate-y-0.5 hover:brightness-105',
      secondary:
        'border-[var(--line)] bg-[rgba(255,255,255,0.03)] text-slate-100 shadow-[0_12px_32px_-22px_rgba(0,0,0,0.55)] hover:-translate-y-0.5 hover:border-[var(--line-strong)] hover:bg-[rgba(255,255,255,0.07)]',
      danger:
        'border-[#f2a5a966] bg-[rgba(242,165,169,0.08)] text-[#ffd5d8] shadow-[0_16px_40px_-30px_rgba(242,165,169,0.45)] hover:-translate-y-0.5 hover:bg-[rgba(242,165,169,0.12)]',
      success:
        'border-[#8bd8c166] bg-[rgba(139,216,193,0.1)] text-[#b8ffe7] shadow-[0_16px_40px_-30px_rgba(76,164,137,0.35)] hover:-translate-y-0.5 hover:bg-[rgba(139,216,193,0.16)]',
      ghost:
        'border-transparent bg-transparent text-slate-200 hover:bg-white/6',
    }

    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3.5 text-base',
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
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
        ) : icon}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
