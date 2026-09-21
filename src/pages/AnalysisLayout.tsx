import { useEffect, useMemo } from 'react'
import { Navigate, NavLink, Outlet, useLocation, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ClipboardList,
  FileText,
  Gauge,
  GitBranch,
  Lightbulb,
  Users,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getCase } from '../data/cases'
import { computeOverallProgress } from '../lib/scoring'
import { cn } from '../lib/utils'
import { Badge, ProgressBar } from '../components/ui'
import type { AnalysisStepKey, CaseProgress, CaseScenario, IconType } from '../types'

export interface AnalysisCtx {
  analysis: CaseProgress
  cs: CaseScenario
}

const STEPS: { key: AnalysisStepKey; label: string; icon: IconType }[] = [
  { key: 'investigation', label: 'Investigation', icon: Users },
  { key: 'problems', label: 'Problems', icon: AlertCircle },
  { key: 'requirements', label: 'Requirements', icon: ClipboardList },
  { key: 'modeling', label: 'Modeling', icon: GitBranch },
  { key: 'solution', label: 'Solution', icon: Lightbulb },
  { key: 'evaluation', label: 'Evaluation', icon: Gauge },
  { key: 'report', label: 'Report', icon: FileText },
]

export function stepHasContent(a: CaseProgress, step: AnalysisStepKey): boolean {
  switch (step) {
    case 'investigation':
      return a.stakeholders.length > 0 || a.interviews.length > 0
    case 'problems':
      return a.problems.length > 0 || a.rootCauses.length > 0
    case 'requirements':
      return a.functionalRequirements.length > 0 || a.nonFunctionalRequirements.length > 0
    case 'modeling':
      return a.useCases.length > 0 || a.processSteps.length > 0 || !!a.asIsToBe.currentProcess.trim()
    case 'solution':
      return !!a.solution.name.trim() || a.features.length > 0 || a.risks.length > 0
    case 'evaluation':
      return !!a.evaluation
    case 'report':
      return !!a.reportGeneratedAt
  }
}

function Stepper({ analysis, caseId }: { analysis: CaseProgress; caseId: string }) {
  const location = useLocation()
  const current = (location.pathname.split('/').pop() || 'investigation') as AnalysisStepKey
  const currentIdx = Math.max(0, STEPS.findIndex((s) => s.key === current))

  return (
    <nav aria-label="Analysis workflow" className="overflow-x-auto pb-1">
      <ol className="flex min-w-max items-center gap-1 sm:gap-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const done = stepHasContent(analysis, s.key)
          const active = s.key === current || (i === 0 && current === analysis.caseId)
          const reachable = true
          return (
            <li key={s.key} className="flex items-center">
              <NavLink
                to={`/analysis/${caseId}/${s.key}`}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'group flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold transition-all sm:px-3',
                  active
                    ? 'bg-gradient-to-r from-indigo-500/15 to-cyan-400/10 text-indigo-600 dark:from-indigo-500/20 dark:to-cyan-400/10 dark:text-indigo-300'
                    : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-white/[0.04] dark:hover:text-slate-300',
                  !reachable && 'pointer-events-none opacity-40',
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold transition',
                    active
                      ? 'border-indigo-400/60 bg-indigo-500 text-white shadow-sm shadow-indigo-500/40'
                      : done
                        ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-500'
                        : 'border-slate-300 text-slate-400 dark:border-white/15 dark:text-slate-500',
                  )}
                >
                  {done && !active ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                </span>
                <span className="hidden md:inline">{s.label}</span>
              </NavLink>
              {i < STEPS.length - 1 && (
                <span
                  className={cn(
                    'mx-0.5 h-px w-4 sm:w-6',
                    i < currentIdx || stepHasContent(analysis, STEPS[i + 1].key)
                      ? 'bg-indigo-300/60 dark:bg-indigo-400/30'
                      : 'bg-slate-200 dark:bg-white/10',
                  )}
                  aria-hidden
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default function AnalysisLayout() {
  const { id } = useParams()
  const location = useLocation()
  const { data, setLastStep, lastSavedAt } = useApp()

  const cs = id ? getCase(id) : undefined
  const analysis = id ? data.analyses[id] : undefined

  const step = useMemo(() => {
    const last = location.pathname.split('/').pop() ?? 'investigation'
    return (STEPS.some((s) => s.key === last) ? last : 'investigation') as AnalysisStepKey
  }, [location.pathname])

  useEffect(() => {
    if (id && analysis) setLastStep(id, step)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, step])

  if (!cs) return <Navigate to="/cases" replace />
  if (!analysis) return <Navigate to={`/cases/${cs.id}`} replace />
  if (location.pathname === `/analysis/${cs.id}` || location.pathname === `/analysis/${cs.id}/`) {
    return <Navigate to={`/analysis/${cs.id}/${analysis.lastStep}`} replace />
  }

  const pct = computeOverallProgress(analysis)

  return (
    <div className="space-y-5">
      {/* Case header */}
      <div className="flex flex-col gap-4 no-print">
        <NavLink
          to={`/cases/${cs.id}`}
          className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-muted transition hover:text-indigo-500"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Case Brief
        </NavLink>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-cyan-400/10 text-indigo-500 dark:text-indigo-300">
              <cs.icon className="h-6 w-6" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">
                  {cs.title}
                </h1>
                {analysis.status === 'completed' && (
                  <Badge tone="emerald" icon={CheckCircle2}>
                    Completed
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted">
                {cs.industry} · {cs.difficulty}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <motion.span
              key={lastSavedAt}
              initial={{ opacity: 0.4, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300"
              role="status"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Saved
            </motion.span>
            <div className="hidden w-40 sm:block">
              <div className="mb-1 flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted">
                <span>Progress</span>
                <span>{pct}%</span>
              </div>
              <ProgressBar value={pct} />
            </div>
          </div>
        </div>
        <div className="card p-2">
          <Stepper analysis={analysis} caseId={cs.id} />
        </div>
      </div>

      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Outlet context={{ analysis, cs } satisfies AnalysisCtx} />
      </motion.div>
    </div>
  )
}
