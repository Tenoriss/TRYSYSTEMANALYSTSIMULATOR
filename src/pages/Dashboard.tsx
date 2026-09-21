import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  Award,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  FileText,
  Flame,
  FolderSearch,
  PlayCircle,
  PlusCircle,
  Zap,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getCase } from '../data/cases'
import { computeOverallProgress, computePhaseProgress, levelForXP } from '../lib/scoring'
import { relativeTime } from '../lib/utils'
import { DIFF_KEYS, INDUSTRY_KEYS, LEVEL_TITLE_KEYS } from '../i18n'
import type { TranslationKey } from '../i18n'
import { localizeCase, useI18n } from '../i18n/useI18n'
import { Badge, Button, Card, EmptyState, ProgressBar, SectionHeader } from '../components/ui'
import type { BadgeTone } from '../components/ui'
import type { Difficulty, IconType } from '../types'

export const DIFFICULTY_TONE: Record<Difficulty, BadgeTone> = {
  Beginner: 'emerald',
  Intermediate: 'amber',
  Advanced: 'rose',
}

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
}

const PHASE_META: { key: 'investigation' | 'requirements' | 'modeling' | 'solution' | 'evaluation'; labelKey: TranslationKey }[] = [
  { key: 'investigation', labelKey: 'phase.investigation' },
  { key: 'requirements', labelKey: 'phase.requirements' },
  { key: 'modeling', labelKey: 'phase.modeling' },
  { key: 'solution', labelKey: 'phase.solution' },
  { key: 'evaluation', labelKey: 'phase.evaluation' },
]

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
  delay,
}: {
  icon: IconType
  label: string
  value: string | number
  sub?: string
  tone: string
  delay: number
}) {
  return (
    <motion.div {...fadeUp} transition={{ delay, duration: 0.35 }}>
      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{label}</p>
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}>
            <Icon className="h-4 w-4" />
          </span>
        </div>
        <p className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {value}
        </p>
        {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
      </Card>
    </motion.div>
  )
}

