import { forwardRef } from 'react'
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { motion } from 'framer-motion'
import { Inbox } from 'lucide-react'
import { cn } from '../lib/utils'
import type { IconType } from '../types'

/* ---------------------------------- Button ---------------------------------- */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  icon?: IconType
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', icon: Icon, className, children, ...rest },
  ref,
) {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : 'btn-md'
  return (
    <button ref={ref} className={cn(VARIANT_CLASS[variant], sizeClass, className)} {...rest}>
      {Icon && <Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />}
      {children}
    </button>
  )
})

/* ----------------------------------- Card ----------------------------------- */

export function Card({
  className,
  hover,
  children,
  onClick,
}: {
  className?: string
  hover?: boolean
  children: ReactNode
  onClick?: () => void
}) {
  return (
    <div onClick={onClick} className={cn('card', hover && 'card-hover', onClick && 'cursor-pointer', className)}>
      {children}
    </div>
  )
}

export function SectionHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-3', className)}>
      <div>
        <h2 className="h-section">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

/* ---------------------------------- Inputs ---------------------------------- */

interface FieldProps {
  label: string
  children: ReactNode
  hint?: string
  className?: string
}

export function Field({ label, children, hint, className }: FieldProps) {
  return (
    <div className={className}>
      <span className="label">{label}</span>
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  )
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...rest },
  ref,
) {
  return <input ref={ref} className={cn('input', className)} {...rest} />
})

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...rest }, ref) {
    return <textarea ref={ref} className={cn('textarea', className)} {...rest} />
  },
)

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: readonly string[] | { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, options, ...rest },
  ref,
) {
  return (
    <select ref={ref} className={cn('input', className)} {...rest}>
      {options.map((o) =>
        typeof o === 'string' ? (
          <option key={o} value={o}>
            {o}
          </option>
        ) : (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ),
      )}
    </select>
  )
})

/* ----------------------------------- Badge ---------------------------------- */

export type BadgeTone =
  | 'indigo'
  | 'cyan'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'slate'
  | 'orange'
  | 'violet'

const TONE_CLASS: Record<BadgeTone, string> = {
  indigo: 'border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-400/25 dark:bg-indigo-400/10 dark:text-indigo-300',
  cyan: 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-400/25 dark:bg-cyan-400/10 dark:text-cyan-300',
  emerald:
    'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-300',
  amber:
    'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300',
  orange:
    'border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-400/25 dark:bg-orange-400/10 dark:text-orange-300',
  rose: 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-400/25 dark:bg-rose-400/10 dark:text-rose-300',
  violet:
    'border-violet-200 bg-violet-50 text-violet-600 dark:border-violet-400/25 dark:bg-violet-400/10 dark:text-violet-300',
  slate: 'border-slate-200 bg-slate-100 text-slate-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300',
}

export function Badge({
  tone = 'slate',
  icon: Icon,
  children,
  className,
}: {
  tone?: BadgeTone
  icon?: IconType
  children: ReactNode
  className?: string
}) {
  return (
    <span className={cn('badge', TONE_CLASS[tone], className)}>
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  )
}

/* -------------------------------- ProgressBar -------------------------------- */

export function ProgressBar({
  value,
  className,
  barClass,
  showLabel,
}: {
  value: number
  className?: string
  barClass?: string
  showLabel?: boolean
}) {
  const v = Math.min(100, Math.max(0, Math.round(value)))
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/[0.07]"
        role="progressbar"
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className={cn('h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400', barClass)}
          initial={{ width: 0 }}
          animate={{ width: `${v}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      {showLabel && <span className="w-9 text-right text-xs font-semibold text-muted">{v}%</span>}
    </div>
  )
}

/* --------------------------------- EmptyState -------------------------------- */

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: {
  icon?: IconType
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/80 px-6 py-12 text-center dark:border-white/[0.09]',
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-cyan-400/10 text-indigo-500 dark:text-indigo-300">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-4 font-display text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/* -------------------------------- Segmented -------------------------------- */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { value: T; label: ReactNode }[]
  value: T
  onChange: (v: T) => void
  ariaLabel?: string
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100/80 p-1 dark:border-white/10 dark:bg-white/[0.04]"
    >
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
            value === o.value
              ? 'bg-white text-indigo-600 shadow-sm dark:bg-white/10 dark:text-indigo-300'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
