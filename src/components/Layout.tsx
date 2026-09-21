import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Award,
  ChevronRight,
  FileSearch,
  FileText,
  Flame,
  Globe,
  LayoutDashboard,
  Monitor,
  Moon,
  Radar,
  Search,
  Settings as SettingsIcon,
  Sun,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getCase } from '../data/cases'
import { levelForXP } from '../lib/scoring'
import { cn } from '../lib/utils'
import { LEVEL_TITLE_KEYS } from '../i18n'
import type { TranslationKey } from '../i18n'
import { useI18n } from '../i18n/useI18n'
import { SearchPalette } from './SearchPalette'
import { ProgressBar } from './ui'

const NAV: { to: string; key: TranslationKey; icon: typeof LayoutDashboard }[] = [
  { to: '/dashboard', key: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/cases', key: 'nav.cases', icon: FileSearch },
  { to: '/my-analyses', key: 'nav.myAnalyses', icon: Radar },
  { to: '/reports', key: 'nav.reports', icon: FileText },
  { to: '/achievements', key: 'nav.achievements', icon: Award },
  { to: '/settings', key: 'nav.settings', icon: SettingsIcon },
]

function Logo({ compact, ariaLabel }: { compact?: boolean; ariaLabel: string }) {
  return (
    <NavLink to="/dashboard" className="flex items-center gap-2.5" aria-label={ariaLabel}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-sm shadow-indigo-500/40">
        <Radar className="h-5 w-5 text-white" />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block font-display text-[13px] font-bold tracking-tight text-slate-900 dark:text-white">
            System Analyst
          </span>
          <span className="block text-[11px] font-semibold tracking-widest text-indigo-500 dark:text-cyan-300">
            SIMULATOR
          </span>
        </span>
      )}
    </NavLink>
  )
}

function ThemeToggle() {
  const { data, setTheme } = useApp()
  const { t } = useI18n()
  const theme = data.settings.theme
  const next = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark'
  const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor
  const label =
    theme === 'dark' ? t('theme.darkToLight') : theme === 'light' ? t('theme.lightToSystem') : t('theme.systemToDark')
  return (
    <button
      onClick={() => setTheme(next)}
      aria-label={label}
      title={label}
      className="icon-btn border border-slate-200 dark:border-white/10"
    >
      <Icon className="h-4.5 w-4.5" />
    </button>
  )
}

function LanguageToggle() {
  const { data, setLanguage } = useApp()
  const { t } = useI18n()
  const lang = data.settings.language
  const next = lang === 'en' ? 'id' : 'en'
  return (
    <button
      onClick={() => setLanguage(next)}
      aria-label={t('st.langAria')}
      title={t('st.language')}
      className="icon-btn border border-slate-200 font-bold dark:border-white/10"
    >
      <Globe className="h-4 w-4" />
      <span className="text-[10px] uppercase tracking-wide">{lang}</span>
    </button>
  )
}

function LevelPopover() {
  const { data } = useApp()
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const lvl = levelForXP(data.profile.xp)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t('status.title')}
        title={t('status.title')}
        aria-expanded={open}
        className="icon-btn relative border border-slate-200 dark:border-white/10"
      >
        <Flame className="h-4.5 w-4.5 text-amber-500" />
        {data.profile.streak > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-white">
            {data.profile.streak}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-64 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-[#0d1526]">
          <p className="text-xs font-bold uppercase tracking-widest text-muted">{t('status.title')}</p>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="font-display text-sm font-bold text-slate-900 dark:text-white">
                {t('status.levelShort', { level: lvl.info.level })} · {t(LEVEL_TITLE_KEYS[lvl.info.level - 1])}
              </p>
              <p className="text-xs text-muted">{t('status.xpTotal', { xp: data.profile.xp })}</p>
            </div>
            <span className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-1 text-xs font-bold text-amber-500">
              <Flame className="h-3.5 w-3.5" />
              {data.profile.streak}d
            </span>
          </div>
          <ProgressBar value={lvl.progress} className="mt-3" />
          <p className="mt-1.5 text-[11px] text-muted">
            {lvl.next
              ? t('status.toNext', {
                  xp: lvl.needed - lvl.intoLevel,
                  level: lvl.next.level,
                  title: t(LEVEL_TITLE_KEYS[lvl.next.level - 1]),
                })
              : t('status.maxLevel')}
          </p>
        </div>
      )}
    </div>
  )
}

