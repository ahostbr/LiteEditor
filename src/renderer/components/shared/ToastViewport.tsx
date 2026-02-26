import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'
import { useToastStore, type ToastVariant } from '../../stores/toast-store'

function getToastColors(variant: ToastVariant): { border: string; icon: string; background: string } {
  switch (variant) {
    case 'success':
      return {
        border: 'color-mix(in srgb, var(--success) 45%, transparent)',
        icon: 'var(--success)',
        background: 'color-mix(in srgb, var(--success) 8%, var(--bg-surface))'
      }
    case 'warning':
      return {
        border: 'color-mix(in srgb, var(--warning) 45%, transparent)',
        icon: 'var(--warning)',
        background: 'color-mix(in srgb, var(--warning) 8%, var(--bg-surface))'
      }
    case 'error':
      return {
        border: 'color-mix(in srgb, var(--error) 45%, transparent)',
        icon: 'var(--error)',
        background: 'color-mix(in srgb, var(--error) 8%, var(--bg-surface))'
      }
    default:
      return {
        border: 'color-mix(in srgb, var(--info) 45%, transparent)',
        icon: 'var(--info)',
        background: 'color-mix(in srgb, var(--info) 8%, var(--bg-surface))'
      }
  }
}

function ToastIcon({ variant }: { variant: ToastVariant }) {
  switch (variant) {
    case 'success':
      return <CheckCircle2 size={15} />
    case 'warning':
      return <TriangleAlert size={15} />
    case 'error':
      return <AlertCircle size={15} />
    default:
      return <Info size={15} />
  }
}

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-7 right-5 z-[120] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const colors = getToastColors(toast.variant)
        return (
          <div
            key={toast.id}
            className="min-w-[280px] max-w-[420px] px-3 py-2 rounded-md border shadow-lg pointer-events-auto"
            style={{
              backgroundColor: colors.background,
              borderColor: colors.border,
              color: 'var(--text-primary)',
              animation: 'toastEnter 140ms ease-out'
            }}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-2">
              <span className="mt-[1px] shrink-0" style={{ color: colors.icon }}>
                <ToastIcon variant={toast.variant} />
              </span>
              <span className="text-xs leading-snug flex-1">{toast.message}</span>
              <button
                className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
                title="Dismiss"
                onClick={() => removeToast(toast.id)}
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
