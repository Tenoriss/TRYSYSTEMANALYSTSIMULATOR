import { useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Gauge,
  ListChecks,
  PartyPopper,
  RefreshCw,
  TrendingUp,
} from 'lucide-react'
import { Badge, Button, Card, SectionHeader } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import type { AnalysisCtx } from '../AnalysisLayout'
import { computeEvaluation, evaluationGate, scoreGrade } from '../../lib/scoring'
import { formatDateTime } from '../../lib/utils'

const BREAKDOWN_META: { key: keyof import('../../types').Evaluation['breakdown']; label: string }[] = [
  { key: 'investigation', label: 'Investigation' },
  { key: 'problems', label: 'Problem Analysis' },
  { key: 'requirements', label: 'Requirements' },
  { key: 'modeling', label: 'Modeling' },
  { key: 'solution', label: 'Solution' },
  { key: 'risk', label: 'Risk Analysis' },
]

function ScoreRing({ score }: { score: number }) {
  const R = 64
  const C = 2 * Math.PI * R
  const grade = scoreGrade(score)
  return (
    <div className="relative mx-auto h-40 w-40">
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
        <circle cx="80" cy="80" r={R} className="fill-none stroke-slate-200 dark:stroke-white/[0.07]" strokeWidth="12" />
        <motion.circle
          cx="80"
          cy="80"
          r={R}
          className="fill-none"
          stroke="url(#scoreGrad)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C - (C * score) / 100 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="font-display text-4xl font-bold text-slate-900 dark:text-white"
        >
          {score}
        </motion.p>
        <p className="text-xs font-semibold text-muted">/ 100</p>
        <Badge
          tone={grade.tone === 'success' ? 'emerald' : grade.tone === 'info' ? 'cyan' : grade.tone === 'warning' ? 'amber' : 'rose'}
          className="mt-1.5"
        >
          {grade.label}
        </Badge>
      </div>
    </div>
  )
}

export default function Evaluation() {
  const { analysis, cs } = useOutletContext<AnalysisCtx>()
  const { setEvaluation, completeCase } = useApp()
  const toast = useToast()
  const [justRan, setJustRan] = useState(false)

  const gate = useMemo(() => evaluationGate(analysis), [analysis])
  const evaluation = analysis.evaluation

  const run = () => {
    const result = computeEvaluation(analysis)
    setEvaluation(analysis.caseId, result)
    setJustRan(true)
    toast.success('Evaluation complete', `Your analysis scored ${result.total}/100.`)
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Evaluation"
        subtitle="A rule-based reviewer scores the completeness and depth of your analysis — no AI, just professional heuristics."
      />

      {/* Gate */}
      {!gate.ok && (
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-500">
              <ClipboardCheck className="h-5.5 w-5.5" />
            </span>
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Minimum requirements not met yet
              </h3>
              <p className="mt-1 text-sm text-muted">
                A score is only meaningful once the core analysis exists. Complete these first:
              </p>
              <ul className="mt-3 space-y-2">
                {gate.checks.map((c) => (
                  <li key={c.label} className="flex items-center gap-2.5 text-sm">
                    {c.done ? (
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                    ) : (
                      <Circle className="h-4.5 w-4.5 text-slate-300 dark:text-slate-600" />
                    )}
                    <span className={c.done ? 'text-muted line-through' : 'font-medium text-slate-700 dark:text-slate-200'}>
                      {c.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Empty evaluation state */}
      {gate.ok && !evaluation && (
        <Card className="p-10 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-cyan-400/10 text-indigo-500 dark:text-indigo-300">
            <Gauge className="h-8 w-8" />
          </span>
          <h3 className="mt-4 font-display text-lg font-semibold text-slate-900 dark:text-white">Ready for review</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            The evaluator will check your stakeholders, interviews, problems, requirements, models, solution, and risk
            register — then produce a score with concrete feedback.
          </p>
          <Button className="mt-6" size="lg" icon={Gauge} onClick={run}>
            Run Evaluation
          </Button>
        </Card>
      )}

      {/* Results */}
      {evaluation && (
        <motion.div
          key={evaluation.computedAt}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          <div className="grid gap-5 lg:grid-cols-5">
            <Card className="flex flex-col items-center justify-center p-6 lg:col-span-2">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Analysis Score</p>
              <div className="mt-4">
                <ScoreRing score={evaluation.total} />
              </div>
              <p className="mt-4 text-center text-xs text-muted">
                Evaluated {formatDateTime(evaluation.computedAt)}
              </p>
              {analysis.status === 'completed' && (
                <Badge tone="emerald" icon={PartyPopper} className="mt-3">
                  Case completed
                </Badge>
              )}
            </Card>

            <Card className="p-6 lg:col-span-3">
              <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">Score Breakdown</h3>
              <div className="mt-4 space-y-3.5">
                {BREAKDOWN_META.map((m, i) => {
                  const b = evaluation.breakdown[m.key]
                  const pct = Math.round((b.score / b.max) * 100)
                  return (
                    <div key={m.key}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{m.label}</span>
                        <span className="font-bold text-muted">
                          {b.score}/{b.max}
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/[0.07]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.15 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
                          className={`h-full rounded-full ${
                            pct >= 75
                              ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                              : pct >= 45
                                ? 'bg-gradient-to-r from-indigo-500 to-cyan-400'
                                : 'bg-gradient-to-r from-amber-400 to-orange-400'
                          }`}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button icon={RefreshCw} variant="secondary" size="sm" onClick={run}>
                  Re-run Evaluation
                </Button>
                {analysis.status !== 'completed' && (
                  <Button
                    size="sm"
                    icon={CheckCircle2}
                    onClick={() => {
                      if (!evaluation) {
                        toast.warning('Run the evaluation first')
                        return
                      }
                      completeCase(analysis.caseId)
                    }}
                  >
                    Mark Analysis as Complete (+100 XP)
                  </Button>
                )}
                <Link to={`/analysis/${analysis.caseId}/report`}>
                  <Button size="sm" variant="ghost" icon={ListChecks}>
                    View Report <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="p-6">
              <h3 className="flex items-center gap-2 font-display text-sm font-bold text-slate-900 dark:text-white">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" /> Strengths
              </h3>
              <ul className="mt-3 space-y-2.5">
                {evaluation.strengths.map((s) => (
                  <li key={s} className="flex gap-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    {s}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-6">
              <h3 className="flex items-center gap-2 font-display text-sm font-bold text-slate-900 dark:text-white">
                <TrendingUp className="h-4.5 w-4.5 text-amber-500" /> Areas to Improve
              </h3>
              <ul className="mt-3 space-y-2.5">
                {evaluation.improvements.map((s) => (
                  <li key={s} className="flex gap-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                    {s}
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-muted dark:bg-white/[0.03]">
                Refine your work in {cs.title} and re-run the evaluation to improve your score.
              </p>
            </Card>
          </div>
        </motion.div>
      )}

      {justRan && evaluation && (
        <p className="text-center text-xs text-muted">
          Score is computed deterministically from your data — improve the analysis, not the evaluator.
        </p>
      )}
    </div>
  )
}
