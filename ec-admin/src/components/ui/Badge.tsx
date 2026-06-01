import React from 'react'
import { cn } from '../../lib/utils'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
}

export const Badge = ({ children, variant = 'default', size = 'md' }: BadgeProps) => {
  const variants = {
    default: 'border-white/10 bg-white/6 text-slate-200',
    success: 'border-[#9ae0cf66] bg-[#9ae0cf14] text-[#c9ffef]',
    warning: 'border-[#ffd38f66] bg-[#ffd38f14] text-[#ffe8bf]',
    danger: 'border-[#f2a5a966] bg-[#f2a5a914] text-[#ffd4d7]',
    info: 'border-[#bccaff66] bg-[#bccaff14] text-[#dce4ff]',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-mono font-medium backdrop-blur-md',
        variants[variant],
        sizes[size]
      )}
    >
      {children}
    </span>
  )
}

Badge.displayName = 'Badge'

export default Badge
