import { Toaster as SonnerToaster, type ToasterProps } from 'sonner'

export const Toaster = (props: ToasterProps) => {
  return (
    <SonnerToaster
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast rounded-[16px] border border-[var(--line)] bg-[#11192d] text-slate-100 shadow-[0_24px_64px_-42px_rgba(0,0,0,0.85)] backdrop-blur-xl',
          description: 'text-[var(--muted)]',
          actionButton: 'bg-[var(--primary)] text-[var(--primary-foreground)]',
          cancelButton: 'bg-transparent text-[var(--muted)]',
        },
      }}
      {...props}
    />
  )
}
