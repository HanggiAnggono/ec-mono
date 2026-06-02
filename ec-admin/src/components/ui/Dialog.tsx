import React, { useEffect } from 'react'
import { Button } from './Button'

type DialogProps = {
  isOpen: boolean
  onClose?: () => void
  children: React.ReactNode
  title?: string
}

export const Dialog = ({ isOpen, onClose, children, title }: DialogProps) => {
  useEffect(() => {
    if (!isOpen || !onClose) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#02040ad9] px-4 backdrop-blur-xl"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-[28px] border border-[var(--line)] bg-[#11192d] shadow-[0_30px_100px_-40px_rgba(0,0,0,0.85)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {title && (
          <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] bg-[rgba(255,255,255,0.03)] px-6 py-4">
            <h3 className="font-display text-lg font-semibold tracking-[-0.03em] text-white">
              {title}
            </h3>
            {onClose && (
              <Button
                type="button"
                onClick={onClose}
                variant="ghost"
                size="sm"
                aria-label="Close dialog"
              >
                Close
              </Button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

Dialog.displayName = 'Dialog'

export default Dialog
