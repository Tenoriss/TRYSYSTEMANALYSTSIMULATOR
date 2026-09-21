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
import { greeting, relativeTime } from '../lib/utils'
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
  const navigate = useNavigate()

  const analyses = Object.values(data.analyses)
  const completed = analyses.filter((a) => a.status === 'completed')
  const inProgress = analyses
    .filter((a) => a.status === 'in-progress')
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  const current = inProgress[0]
  const currentCase = current ? getCase(current.caseId) : undefined
  const reportsCount = analyses.filter((a) => a.reportGeneratedAt).length
  const lvl = levelForXP(data.profile.xp)
  const recent = [...analyses].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3)

  const hour = new Date().getHours()
  const phases = current ? computePhaseProgress(current) : null
  const PHASE_META: { key: keyof NonNullable<typeof phases>; label: string }[] = [
    { key: 'investigation', label: 'Investigation' },
    { key: 'requirements', label: 'Requirements' },
    { key: 'modeling', label: 'Modeling' },
    { key: 'solution', label: 'Solution' },
    { key: 'evaluation', label: 'Evaluation' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div {...fadeUp} transition={{ duration: 0.35 }}>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500 dark:text-cyan-300">
          Analyst Command Center
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {greeting()}, <span className="text-gradient">Analyst</span>.
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          {hour >= 0 && hour < 5
            ? 'The best insights come to those who investigate after dark.'
            : 'Ready to investigate another system?'}
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-6">
        <StatCard icon={CheckCircle2} label="Completed" value={completed.length} tone="bg-emerald-500/10 text-emerald-500" delay={0.02} />
        <StatCard icon={CircleDashed} label="In Progress" value={inProgress.length} tone="bg-sky-500/10 text-sky-500" delay={0.06} />
        <StatCard icon={Zap} label="Total XP" value={data.profile.xp} sub={`Level ${lvl.info.level}`} tone="bg-indigo-500/10 text-indigo-500" delay={0.1} />
        <StatCard icon={Award} label="Analyst Level" value={`Lv ${lvl.info.level}`} sub={lvl.info.title} tone="bg-violet-500/10 text-violet-500" delay={0.14} />
        <StatCard icon={FileText} label="Reports" value={reportsCount} tone="bg-cyan-500/10 text-cyan-500" delay={0.18} />
        <StatCard icon={Flame} label="Streak" value={`${data.profile.streak}d`} sub="active days" tone="bg-amber-500/10 text-amber-500" delay={0.22} />
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Current investigation */}
        <motion.div {...fadeUp} transition={{ delay: 0.12, duration: 0.35 }} className="lg:col-span-3">
          <Card className="relative h-full overflow-hidden p-5 sm:p-6">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" aria-hidden />
            <SectionHeader title="Current Investigation" subtitle="Pick up where you left off" />
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
                      <Badge tone={DIFFICULTY_TONE[currentCase.difficulty]}>{currentCase.difficulty}</Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-muted">
                      {currentCase.industry} · Last activity {relativeTime(current.updatedAt)}
                    </p>
                    <div className="mt-4">
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span className="font-semibold text-muted">Overall progress</span>
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
                    Continue Investigation
                  </Button>
                  <Button variant="secondary" onClick={() => navigate(`/cases/${current.caseId}`)}>
                    Case Brief
                  </Button>
                </div>
              </div>
            ) : (
              <EmptyState
                className="mt-5 border-none py-8"
                icon={FolderSearch}
                title="No active investigation."
                description="Choose a case and start analyzing."
                action={
                  <Link to="/cases">
                    <Button icon={PlusCircle}>Browse Case Library</Button>
                  </Link>
                }
              />
            )}
          </Card>
        </motion.div>

        {/* Progress overview */}
        <motion.div {...fadeUp} transition={{ delay: 0.16, duration: 0.35 }} className="lg:col-span-2">
          <Card className="h-full p-5 sm:p-6">
            <SectionHeader title="Progress Overview" subtitle={currentCase ? currentCase.title : 'Analysis phases'} />
            {phases ? (
              <div className="mt-5 space-y-4">
                {PHASE_META.map((p) => (
                  <div key={p.key}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600 dark:text-slate-300">{p.label}</span>
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
                title="No progress yet."
                description="Start a case and your phase progress will appear here."
                action={
                  <Link to="/cases">
                    <Button variant="secondary" size="sm" icon={ArrowRight}>
                      View Cases
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
          title="Recent Cases"
          subtitle="Your latest investigation activity"
          action={
            <Link to="/cases" className="text-sm font-semibold text-indigo-500 hover:text-indigo-400 dark:text-indigo-300">
              <span className="inline-flex items-center gap-1">
                View all <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          }
        />
        {recent.length === 0 ? (
          <EmptyState
            className="mt-4"
            icon={Briefcase}
            title="No cases yet."
            description="Start your first investigation."
            action={
              <Link to="/cases">
                <Button icon={ArrowRight}>Start Your First Case</Button>
              </Link>
            }
          />
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {recent.map((a) => {
              const c = getCase(a.caseId)
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
                      {a.status === 'completed' ? 'Completed' : 'In Progress'}
                    </Badge>
                  </div>
                  <h3 className="mt-3 font-display text-base font-semibold text-slate-900 dark:text-white">{c.title}</h3>
                  <p className="mt-0.5 text-xs text-muted">
                    {c.industry} · {relativeTime(a.updatedAt)}
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
