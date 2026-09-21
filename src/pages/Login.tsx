import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Info, LogIn, Radar } from 'lucide-react'
import { Button, Field, Input } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../i18n/useI18n'
import type { TranslationKey } from '../i18n'

/** Shared chrome for the public auth screens. */
export function AuthShell({ children, note }: { children: React.ReactNode; note: string }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#05080f] px-4 py-10">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-500/40">
            <Radar className="h-6 w-6 text-white" />
          </span>
          <p className="mt-3 font-display text-sm font-bold tracking-[0.24em] text-cyan-300">SYSTEM ANALYST</p>
          <p className="text-[11px] font-semibold tracking-[0.3em] text-slate-500">SIMULATOR</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur sm:p-8">{children}</div>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] leading-relaxed text-slate-500">
          <Info className="h-3.5 w-3.5 shrink-0" /> {note}
        </p>
      </motion.div>
    </div>
  )
}

export default function Login() {
  const { login } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<TranslationKey | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    const result = await login(email, password)
    setBusy(false)
    if (result.ok) navigate(from, { replace: true })
    else setError(result.error ?? 'auth.err.credentials')
  }

  return (
    <AuthShell note={t('auth.localNote')}>
      <h1 className="font-display text-xl font-bold text-white">{t('auth.login.title')}</h1>
      <p className="mt-1 text-sm text-slate-400">{t('auth.login.sub')}</p>

      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <Field label={t('auth.email')}>
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.emailPh')}
            aria-label={t('auth.email')}
          />
        </Field>
        <Field label={t('auth.password')}>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.passwordPh')}
              aria-label={t('auth.password')}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={t(showPassword ? 'auth.hidePassword' : 'auth.showPassword')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        {error && (
          <p role="alert" className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300">
            {t(error)}
          </p>
        )}

        <Button type="submit" icon={LogIn} className="w-full" size="lg" disabled={busy}>
          {t('auth.loginBtn')}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-400">
        <Link to="/signup" className="font-semibold text-indigo-300 transition hover:text-indigo-200">
          {t('auth.toSignup')}
        </Link>
      </p>
    </AuthShell>
  )
}
