type DialogProps = {
  isOpen: boolean
  onClose?: () => void
  children: React.ReactNode
  title?: string
}

export const Dialog = ({ isOpen, children, title }: DialogProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#02040ad9] px-4 backdrop-blur-xl">
      <div className="w-full max-w-lg overflow-hidden rounded-[28px] border border-[var(--line)] bg-[#11192d] shadow-[0_30px_100px_-40px_rgba(0,0,0,0.85)]">
        {title && (
          <div className="border-b border-[var(--line)] bg-[rgba(255,255,255,0.03)] px-6 py-4">
            <h3 className="font-display text-lg font-semibold tracking-[-0.03em] text-white">{title}</h3>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

Dialog.displayName = 'Dialog'

export default Dialog
