import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  ClipboardList,
  FileText,
  Search,
  Users,
} from 'lucide-react'
import { CASES, getCase } from '../data/cases'
import { useApp } from '../context/AppContext'
import { cn } from '../lib/utils'
import type { IconType } from '../types'

interface SearchResult {
  id: string
  group: string
  icon: IconType
  title: string
  subtitle: string
  to: string
}

export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data } = useApp()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      setTimeout(() => inputRef.current?.focus(), 40)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase()
    const out: SearchResult[] = []
    if (!q) return out

    for (const c of CASES) {
      if (`${c.title} ${c.industry} ${c.tagline}`.toLowerCase().includes(q)) {
        const analysis = data.analyses[c.id]
        out.push({
          id: `case-${c.id}`,
          group: 'Cases',
          icon: Briefcase,
          title: c.title,
          subtitle: `${c.industry} · ${c.difficulty}${analysis ? ' · in progress' : ''}`,
          to: analysis ? `/analysis/${c.id}/${analysis.lastStep}` : `/cases/${c.id}`,
        })
      }
    }

    for (const a of Object.values(data.analyses)) {
      const c = getCase(a.caseId)
      for (const s of a.stakeholders) {
        if (`${s.name} ${s.role} ${s.department}`.toLowerCase().includes(q))
          out.push({
            id: `sh-${s.id}`,
            group: 'Stakeholders',
            icon: Users,
            title: s.name,
            subtitle: `${s.role} · ${c?.title ?? a.caseId}`,
            to: `/analysis/${a.caseId}/investigation`,
          })
      }
      for (const p of a.problems) {
        if (`${p.title} ${p.description}`.toLowerCase().includes(q))
          out.push({
            id: `pb-${p.id}`,
            group: 'Problems',
            icon: AlertCircle,
            title: p.title,
            subtitle: c?.title ?? a.caseId,
            to: `/analysis/${a.caseId}/problems`,
          })
      }
      for (const r of [...a.functionalRequirements, ...a.nonFunctionalRequirements]) {
        if (`${r.code} ${r.requirement}`.toLowerCase().includes(q))
          out.push({
            id: `req-${r.id}`,
            group: 'Requirements',
            icon: ClipboardList,
            title: `${r.code} — ${r.requirement}`,
            subtitle: c?.title ?? a.caseId,
            to: `/analysis/${a.caseId}/requirements`,
          })
      }
      if (a.evaluation || a.status === 'completed' || 'report'.includes(q)) {
        if (`report ${c?.title ?? a.caseId} system analysis report`.toLowerCase().includes(q) || 'report'.includes(q))
          out.push({
            id: `rep-${a.caseId}`,
            group: 'Reports',
            icon: FileText,
            title: `Analysis Report — ${c?.title ?? a.caseId}`,
            subtitle: a.evaluation ? `Score ${a.evaluation.total}/100 · ${a.status}` : a.status,
            to: `/analysis/${a.caseId}/report`,
          })
      }
    }
    return out.slice(0, 14)
  }, [query, data.analyses])

  useEffect(() => setActive(0), [results.length])

  const select = (r: SearchResult) => {
    navigate(r.to)
    onClose()
  }

  const groups = useMemo(() => {
    const map = new Map<string, SearchResult[]>()
    results.forEach((r) => {
      if (!map.has(r.group)) map.set(r.group, [])
      map.get(r.group)!.push(r)
    })
    return [...map.entries()]
  }, [results])

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center px-3 pt-[10vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Global search"
            initial={{ opacity: 0, y: -14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0d1526]"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-white/[0.06]">
              <Search className="h-4.5 w-4.5 shrink-0 text-slate-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    setActive((a) => Math.min(results.length - 1, a + 1))
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    setActive((a) => Math.max(0, a - 1))
                  } else if (e.key === 'Enter' && results[active]) {
                    select(results[active])
                  }
                }}
                placeholder="Search cases, stakeholders, problems, requirements…"
                aria-label="Search"
                className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
              />
              <kbd className="hidden shrink-0 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:border-white/10 dark:bg-white/5 sm:block">
                ESC
              </kbd>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-2">
              {query.trim() === '' && (
                <p className="px-3 py-8 text-center text-sm text-muted">
                  Search across all your analyses and cases.
                </p>
              )}
              {query.trim() !== '' && results.length === 0 && (
                <p className="px-3 py-8 text-center text-sm text-muted">
                  No results found for “{query.trim()}”.
                </p>
              )}
              {groups.map(([group, items]) => (
                <div key={group} className="mb-1">
                  <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {group}
                  </p>
                  {items.map((r) => {
                    const idx = results.indexOf(r)
                    const Icon = r.icon
                    return (
                      <button
                        key={r.id}
                        onClick={() => select(r)}
                        onMouseEnter={() => setActive(idx)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                          idx === active ? 'bg-indigo-500/10 dark:bg-indigo-400/10' : '',
                        )}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-slate-300">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                            {r.title}
                          </span>
                          <span className="block truncate text-xs text-muted">{r.subtitle}</span>
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-slate-600" />
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 border-t border-slate-100 px-4 py-2 text-[10px] text-slate-400 dark:border-white/[0.06] dark:text-slate-500">
              <span>
                <kbd className="font-sans">↑↓</kbd> navigate
              </span>
              <span>
                <kbd className="font-sans">↵</kbd> open
              </span>
              <span>
                <kbd className="font-sans">esc</kbd> close
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
