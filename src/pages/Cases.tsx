import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Award, Clock, Search, SlidersHorizontal } from 'lucide-react'
import { Badge, Card, EmptyState, Input } from '../components/ui'
import { useApp } from '../context/AppContext'
import { CASES, CASE_CATEGORIES } from '../data/cases'
import { computeOverallProgress } from '../lib/scoring'
import { cn } from '../lib/utils'
import { DIFFICULTY_TONE } from './Dashboard'

export default function Cases() {
  const { data } = useApp()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [difficulty, setDifficulty] = useState('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return CASES.filter((c) => {
      if (category !== 'all' && c.industry !== category) return false
      if (difficulty !== 'all' && c.difficulty !== difficulty) return false
      if (q && !`${c.title} ${c.industry} ${c.tagline} ${c.description}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [query, category, difficulty])

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500 dark:text-cyan-300">
          Simulation Library
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Choose Your Case
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted">
          Each case is a real-world style engagement. Investigate the organization, analyze its problems, and design a
          professional solution.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cases by name, industry, or problem…"
            aria-label="Search cases"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {CASE_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition-all',
                category === c.id
                  ? 'border-indigo-400/60 bg-indigo-500/10 text-indigo-600 dark:border-indigo-400/40 dark:bg-indigo-400/10 dark:text-indigo-300'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400 dark:hover:text-slate-200',
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-400" aria-hidden />
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            aria-label="Filter by difficulty"
            className="input w-auto py-1.5 text-xs font-semibold"
          >
            <option value="all">All levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState icon={Search} title="No cases match your filters." description="Try a different search term or category." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c, i) => {
            const analysis = data.analyses[c.id]
            const pct = analysis ? computeOverallProgress(analysis) : 0
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
              >
                <Card hover className="flex h-full flex-col p-5" onClick={() => navigate(`/cases/${c.id}`)}>
                  <div className="flex items-start justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-cyan-400/10 text-indigo-500 dark:text-indigo-300">
                      <c.icon className="h-5.5 w-5.5" />
                    </span>
                    <div className="flex flex-col items-end gap-1.5">
                      <Badge tone={DIFFICULTY_TONE[c.difficulty]}>{c.difficulty}</Badge>
                      {analysis && (
                        <Badge tone={analysis.status === 'completed' ? 'emerald' : 'cyan'}>
                          {analysis.status === 'completed'
                            ? `Score ${analysis.evaluation?.total ?? '—'}`
                            : `${pct}% done`}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <h3 className="mt-3.5 font-display text-base font-semibold text-slate-900 dark:text-white">
                    {c.title}
                  </h3>
                  <p className="mt-0.5 text-xs font-medium text-indigo-500/90 dark:text-cyan-300/90">{c.tagline}</p>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">{c.description}</p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {c.skills.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-white/[0.05] dark:text-slate-400"
                      >
                        {s}
                      </span>
                    ))}
                    {c.skills.length > 3 && (
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:bg-white/[0.05] dark:text-slate-500">
                        +{c.skills.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5 dark:border-white/[0.06]">
                    <div className="flex items-center gap-3 text-[11px] font-medium text-muted">
                      <span className="inline-flex items-center gap-1">
                        <Award className="h-3.5 w-3.5" /> {c.industry}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {c.estimatedTime}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-500 dark:text-indigo-300">
                      {analysis ? 'Continue' : 'Start Case'} <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      <p className="text-center text-xs text-muted">
        6 built-in scenarios · Your progress on each case is saved automatically.{' '}
        <Link to="/my-analyses" className="font-semibold text-indigo-500 hover:underline dark:text-indigo-300">
          View my analyses
        </Link>
      </p>
    </div>
  )
}