export default function Dashboard() {
  const { data } = useApp()
  const { t, lang } = useI18n()
  const navigate = useNavigate()

  const analyses = Object.values(data.analyses)
  const completed = analyses.filter((a) => a.status === 'completed')
  const inProgress = analyses
    .filter((a) => a.status === 'in-progress')
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  const current = inProgress[0]
  const currentCase = current ? localizeCase(getCase(current.caseId), lang) : undefined
  const reportsCount = analyses.filter((a) => a.reportGeneratedAt).length
  const lvl = levelForXP(data.profile.xp)
  const recent = [...analyses].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3)

  const hour = new Date().getHours()
  const greetKey: TranslationKey =
    hour < 5 ? 'dash.greet.late' : hour < 12 ? 'dash.greet.morning' : hour < 17 ? 'dash.greet.afternoon' : 'dash.greet.evening'
  const phases = current ? computePhaseProgress(current) : null

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div {...fadeUp} transition={{ duration: 0.35 }}>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500 dark:text-cyan-300">
          {t('dash.kicker')}
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {t(greetKey)}, <span className="text-gradient">{t('profile.analyst')}</span>.
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          {hour >= 0 && hour < 5 ? t('dash.taglineLate') : t('dash.tagline')}
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-6">
        <StatCard icon={CheckCircle2} label={t('dash.stat.completed')} value={completed.length} tone="bg-emerald-500/10 text-emerald-500" delay={0.02} />
        <StatCard icon={CircleDashed} label={t('dash.stat.inProgress')} value={inProgress.length} tone="bg-sky-500/10 text-sky-500" delay={0.06} />
        <StatCard icon={Zap} label={t('dash.stat.totalXp')} value={data.profile.xp} sub={t('dash.stat.levelSub', { level: lvl.info.level })} tone="bg-indigo-500/10 text-indigo-500" delay={0.1} />
        <StatCard icon={Award} label={t('dash.stat.level')} value={t('status.levelShort', { level: lvl.info.level })} sub={t(LEVEL_TITLE_KEYS[lvl.info.level - 1])} tone="bg-violet-500/10 text-violet-500" delay={0.14} />
        <StatCard icon={FileText} label={t('dash.stat.reports')} value={reportsCount} tone="bg-cyan-500/10 text-cyan-500" delay={0.18} />
        <StatCard icon={Flame} label={t('dash.stat.streak')} value={`${data.profile.streak}d`} sub={t('dash.stat.streakSub')} tone="bg-amber-500/10 text-amber-500" delay={0.22} />
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Current investigation */}
        <motion.div {...fadeUp} transition={{ delay: 0.12, duration: 0.35 }} className="lg:col-span-3">
          <Card className="relative h-full overflow-hidden p-5 sm:p-6">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" aria-hidden />
            <SectionHeader title={t('dash.current.title')} subtitle={t('dash.current.subtitle')} />
            {current && currentCase ? (
              <div className="mt-5">
                <div className="flex items-start gap-4">
                  <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-cyan-400/10 text-indigo-500 dark:text-indigo-300 sm:flex">
                    <currentCase.icon className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                        {currentCase.title}
                      </h3>
                      <Badge tone={DIFFICULTY_TONE[currentCase.difficulty]}>{t(DIFF_KEYS[currentCase.difficulty])}</Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-muted">
                      {t('dash.current.lastActivity', {
                        industry: t(INDUSTRY_KEYS[currentCase.industry]),
                        time: relativeTime(current.updatedAt, lang),
                      })}
                    </p>
                    <div className="mt-4">
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span className="font-semibold text-muted">{t('dash.current.progress')}</span>
                        <span className="font-bold text-indigo-500 dark:text-indigo-300">
                          {computeOverallProgress(current)}%
                        </span>
                      </div>
                      <ProgressBar value={computeOverallProgress(current)} />
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  <Button
                    icon={PlayCircle}
                    onClick={() => navigate(`/analysis/${current.caseId}/${current.lastStep}`)}
                  >
                    {t('dash.current.continue')}
                  </Button>
                  <Button variant="secondary" onClick={() => navigate(`/cases/${current.caseId}`)}>
                    {t('dash.current.caseBrief')}
                  </Button>
                </div>
              </div>
            ) : (
              <EmptyState
                className="mt-5 border-none py-8"
                icon={FolderSearch}
                title={t('dash.current.emptyTitle')}
                description={t('dash.current.emptyDesc')}
                action={
                  <Link to="/cases">
                    <Button icon={PlusCircle}>{t('dash.current.browse')}</Button>
                  </Link>
                }
              />
            )}
          </Card>
        </motion.div>

        {/* Progress overview */}
        <motion.div {...fadeUp} transition={{ delay: 0.16, duration: 0.35 }} className="lg:col-span-2">
          <Card className="h-full p-5 sm:p-6">
            <SectionHeader title={t('dash.progress.title')} subtitle={currentCase ? currentCase.title : t('dash.progress.pending')} />
            {phases ? (
              <div className="mt-5 space-y-4">
                {PHASE_META.map((p) => (
                  <div key={p.key}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600 dark:text-slate-300">{t(p.labelKey)}</span>
                      <span className="font-bold text-muted">{phases[p.key]}%</span>
                    </div>
                    <ProgressBar value={phases[p.key]} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                className="mt-5 border-none py-8"
                icon={Activity}
                title={t('dash.progress.emptyTitle')}
                description={t('dash.progress.emptyDesc')}
                action={
                  <Link to="/cases">
                    <Button variant="secondary" size="sm" icon={ArrowRight}>
                      {t('dash.progress.cta')}
                    </Button>
                  </Link>
                }
              />
            )}
          </Card>
        </motion.div>
      </div>

      {/* Recent cases */}
      <motion.div {...fadeUp} transition={{ delay: 0.2, duration: 0.35 }}>
        <SectionHeader
          title={t('dash.recent.title')}
          subtitle={t('dash.recent.subtitle')}
          action={
            <Link to="/cases" className="text-sm font-semibold text-indigo-500 hover:text-indigo-400 dark:text-indigo-300">
              <span className="inline-flex items-center gap-1">
                {t('common.viewAll')} <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          }
        />
        {recent.length === 0 ? (
          <EmptyState
            className="mt-4"
            icon={Briefcase}
            title={t('dash.recent.emptyTitle')}
            description={t('dash.recent.emptyDesc')}
            action={
              <Link to="/cases">
                <Button icon={ArrowRight}>{t('dash.recent.cta')}</Button>
              </Link>
            }
          />
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {recent.map((a) => {
              const c = localizeCase(getCase(a.caseId), lang)
              if (!c) return null
              const pct = computeOverallProgress(a)
              return (
                <Card
                  key={a.caseId}
                  hover
                  className="p-5"
                  onClick={() => navigate(a.status === 'completed' ? `/analysis/${a.caseId}/report` : `/analysis/${a.caseId}/${a.lastStep}`)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-cyan-400/10 text-indigo-500 dark:text-indigo-300">
                      <c.icon className="h-5 w-5" />
                    </span>
                    <Badge tone={a.status === 'completed' ? 'emerald' : 'cyan'}>
                      {t(a.status === 'completed' ? 'status.completed' : 'status.inProgress')}
                    </Badge>
                  </div>
                  <h3 className="mt-3 font-display text-base font-semibold text-slate-900 dark:text-white">{c.title}</h3>
                  <p className="mt-0.5 text-xs text-muted">
                    {t(INDUSTRY_KEYS[c.industry])} · {relativeTime(a.updatedAt, lang)}
                  </p>
                  <ProgressBar value={pct} className="mt-4" showLabel />
                </Card>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}