function Sidebar() {
  const { data } = useApp()
  const { t } = useI18n()
  const lvl = levelForXP(data.profile.xp)
  const location = useLocation()

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#080d18]/90 lg:flex no-print"
      aria-label={t('nav.primaryAria')}
    >
      <div className="px-5 pb-6 pt-5">
        <Logo ariaLabel={t('nav.logoAria')} />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
          {t('nav.workspace')}
        </p>
        {NAV.map((n) => {
          const active = location.pathname === n.to || (n.to !== '/dashboard' && location.pathname.startsWith(n.to))
          const Icon = n.icon
          return (
            <NavLink key={n.to} to={n.to} className={cn('nav-item', active && 'nav-item-active')}>
              <Icon className="h-4.5 w-4.5 shrink-0" />
              {t(n.key)}
            </NavLink>
          )
        })}
      </nav>
      <div className="border-t border-slate-200/70 p-4 dark:border-white/[0.06]">
        <div className="rounded-xl bg-gradient-to-br from-indigo-500/10 to-cyan-400/[0.07] p-3.5 dark:from-indigo-500/[0.14] dark:to-cyan-400/[0.08]">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-300">
              {t('status.level', { level: lvl.info.level })}
            </p>
            <p className="text-[11px] font-semibold text-muted">{data.profile.xp} XP</p>
          </div>
          <p className="mt-0.5 font-display text-sm font-semibold text-slate-800 dark:text-slate-100">
            {t(LEVEL_TITLE_KEYS[lvl.info.level - 1])}
          </p>
          <ProgressBar value={lvl.progress} className="mt-2.5" />
          {lvl.next && (
            <p className="mt-1.5 text-[10px] text-muted">
              {t('status.toNextTitle', {
                xp: lvl.needed - lvl.intoLevel,
                title: t(LEVEL_TITLE_KEYS[lvl.next.level - 1]),
              })}
            </p>
          )}
        </div>
      </div>
    </aside>
  )
}

function TopBar({ onSearch }: { onSearch: () => void }) {
  const { data } = useApp()
  const { t } = useI18n()
  const lvl = levelForXP(data.profile.xp)
  const location = useLocation()
  const current = useMemo(
    () =>
      Object.values(data.analyses)
        .filter((a) => a.status === 'in-progress')
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0],
    [data.analyses],
  )
  const currentCase = current ? getCase(current.caseId) : undefined
  const onCaseRoute = location.pathname.startsWith('/analysis/')

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-[#eef1f7]/80 backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#05080f]/80 no-print">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <div className="lg:hidden">
          <Logo compact ariaLabel={t('nav.logoAria')} />
        </div>

        {currentCase && onCaseRoute ? (
          <NavLink
            to={`/analysis/${currentCase.id}/${current?.lastStep ?? 'investigation'}`}
            className="hidden items-center gap-2 rounded-xl border border-indigo-200/70 bg-indigo-50/60 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100/70 dark:border-indigo-400/20 dark:bg-indigo-400/[0.08] dark:text-indigo-300 dark:hover:bg-indigo-400/[0.14] md:flex"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
            </span>
            {currentCase.title}
            <ChevronRight className="h-3.5 w-3.5" />
          </NavLink>
        ) : (
          <div className="hidden md:block" />
        )}

        <div className="flex-1" />

        <button
          onClick={onSearch}
          aria-label={t('nav.searchAria')}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-400 shadow-sm transition hover:border-indigo-300 hover:text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-indigo-400/40 dark:hover:text-slate-300"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">{t('common.search')}</span>
          <kbd className="hidden rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:border-white/10 dark:bg-white/5 md:inline">
            ⌘K
          </kbd>
        </button>

        <LanguageToggle />
        <ThemeToggle />
        <LevelPopover />

        <div className="flex items-center gap-2.5 border-l border-slate-200 pl-3 dark:border-white/10">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 font-display text-sm font-bold text-white">
            {t('profile.analyst').charAt(0)}
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">{t('profile.analyst')}</span>
            <span className="block text-[11px] text-muted">{t(LEVEL_TITLE_KEYS[lvl.info.level - 1])}</span>
          </span>
        </div>
      </div>
    </header>
  )
}

const SHORT_LABELS: Record<string, TranslationKey> = {
  'nav.myAnalyses': 'nav.analysesShort',
  'nav.achievements': 'nav.awardsShort',
}

function BottomNav() {
  const location = useLocation()
  const { t } = useI18n()
  const items = [NAV[0], NAV[1], NAV[2], NAV[4], NAV[5]]
  return (
    <nav
      aria-label={t('nav.mobileAria')}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl dark:border-white/[0.07] dark:bg-[#080d18]/95 lg:hidden no-print"
    >
      <div className="grid grid-cols-5">
        {items.map((n) => {
          const active = location.pathname === n.to || (n.to !== '/dashboard' && location.pathname.startsWith(n.to))
          const Icon = n.icon
          return (
            <NavLink
              key={n.to}
              to={n.to}
              aria-label={t(n.key)}
              className={cn(
                'flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors',
                active ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-400 dark:text-slate-500',
              )}
            >
              <Icon className="h-5 w-5" />
              {t(SHORT_LABELS[n.key] ?? n.key)}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

export function AppLayout() {
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { data } = useApp()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  // First-time onboarding gate
  useEffect(() => {
    if (!data.profile.onboarded && location.pathname !== '/onboarding') {
      navigate('/onboarding', { replace: true })
    }
  }, [data.profile.onboarded, location.pathname, navigate])

  if (!data.profile.onboarded && location.pathname === '/onboarding') {
    return (
      <>
        <Outlet />
        <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      </>
    )
  }

  return (
    <div className="min-h-dvh page-bg">
      <Sidebar />
      <div className="lg:pl-64">
        <TopBar onSearch={() => setSearchOpen(true)} />
        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8">
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
