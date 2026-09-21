import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { Button, Field, Input, Select } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { ROLE_KEYS, roleOptions } from '../i18n'
import type { TranslationKey } from '../i18n'
import { useI18n } from '../i18n/useI18n'
import { AuthShell } from './Login'
import type { AccountRole } from '../types'

export default function SignUp() {
  const { signup } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<AccountRole | ''>('')
  const [customRole, setCustomRole] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<TranslationKey | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    const result = await signup({ name, email, password, confirmPassword, role, customRole })
    setBusy(false)
    if (result.ok) navigate('/onboarding', { replace: true })
    else setError(result.error ?? 'auth.err.credentials')
  }

  return (
    <AuthShell note={t('auth.localNote')}>
      <h1 className="font-display text-xl font-bold text-white">{t('auth.signup.title')}</h1>
      <p className="mt-1 text-sm text-slate-400">{t('auth.signup.sub')}</p>

      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <Field label={t('auth.name')}>
          <Input
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('auth.namePh')}
            aria-label={t('auth.name')}
          />
        </Field>
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
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('auth.password')}>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
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
          <Field label={t('auth.confirmPassword')}>
            <Input
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('auth.confirmPasswordPh')}
              aria-label={t('auth.confirmPassword')}
            />
          </Field>
        </div>

        <Field label={t('auth.role')}>
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value as AccountRole | '')}
            aria-label={t('auth.role')}
            options={[
              { value: '', label: t('auth.rolePh') },
              ...roleOptions().map((r) => ({ value: r, label: t(ROLE_KEYS[r]) })),
            ]}
          />
        </Field>
        {role === 'other' && (
          <Field label={t('auth.roleOther')}>
            <Input
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              placeholder={t('auth.roleOtherPh')}
              aria-label={t('auth.roleOther')}
            />
          </Field>
        )}

        {error && (
          <p role="alert" className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300">
            {t(error)}
          </p>
        )}

        <Button type="submit" icon={UserPlus} className="w-full" size="lg" disabled={busy}>
          {t('auth.signupBtn')}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-400">
        <Link to="/login" className="font-semibold text-indigo-300 transition hover:text-indigo-200">
          {t('auth.toLogin')}
        </Link>
      </p>
    </AuthShell>
  )
}
