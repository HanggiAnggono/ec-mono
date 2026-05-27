import React from 'react'
import { cn } from '../../lib/utils'

export interface CardProps {
  children: React.ReactNode
  className?: string
  title?: string
}

const Card = ({ children, className, title }: CardProps) => {
  return (
    <div className={cn('bg-white shadow rounded-lg overflow-hidden', className)}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}

Card.displayName = 'Card'

export default Card