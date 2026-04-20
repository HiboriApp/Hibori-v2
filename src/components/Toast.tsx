import { useEffect } from "react"
import { Bell, BellOff, CheckCircle2, X } from "lucide-react"

type ToastTone = "success" | "info"

interface ToastProps {
  open: boolean
  message: string
  tone?: ToastTone
  variant?: "notifications-on" | "notifications-off"
  onClose: () => void
}

export default function Toast({ open, message, tone = "success", variant, onClose }: ToastProps) {
  useEffect(() => {
    if (!open) return

    const timeout = window.setTimeout(() => {
      onClose()
    }, 2400)

    return () => window.clearTimeout(timeout)
  }, [open, onClose])

  if (!open) return null

  const backgroundClass = tone === "success" ? "bg-emerald-500" : "bg-slate-900"
  const Icon = variant === "notifications-on" ? Bell : variant === "notifications-off" ? BellOff : CheckCircle2

  return (
    <div className="pointer-events-none fixed left-1/2 top-5 z-[100] -translate-x-1/2 px-4">
      <div className={`pointer-events-auto flex min-w-[260px] items-center gap-3 rounded-2xl px-4 py-3 text-white shadow-[0_18px_50px_rgba(15,23,42,0.2)] ${backgroundClass}`}>
        <Icon className="h-5 w-5 shrink-0" />
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button type="button" onClick={onClose} className="rounded-full p-1 text-white/80 transition hover:bg-white/10 hover:text-white" aria-label="סגור התראה">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}