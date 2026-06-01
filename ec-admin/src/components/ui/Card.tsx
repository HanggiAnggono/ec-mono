import React from 'react'
import { cn } from '../../lib/utils'

export interface CardProps {
  children: React.ReactNode
  className?: string
  title?: string
}

export const Card = ({ children, className, title }: CardProps) => {
  return (
    <div className={cn('overflow-hidden rounded-[26px] border border-[var(--line)] bg-[rgba(22,31,53,0.88)] shadow-[0_24px_64px_-42px_rgba(0,0,0,0.85)] backdrop-blur-xl', className)}>
      {title && (
        <div className="border-b border-[var(--line)] bg-[rgba(255,255,255,0.02)] px-6 py-4">
          <h3 className="font-display text-lg font-semibold tracking-[-0.03em] text-white">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}

Card.displayName = 'Card'

export default Card
