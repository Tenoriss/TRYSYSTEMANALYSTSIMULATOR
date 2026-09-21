import { useNavigate, useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Crosshair,
  GitBranch,
  ListChecks,
  PlayCircle,
  ShieldAlert,
  Target,
  Users,
} from 'lucide-react'
import { Badge, Button, Card } from '../components/ui'
import { useApp } from '../context/AppContext'
import { getCase } from '../data/cases'
import { computeOverallProgress } from '../lib/scoring'
import { DIFFICULTY_TONE } from './Dashboard'

const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 } }

function InfoCard({
  icon: Icon,
  title,
  children,
  delay = 0,
}: {
  icon: typeof Building2
  title: string
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div {...fadeUp} transition={{ delay, duration: 0.35 }}>
      <Card className="h-full p-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 dark:text-indigo-300">
            <Icon className="h-4 w-4" />
          </span>
          <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">{title}</h2>
        </div>
        <div className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{children}</div>
      </Card>
    </motion.div>
  )
}

export default function CaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, startCase } = useApp()
  const cs = id ? getCase(id) : undefined

  if (!cs) {
    return (
      <div className="py-16 text-center">
        <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">Case not found</h1>
        <p className="mt-2 text-sm text-muted">This scenario does not exist in the library.</p>
        <Link to="/cases">
          <Button className="mt-5" icon={ArrowLeft}>
            Back to Case Library
          </Button>
        </Link>
      </div>
    )
  }

  const analysis = data.analyses[cs.id]

  const begin = () => {
    const a = startCase(cs.id)
    navigate(`/analysis/${cs.id}/${a.lastStep}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div {...fadeUp} transition={{ duration: 0.35 }}>
        <button
          onClick={() => navigate('/cases')}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-indigo-500"
        >
          <ArrowLeft className="h-4 w-4" /> Case Library
        </button>
        <Card className="relative overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" aria-hidden />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-400/10 text-indigo-500 dark:text-indigo-300">
              <cs.icon className="h-8 w-8" />
            </span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="indigo">{cs.industry}</Badge>
                <Badge tone={DIFFICULTY_TONE[cs.difficulty]}>{cs.difficulty}</Badge>
                <Badge tone="slate">{cs.estimatedTime}</Badge>
                {analysis && (
                  <Badge tone={analysis.status === 'completed' ? 'emerald' : 'cyan'}>
                    {analysis.status === 'completed' ? 'Completed' : `${computeOverallProgress(analysis)}% complete`}
                  </Badge>
                )}
              </div>
              <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                {cs.title}
              </h1>
              <p className="mt-1 text-sm font-medium text-indigo-500/90 dark:text-cyan-300/90">{cs.tagline}</p>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">{cs.description}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {cs.skills.map((s) => (
                  <span key={s} className="chip text-[11px]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="shrink-0 sm:pl-4">
              <Button size="lg" icon={PlayCircle} onClick={begin}>
                {analysis ? 'Continue Investigation' : 'Start Investigation'}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Briefing grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard icon={Building2} title="Organization Overview" delay={0.05}>
          {cs.organization}
        </InfoCard>
        <InfoCard icon={Crosshair} title="Current Situation" delay={0.08}>
          {cs.currentSituation}
        </InfoCard>
        <InfoCard icon={GitBranch} title="Existing Process" delay={0.11}>
          <ol className="list-decimal space-y-1.5 pl-4">
            {cs.existingProcess.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ol>
        </InfoCard>
        <InfoCard icon={AlertTriangle} title="Known Problems" delay={0.14}>
          <ul className="space-y-1.5">
            {cs.knownProblems.map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                {p}
              </li>
            ))}
          </ul>
        </InfoCard>
        <InfoCard icon={Target} title="Business Objectives" delay={0.17}>
          <ul className="space-y-1.5">
            {cs.objectives.map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                {p}
              </li>
            ))}
          </ul>
        </InfoCard>
        <InfoCard icon={ShieldAlert} title="Constraints" delay={0.2}>
          <ul className="space-y-1.5">
            {cs.constraints.map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                {p}
              </li>
            ))}
          </ul>
        </InfoCard>
        <InfoCard icon={Users} title="Stakeholders You May Meet" delay={0.23}>
          <ul className="space-y-2.5">
            {cs.stakeholdersContext.map((s, i) => (
              <li key={i}>
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  {s.name} <span className="font-normal text-muted">· {s.role}</span>
                </p>
                <p className="text-xs text-muted">{s.concern}</p>
              </li>
            ))}
          </ul>
        </InfoCard>

        {/* Mission */}
        <motion.div {...fadeUp} transition={{ delay: 0.26, duration: 0.35 }}>
          <Card className="relative h-full overflow-hidden border-indigo-200/70 bg-gradient-to-br from-indigo-500/[0.06] to-cyan-400/[0.04] p-5 dark:border-indigo-400/25 dark:from-indigo-500/[0.1] dark:to-cyan-400/[0.06]">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-500 dark:text-indigo-300">
                <ListChecks className="h-4 w-4" />
              </span>
              <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">Your Mission</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Analyze the current system, identify the main problems, define system requirements, and propose an
              improved solution.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Work through the analysis pipeline — investigation, problem analysis, requirements, modeling, solution
              design, and evaluation — then generate your professional report.
            </p>
            <Button className="mt-5" icon={ArrowRight} onClick={begin}>
              {analysis ? 'Continue Investigation' : 'Start Investigation'}
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
