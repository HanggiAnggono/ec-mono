import React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Button } from './Button'

type DialogProps = {
  isOpen: boolean
  onClose?: () => void
  children: React.ReactNode
  title?: string
}

export const Dialog = ({ isOpen, onClose, children, title }: DialogProps) => {
  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose?.()
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#02040ad9] backdrop-blur-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[28px] border border-[var(--line)] bg-[#11192d] shadow-[0_30px_100px_-40px_rgba(0,0,0,0.85)] outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          aria-describedby={undefined}
        >
          {title ? (
            <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] bg-[rgba(255,255,255,0.03)] px-6 py-4">
              <DialogPrimitive.Title asChild>
                <h3 className="font-display text-lg font-semibold tracking-[-0.03em] text-white">
                  {title}
                </h3>
              </DialogPrimitive.Title>
              <DialogPrimitive.Close asChild>
                <Button type="button" variant="ghost" size="sm" aria-label="Close dialog">
                  Close
                </Button>
              </DialogPrimitive.Close>
            </div>
          ) : (
            <DialogPrimitive.Title className="sr-only">Dialog</DialogPrimitive.Title>
          )}
          <div className="p-6">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

Dialog.displayName = 'Dialog'

export default Dialog
