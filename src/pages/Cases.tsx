import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Lightbulb, RotateCcw, Search, SlidersHorizontal } from 'lucide-react'
import { CASES } from '../data/cases'
import { useApp } from '../context/AppContext'
import { computeOverallProgress } from '../lib/scoring'
import { relativeTime } from '../lib/utils'
import { DIFF_KEYS, INDUSTRY_KEYS } from '../i18n'
import type { TranslationKey } from '../i18n'
import { localizeCase, useI18n } from '../i18n/useI18n'
import { Badge, Card, EmptyState, Input, ProgressBar, SectionHeader } from '../components/ui'
import { DIFFICULTY_TONE } from './Dashboard'
import type { Difficulty } from '../types'

const INDUSTRY_ORDER = [...new Set(CASES.map((c) => c.industry))]

const filterChip = (active: boolean) =>
  `rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-all ${
    active
      ? 'border-indigo-400/60 bg-indigo-500/10 text-indigo-600 dark:border-indigo-300/40 dark:text-indigo-300'
      : 'border-slate-200 bg-white text-muted hover:border-indigo-300 hover:text-slate-700 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-indigo-400/40 dark:hover:text-slate-200'
  }`

export default function Cases() {
  const { data } = useApp()
  const { t, lang } = useI18n()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [industry, setIndustry] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return CASES.map((c) => localizeCase(c, lang)).filter((c) => {
      if (industry && c.industry !== industry) return false
      if (difficulty && c.difficulty !== difficulty) return false
      if (!query) return true
      return `${c.title} ${c.tagline} ${c.industry} ${t(INDUSTRY_KEYS[c.industry])} ${c.objectives.join(' ')}`
        .toLowerCase()
        .includes(query)
    })
  }, [q, industry, difficulty, t, lang])

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500 dark:text-cyan-300">
          {t('cases.kicker')}
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {t('cases.title')}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted">{t('cases.subtitle')}</p>
      </motion.div>

      {/* Search + filters */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="space-y-3"
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-10"
            placeholder={t('cases.searchPlaceholder')}
            aria-label={t('cases.searchAria')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {t('cases.filters')}
          </span>
          <div className="h-4 w-px bg-slate-200 dark:bg-white/10" />
          <span className="text-[11px] font-semibold text-muted">{t('cases.industryLabel')}</span>
          <button className={filterChip(industry === null)} onClick={() => setIndustry(null)}>
            {t('cases.all')}
          </button>
          {INDUSTRY_ORDER.map((ind) => (
            <button
              key={ind}
              className={filterChip(industry === ind)}
              onClick={() => setIndustry(industry === ind ? null : ind)}
            >
              {t(INDUSTRY_KEYS[ind])}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-muted">{t('cases.difficultyLabel')}</span>
          {(['Beginner', 'Intermediate', 'Advanced'] as Difficulty[]).map((d) => (
            <button
              key={d}
              className={filterChip(difficulty === d)}
              onClick={() => setDifficulty(difficulty === d ? null : d)}
            >
              {t(DIFF_KEYS[d])}
            </button>
          ))}
          <span className="ml-auto text-xs font-semibold text-muted">
            {t('cases.showing', { count: filtered.length, total: CASES.length })}
          </span>
        </div>
      </motion.div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title={t('cases.noMatch')}
          description={t('cases.noMatchDesc')}
        />
      ) : (
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
          {filtered.map((c, i) => {
            const analysis = data.analyses[c.id]
            const pct = analysis ? computeOverallProgress(analysis) : 0
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.04 * i }}
              >
                <Card hover className="flex h-full flex-col p-5 sm:p-6" onClick={() => navigate(`/cases/${c.id}`)}>
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-cyan-400/10 text-indigo-500 dark:text-indigo-300">
                      <c.icon className="h-6 w-6" />
                    </span>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <Badge>{t(INDUSTRY_KEYS[c.industry])}</Badge>
                      <Badge tone={DIFFICULTY_TONE[c.difficulty]}>{t(DIFF_KEYS[c.difficulty])}</Badge>
                    </div>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-slate-900 dark:text-white">{c.title}</h3>
                  <p className="mt-1 line-clamp-2 flex-1 text-sm leading-relaxed text-muted">{c.tagline}</p>

                  {analysis ? (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-semibold">
                          {analysis.status === 'completed' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                          {analysis.status === 'completed' ? (
                            <span className="text-emerald-500">
                              {analysis.evaluation
                                ? `${t('status.completed')} · ${t('dash.score', { score: analysis.evaluation.total })}`
                                : t('status.completed')}
                            </span>
                          ) : (
                            <span className="text-cyan-500 dark:text-cyan-300">
                              {t('status.inProgress')} · {relativeTime(analysis.updatedAt, lang)}
                            </span>
                          )}
                        </span>
                        <span className="font-bold text-muted">{pct}%</span>
                      </div>
                      <ProgressBar value={pct} />
                    </div>
                  ) : (
                    <div className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {t('cases.notStarted')}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-white/[0.06]">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                      {t('cases.objectivesCount', { count: c.objectives.length })}
                    </span>
                    {analysis ? (
                      <Badge tone="cyan">
                        <RotateCcw className="h-3 w-3" />
                        {t('common.continue')}
                      </Badge>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-500 transition group-hover:gap-2 dark:text-indigo-300">
                        {t('cases.viewCase')} <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-2 text-xs text-muted"
      >
        <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
        {t('cases.tip')}
      </motion.p>
    </div>
  )
}
