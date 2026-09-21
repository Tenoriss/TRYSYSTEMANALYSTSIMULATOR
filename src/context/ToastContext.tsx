import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Info, Sparkles, Trophy, X, XCircle } from 'lucide-react'
import { cn, uid } from '../lib/utils'

export type ToastKind = 'success' | 'error' | 'warning' | 'info' | 'xp' | 'achievement'

export interface ToastItem {
  id: string
  kind: ToastKind
  title: string
  description?: string
}

interface ToastContextValue {
  push: (kind: ToastKind, title: string, description?: string) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
  xp: (amount: number, label: string) => void
  achievement: (title: string, xp: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const ICONS: Record<ToastKind, { icon: typeof Info; classes: string }> = {
  success: { icon: CheckCircle2, classes: 'text-emerald-500 bg-emerald-500/10' },
  error: { icon: XCircle, classes: 'text-rose-500 bg-rose-500/10' },
  warning: { icon: AlertTriangle, classes: 'text-amber-500 bg-amber-500/10' },
  info: { icon: Info, classes: 'text-sky-500 bg-sky-500/10' },
  xp: { icon: Sparkles, classes: 'text-indigo-500 bg-indigo-500/10' },
  achievement: { icon: Trophy, classes: 'text-amber-400 bg-amber-400/10' },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timers.current[id]
    if (timer) {
      clearTimeout(timer)
      delete timers.current[id]
    }
  }, [])

  const push = useCallback(
    (kind: ToastKind, title: string, description?: string) => {
      const id = uid()
      setToasts((prev) => [...prev.slice(-4), { id, kind, title, description }])
      timers.current[id] = setTimeout(() => dismiss(id), kind === 'achievement' ? 5200 : 3600)
    },
    [dismiss],
  )

  const value = useMemo<ToastContextValue>(
    () => ({
      push,
      success: (t, d) => push('success', t, d),
      error: (t, d) => push('error', t, d),
      warning: (t, d) => push('warning', t, d),
      info: (t, d) => push('info', t, d),
      xp: (amount, label) => push('xp', `+${amount} XP`, label),
      achievement: (title, xpAmt) => push('achievement', 'Achievement unlocked', `${title} · +${xpAmt} XP`),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-3 bottom-20 z-[90] flex flex-col items-center gap-2 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:items-end"
      >
        <AnimatePresence>
          {toasts.map((t) => {
            const meta = ICONS[t.kind]
            const Icon = meta.icon
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={cn(
                  'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-3 pr-2 shadow-lg backdrop-blur',
                  'border-slate-200 bg-white/95 dark:border-white/10 dark:bg-[#0e1626]/95',
                  t.kind === 'achievement' && 'border-amber-300/40 dark:border-amber-400/30 shadow-glow-sm',
                )}
                role="status"
              >
                <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', meta.classes)}>
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'text-sm font-semibold text-slate-800 dark:text-slate-100',
                      t.kind === 'xp' && 'bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent',
                    )}
                  >
                    {t.title}
                  </p>
                  {t.description && (
                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{t.description}</p>
                  )}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss notification"
                  className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/5 dark:hover:text-slate-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
