import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Award,
  ChevronRight,
  FileSearch,
  FileText,
  Flame,
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
import { SearchPalette } from './SearchPalette'
import { ProgressBar } from './ui'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/cases', label: 'Cases', icon: FileSearch },
  { to: '/my-analyses', label: 'My Analyses', icon: Radar },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/achievements', label: 'Achievements', icon: Award },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

function Logo({ compact }: { compact?: boolean }) {
  return (
    <NavLink to="/dashboard" className="flex items-center gap-2.5" aria-label="System Analyst Simulator home">
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
  const theme = data.settings.theme
  const next = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark'
  const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor
  const label = theme === 'dark' ? 'Dark mode (click for light)' : theme === 'light' ? 'Light mode (click for system)' : 'System theme (click for dark)'
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

function LevelPopover() {
  const { data } = useApp()
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
        aria-label="Analyst status"
        title="Analyst status"
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
          <p className="text-xs font-bold uppercase tracking-widest text-muted">Analyst Status</p>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="font-display text-sm font-bold text-slate-900 dark:text-white">
                Lv {lvl.info.level} · {lvl.info.title}
              </p>
              <p className="text-xs text-muted">{data.profile.xp} XP total</p>
            </div>
            <span className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-1 text-xs font-bold text-amber-500">
              <Flame className="h-3.5 w-3.5" />
              {data.profile.streak}d
            </span>
          </div>
          <ProgressBar value={lvl.progress} className="mt-3" />
          <p className="mt-1.5 text-[11px] text-muted">
            {lvl.next
              ? `${lvl.needed - lvl.intoLevel} XP to Level ${lvl.next.level} — ${lvl.next.title}`
              : 'Maximum level reached'}
          </p>
        </div>
      )}
    </div>
  )
}

function Sidebar() {
  const { data } = useApp()
  const lvl = levelForXP(data.profile.xp)
  const location = useLocation()

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#080d18]/90 lg:flex no-print"
      aria-label="Primary navigation"
    >
      <div className="px-5 pb-6 pt-5">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
          Workspace
        </p>
        {NAV.map((n) => {
          const active = location.pathname === n.to || (n.to !== '/dashboard' && location.pathname.startsWith(n.to))
          const Icon = n.icon
          return (
            <NavLink key={n.to} to={n.to} className={cn('nav-item', active && 'nav-item-active')}>
              <Icon className="h-4.5 w-4.5 shrink-0" />
              {n.label}
            </NavLink>
          )
        })}
      </nav>
      <div className="border-t border-slate-200/70 p-4 dark:border-white/[0.06]">
        <div className="rounded-xl bg-gradient-to-br from-indigo-500/10 to-cyan-400/[0.07] p-3.5 dark:from-indigo-500/[0.14] dark:to-cyan-400/[0.08]">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-300">
              Level {lvl.info.level}
            </p>
            <p className="text-[11px] font-semibold text-muted">{data.profile.xp} XP</p>
          </div>
          <p className="mt-0.5 font-display text-sm font-semibold text-slate-800 dark:text-slate-100">
            {lvl.info.title}
          </p>
          <ProgressBar value={lvl.progress} className="mt-2.5" />
          {lvl.next && (
            <p className="mt-1.5 text-[10px] text-muted">
              {lvl.needed - lvl.intoLevel} XP to {lvl.next.title}
            </p>
          )}
        </div>
      </div>
    </aside>
  )
}

function TopBar({ onSearch }: { onSearch: () => void }) {
  const { data } = useApp()
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
          <Logo compact />
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
          aria-label="Search (Ctrl K)"
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-400 shadow-sm transition hover:border-indigo-300 hover:text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-indigo-400/40 dark:hover:text-slate-300"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search…</span>
          <kbd className="hidden rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:border-white/10 dark:bg-white/5 md:inline">
            ⌘K
          </kbd>
        </button>

        <ThemeToggle />
        <LevelPopover />

        <div className="flex items-center gap-2.5 border-l border-slate-200 pl-3 dark:border-white/10">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 font-display text-sm font-bold text-white">
            A
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">Analyst</span>
            <span className="block text-[11px] text-muted">{lvl.info.title}</span>
          </span>
        </div>
      </div>
    </header>
  )
}

function BottomNav() {
  const location = useLocation()
  const items = [NAV[0], NAV[1], NAV[2], NAV[4], NAV[5]]
  return (
    <nav
      aria-label="Mobile navigation"
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
              aria-label={n.label}
              className={cn(
                'flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors',
                active ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-400 dark:text-slate-500',
              )}
            >
              <Icon className="h-5 w-5" />
              {n.label.replace('My Analyses', 'Analyses').replace('Achievements', 'Awards')}
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
