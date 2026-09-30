import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Database,
  Download,
  FileUp,
  Globe,
  LogOut,
  Monitor,
  Moon,
  Palette,
  Pencil,
  Save,
  ShieldCheck,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react'
import { Button, Card, Field, Input, SectionHeader, Segmented, Select } from '../components/ui'
import { ConfirmDialog } from '../components/Modal'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ROLE_KEYS, roleOptions } from '../i18n'
import type { TranslationKey } from '../i18n'
import { useI18n } from '../i18n/useI18n'
import type { Lang } from '../i18n'
import type { AccountRole, Theme } from '../types'

export default function Settings() {
  const { data, setTheme, setLanguage, exportData, importData, clearAll, isAdmin } = useApp()
  const { account, logout, updateProfile } = useAuth()
  const { t } = useI18n()
  const toast = useToast()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileName, setProfileName] = useState(account?.name ?? '')
  const [profileRole, setProfileRole] = useState<AccountRole | ''>(account?.role ?? '')
  const [profileCustomRole, setProfileCustomRole] = useState(account?.customRole ?? '')
  const [profileError, setProfileError] = useState<TranslationKey | null>(null)

  const beginProfileEdit = () => {
    if (!account) return
    setProfileName(account.name)
    setProfileRole(account.role)
    setProfileCustomRole(account.customRole ?? '')
    setProfileError(null)
    setEditingProfile(true)
  }

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = updateProfile({ name: profileName, role: profileRole, customRole: profileCustomRole })
    if (!result.ok) {
      setProfileError(result.error ?? 'profile.err.nameRequired')
      return
    }
    setProfileError(null)
    setEditingProfile(false)
    toast.success(t('profile.updated'), t('profile.updatedDesc'))
  }

  const handleExport = () => {
    if (exportData()) toast.success(t('toast.exported'), t('toast.exportedDesc'))
    else toast.error(t('toast.exportFailed'), t('toast.exportFailedDesc'))
  }

  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text()
      if (!importData(text)) {
        toast.error(t('toast.invalidImport'), t('toast.invalidImportDesc'))
      } else {
        navigate('/dashboard')
      }
    } catch {
      toast.error(t('toast.invalidImport'), t('toast.invalidImportDesc'))
    }
  }

  const analysesCount = Object.keys(data.analyses).length

  return (
    <div className="space-y-6">
      <SectionHeader title={t('st.title')} subtitle={t('st.subtitle')} />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        {/* Account */}
        {account && (
          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 font-display text-base font-bold text-white">
                  {account.name
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((w) => w[0]?.toUpperCase())
                    .join('')}
                </span>
                <div>
                  <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                    {t('st.account')}
                  </h2>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {t('st.signedInAs')} {account.name}
                  </p>
                  <p className="text-xs text-muted">
                    {account.email} ·{' '}
                    {account.role === 'other' ? (account.customRole ?? t('role.other')) : t(ROLE_KEYS[account.role])}
                    {isAdmin && (
                      <span className="ml-1.5 inline-flex items-center gap-1 rounded-md bg-violet-500/10 px-1.5 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-violet-500 dark:text-violet-300">
                        <ShieldCheck className="h-3 w-3" /> {t('admin.badge')}
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted">{t('st.accountDesc')}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {!editingProfile && (
                  <Button variant="secondary" icon={Pencil} onClick={beginProfileEdit}>
                    {t('profile.edit')}
                  </Button>
                )}
                <Button
                  variant="secondary"
                  icon={LogOut}
                  onClick={() => {
                    logout()
                    navigate('/login')
                  }}
                >
                  {t('menu.logout')}
                </Button>
              </div>
            </div>
            {editingProfile && (
              <form onSubmit={handleProfileSubmit} className="mt-5 border-t border-slate-100 pt-5 dark:border-white/[0.06]">
                <div className="mb-4">
                  <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                    {t('profile.edit')}
                  </h3>
                  <p className="mt-1 text-xs text-muted">{t('profile.editSubtitle')}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t('auth.name')}>
                    <Input
                      autoComplete="name"
                      value={profileName}
                      onChange={(event) => setProfileName(event.target.value)}
                      aria-label={t('auth.name')}
                      required
                    />
                  </Field>
                  <Field label={t('auth.email')} hint={t('profile.emailHint')}>
                    <Input value={account.email} aria-label={t('auth.email')} readOnly />
                  </Field>
                  <Field label={t('auth.role')} hint={t('profile.roleHint')} className="sm:col-span-2">
                    <Select
                      value={profileRole}
                      onChange={(event) => setProfileRole(event.target.value as AccountRole | '')}
                      aria-label={t('auth.role')}
                      options={[
                        { value: '', label: t('auth.rolePh') },
                        ...roleOptions().map((role) => ({ value: role, label: t(ROLE_KEYS[role]) })),
                      ]}
                      required
                    />
                  </Field>
                  {profileRole === 'other' && (
                    <Field label={t('auth.roleOther')} className="sm:col-span-2">
                      <Input
                        value={profileCustomRole}
                        onChange={(event) => setProfileCustomRole(event.target.value)}
                        placeholder={t('auth.roleOtherPh')}
                        aria-label={t('auth.roleOther')}
                        required
                      />
                    </Field>
                  )}
                </div>
                {profileError && (
                  <p role="alert" className="mt-4 rounded-lg bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-300">
                    {t(profileError)}
                  </p>
                )}
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setEditingProfile(false)
                      setProfileError(null)
                    }}
                  >
                    {t('profile.cancel')}
                  </Button>
                  <Button type="submit" icon={Save}>{t('profile.save')}</Button>
                </div>
              </form>
            )}
            {!isAdmin && <p className="mt-3 text-xs text-muted">{t('admin.hint')}</p>}
          </Card>
        )}

        {/* Appearance */}
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-300">
              <Palette className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">{t('st.appearance')}</h2>
              <p className="text-xs text-muted">{t('st.appearanceDesc')}</p>
            </div>
          </div>
          <div className="mt-5">
            <Segmented<Theme>
              ariaLabel={t('st.themeAria')}
              value={data.settings.theme}
              onChange={setTheme}
              options={[
                {
                  value: 'dark',
                  label: (
                    <span className="inline-flex items-center gap-1.5">
                      <Moon className="h-3.5 w-3.5" /> {t('theme.dark')}
                    </span>
                  ),
                },
                {
                  value: 'light',
                  label: (
                    <span className="inline-flex items-center gap-1.5">
                      <Sun className="h-3.5 w-3.5" /> {t('theme.light')}
                    </span>
                  ),
                },
                {
                  value: 'system',
                  label: (
                    <span className="inline-flex items-center gap-1.5">
                      <Monitor className="h-3.5 w-3.5" /> {t('theme.system')}
                    </span>
                  ),
                },
              ]}
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {(['dark', 'light', 'system'] as Theme[]).map((th) => {
                const active = data.settings.theme === th
                return (
                  <button
                    key={th}
                    onClick={() => setTheme(th)}
                    aria-pressed={active}
                    className={`group overflow-hidden rounded-xl border-2 p-2 text-left transition ${
                      active
                        ? 'border-indigo-400/70 shadow-glow-sm'
                        : 'border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20'
                    }`}
                  >
                    <span
                      className={`block h-16 rounded-lg ${
                        th === 'light'
                          ? 'bg-gradient-to-br from-slate-50 to-slate-200'
                          : th === 'dark'
                            ? 'bg-gradient-to-br from-[#0c1322] to-[#05080f]'
                            : 'bg-gradient-to-br from-slate-100 from-50% to-[#05080f] to-50%'
                      }`}
                    >
                      <span className="m-2 block h-2 w-1/2 rounded-full bg-indigo-400/70" />
                      <span className="mx-2 block h-1.5 w-2/3 rounded-full bg-slate-400/40" />
                    </span>
                    <span className="mt-2 block text-center text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {t(th === 'dark' ? 'theme.dark' : th === 'light' ? 'theme.light' : 'theme.system')}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </Card>

        {/* Language */}
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500 dark:text-violet-300">
              <Globe className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">{t('st.language')}</h2>
              <p className="text-xs text-muted">{t('st.languageDesc')}</p>
            </div>
          </div>
          <div className="mt-5">
            <Segmented<Lang>
              ariaLabel={t('st.langAria')}
              value={data.settings.language}
              onChange={setLanguage}
              options={[
                {
                  value: 'en',
                  label: (
                    <span className="inline-flex items-center gap-1.5">
                      <span aria-hidden>🇬🇧</span> {t('lang.en')}
                    </span>
                  ),
                },
                {
                  value: 'id',
                  label: (
                    <span className="inline-flex items-center gap-1.5">
                      <span aria-hidden>🇮🇩</span> {t('lang.id')}
                    </span>
                  ),
                },
              ]}
            />
          </div>
        </Card>

        {/* Data */}
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-500">
              <Database className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">{t('st.data')}</h2>
              <p className="text-xs text-muted">
                {t('st.dataDesc', {
                  analyses: analysesCount,
                  xp: data.profile.xp,
                  achievements: Object.keys(data.unlocked).length,
                })}
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4 dark:border-white/[0.07]">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                <Download className="h-4 w-4 text-indigo-500" /> {t('st.export')}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">{t('st.exportDesc')}</p>
              <Button size="sm" variant="secondary" className="mt-3" icon={FileUp} onClick={handleExport}>
                {t('st.download')}
              </Button>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 dark:border-white/[0.07]">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                <Upload className="h-4 w-4 text-cyan-500" /> {t('st.import')}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">{t('st.importDesc')}</p>
              <Button size="sm" variant="secondary" className="mt-3" icon={Upload} onClick={() => fileRef.current?.click()}>
                {t('st.importBtn')}
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                aria-label={t('st.importAria')}
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleImportFile(f)
                  e.target.value = ''
                }}
              />
            </div>
          </div>
        </Card>

        {/* Danger zone */}
        <Card className="border-rose-200/70 p-6 dark:border-rose-400/20">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">{t('st.danger')}</h2>
              <p className="text-xs text-muted">{t('st.dangerDesc')}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-rose-500/[0.05] p-4 dark:bg-rose-400/[0.05]">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t('st.clear')}</p>
              <p className="text-xs text-muted">{t('st.clearDesc')}</p>
            </div>
            <Button variant="danger" size="sm" icon={Trash2} onClick={() => setConfirmClear(true)}>
              {t('st.clearBtn')}
            </Button>
          </div>
        </Card>

        <p className="pb-2 text-center text-[11px] text-muted">{t('st.version')}</p>
      </motion.div>

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => {
          clearAll()
          navigate('/dashboard')
        }}
        title={t('st.clearDialogTitle')}
        message={t('st.clearDialogMessage')}
        confirmLabel={t('st.clearConfirm')}
      />
    </div>
  )
}
