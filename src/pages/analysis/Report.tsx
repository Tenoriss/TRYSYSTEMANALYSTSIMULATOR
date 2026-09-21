import { useEffect, useMemo, useRef } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText, Printer } from 'lucide-react'
import { Badge, Button } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import type { AnalysisCtx } from '../AnalysisLayout'
import { riskScore } from '../../lib/scoring'
import { formatDate } from '../../lib/utils'

/* ------------------------------ Section shell ------------------------------ */

function Section({
  n,
  title,
  children,
  empty,
}: {
  n: number
  title: string
  children: React.ReactNode
  empty?: boolean
}) {
  return (
    <section className="print-area card p-5 sm:p-6">
      <h2 className="flex items-baseline gap-2.5 font-display text-base font-bold text-slate-900 dark:text-white">
        <span className="text-gradient">{String(n).padStart(2, '0')}</span>
        {title}
      </h2>
      {empty ? (
        <p className="mt-3 text-sm italic text-slate-400 dark:text-slate-500">No data recorded for this section.</p>
      ) : (
        <div className="mt-3.5">{children}</div>
      )}
    </section>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{children}</p>
}

function KV({ k, v }: { k: string; v?: string }) {
  if (!v?.trim()) return null
  return (
    <div className="rounded-lg bg-slate-50 p-3 dark:bg-white/[0.03]">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{k}</p>
      <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">{v}</p>
    </div>
  )
}

/* ---------------------------------- Page ----------------------------------- */

export default function Report() {
  const { analysis, cs } = useOutletContext<AnalysisCtx>()
  const { markReportGenerated } = useApp()
  const marked = useRef(false)

  useEffect(() => {
    if (!marked.current && !analysis.reportGeneratedAt) {
      marked.current = true
      markReportGenerated(analysis.caseId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysis.caseId])

  const execSummary = useMemo(() => {
    const a = analysis
    const critical = a.problems.filter((p) => p.severity === 'Critical' || p.severity === 'High').length
    const parts: string[] = []
    parts.push(
      `This report presents a system analysis of ${cs.title} (${cs.industry}), conducted through stakeholder investigation, problem analysis, requirements engineering, system modeling, and solution design.`,
    )
    if (a.stakeholders.length || a.interviews.length)
      parts.push(
        `The investigation covered ${a.stakeholders.length} stakeholder${a.stakeholders.length === 1 ? '' : 's'} and ${a.interviews.length} interview record${a.interviews.length === 1 ? '' : 's'}.`,
      )
    if (a.problems.length)
      parts.push(
        `${a.problems.length} problems were identified${critical ? `, ${critical} of high or critical severity` : ''}, supported by root cause analysis.`,
      )
    if (a.functionalRequirements.length || a.nonFunctionalRequirements.length)
      parts.push(
        `The analysis produced ${a.functionalRequirements.length} functional and ${a.nonFunctionalRequirements.length} non-functional requirements.`,
      )
    if (a.solution.name.trim())
      parts.push(`The proposed solution, “${a.solution.name}”, defines ${a.features.length} prioritized feature${a.features.length === 1 ? '' : 's'} and ${a.risks.length} identified risk${a.risks.length === 1 ? '' : 's'}.`)
    if (a.evaluation)
      parts.push(`Overall analysis completeness was evaluated at ${a.evaluation.total}/100.`)
    return parts.join(' ')
  }, [analysis, cs])

  const hasAsIs = Object.values({
    currentProcess: analysis.asIsToBe.currentProcess,
    currentProblems: analysis.asIsToBe.currentProblems,
    currentTools: analysis.asIsToBe.currentTools,
    bottlenecks: analysis.asIsToBe.bottlenecks,
  }).some((v) => v.trim())
  const hasToBe = [analysis.asIsToBe.proposedProcess, analysis.asIsToBe.newSystem, analysis.asIsToBe.improvements].some(
    (v) => v.trim(),
  )
  const hasSolution = Object.values(analysis.solution).some((v) => v.trim()) || analysis.features.length > 0

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link to={`/analysis/${analysis.caseId}/evaluation`}>
          <Button variant="ghost" size="sm" icon={ArrowLeft}>
            Back to Evaluation
          </Button>
        </Link>
        <Button icon={Printer} onClick={() => window.print()}>
          Print / Save as PDF
        </Button>
      </motion.div>

      {/* Document */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl space-y-5">
        {/* Cover header */}
        <div className="print-area card relative overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl no-print" aria-hidden />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-500 dark:text-cyan-300">
                System Analysis Report
              </p>
              <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                {cs.title}
              </h1>
              <p className="mt-1 text-sm text-muted">
                {cs.industry} · {cs.difficulty}
              </p>
            </div>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-cyan-400/10 text-indigo-500 dark:text-indigo-300">
              <cs.icon className="h-6 w-6" />
            </span>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 text-xs text-muted dark:border-white/[0.06]">
            <Badge tone="slate">Prepared by: Analyst</Badge>
            <Badge tone="slate">{formatDate(analysis.updatedAt)}</Badge>
            <Badge tone={analysis.status === 'completed' ? 'emerald' : 'cyan'}>
              {analysis.status === 'completed' ? 'Completed' : 'In progress'}
            </Badge>
            {analysis.evaluation && <Badge tone="indigo">Score: {analysis.evaluation.total}/100</Badge>}
          </div>
        </div>

        {/* 1 Executive summary */}
        <Section n={1} title="Executive Summary">
          <P>{execSummary}</P>
        </Section>

        {/* 2 Organization */}
        <Section n={2} title="Organization Overview">
          <P>{cs.organization}</P>
        </Section>

        {/* 3 Current situation */}
        <Section n={3} title="Current Situation">
          <P>{cs.currentSituation}</P>
          {analysis.asIsToBe.currentTools.trim() && (
            <div className="mt-3">
              <KV k="Current tools" v={analysis.asIsToBe.currentTools} />
            </div>
          )}
          <div className="mt-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Existing process</p>
            <ol className="mt-1.5 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {cs.existingProcess.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
          </div>
        </Section>

        {/* 4 Stakeholders */}
        <Section n={4} title="Stakeholder Analysis" empty={analysis.stakeholders.length === 0}>
          <div className="overflow-x-auto">
            <table className="table-base min-w-[520px]">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Influence</th>
                  <th>Interest</th>
                  <th>Main concern</th>
                </tr>
              </thead>
              <tbody>
                {analysis.stakeholders.map((s) => (
                  <tr key={s.id}>
                    <td className="font-semibold">{s.name}</td>
                    <td>{s.role}</td>
                    <td>{s.department || '—'}</td>
                    <td>{s.influence}</td>
                    <td>{s.interest}</td>
                    <td className="max-w-[200px]">{s.concern || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {analysis.interviews.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Interview highlights ({analysis.interviews.length})
              </p>
              {analysis.interviews.slice(0, 5).map((iv) => (
                <div key={iv.id} className="rounded-lg bg-slate-50 p-3 text-xs leading-relaxed dark:bg-white/[0.03]">
                  <p className="font-semibold text-slate-700 dark:text-slate-200">
                    {iv.stakeholder} — “{iv.question}”
                  </p>
                  <p className="mt-1 text-slate-500 dark:text-slate-400">{iv.answer}</p>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* 5 Problems */}
        <Section n={5} title="Problem Analysis" empty={analysis.problems.length === 0}>
          <div className="overflow-x-auto">
            <table className="table-base min-w-[560px]">
              <thead>
                <tr>
                  <th>Problem</th>
                  <th>Severity</th>
                  <th>Frequency</th>
                  <th>Impact</th>
                </tr>
              </thead>
              <tbody>
                {analysis.problems.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <p className="font-semibold">{p.title}</p>
                      {p.description && <p className="mt-0.5 text-xs text-muted">{p.description}</p>}
                    </td>
                    <td>{p.severity}</td>
                    <td>{p.frequency}</td>
                    <td className="max-w-[220px]">{p.impact || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* 6 Root cause */}
        <Section
          n={6}
          title="Root Cause Analysis"
          empty={analysis.rootCauses.length === 0 && !analysis.problems.some((p) => p.rootCause.trim())}
        >
          <div className="space-y-3">
            {analysis.problems
              .filter((p) => p.rootCause.trim())
              .map((p) => (
                <div key={p.id} className="rounded-lg bg-slate-50 p-3 dark:bg-white/[0.03]">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{p.title}</p>
                  <p className="mt-1 text-sm text-muted">
                    <span className="font-semibold text-indigo-500 dark:text-indigo-300">Root cause: </span>
                    {p.rootCause}
                  </p>
                </div>
              ))}
            {analysis.rootCauses.map((rc) => (
              <div key={rc.id} className="rounded-lg border border-slate-100 p-3 dark:border-white/[0.06]">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{rc.problem}</p>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs leading-relaxed text-muted">
                  {rc.whys.filter((w) => w.trim()).map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ol>
                {rc.conclusion.trim() && (
                  <p className="mt-2 text-xs">
                    <span className="font-bold text-emerald-600 dark:text-emerald-300">Conclusion: </span>
                    {rc.conclusion}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* 7 FR */}
        <Section n={7} title="Functional Requirements" empty={analysis.functionalRequirements.length === 0}>
          <div className="overflow-x-auto">
            <table className="table-base min-w-[560px]">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Requirement</th>
                  <th>Priority</th>
                  <th>Source</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {analysis.functionalRequirements.map((r) => (
                  <tr key={r.id}>
                    <td className="font-mono text-xs font-bold">{r.code}</td>
                    <td>
                      <p>{r.requirement}</p>
                      {r.description && <p className="mt-0.5 text-xs text-muted">{r.description}</p>}
                    </td>
                    <td>{r.priority}</td>
                    <td>{r.source || '—'}</td>
                    <td>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* 8 NFR */}
        <Section n={8} title="Non-Functional Requirements" empty={analysis.nonFunctionalRequirements.length === 0}>
          <div className="overflow-x-auto">
            <table className="table-base min-w-[520px]">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Requirement</th>
                  <th>Category</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {analysis.nonFunctionalRequirements.map((r) => (
                  <tr key={r.id}>
                    <td className="font-mono text-xs font-bold">{r.code}</td>
                    <td>
                      <p>{r.requirement}</p>
                      {r.description && <p className="mt-0.5 text-xs text-muted">{r.description}</p>}
                    </td>
                    <td>{r.category}</td>
                    <td>{r.priority}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* 9 Use cases */}
        <Section n={9} title="Use Cases" empty={analysis.useCases.length === 0}>
          <div className="space-y-3">
            {analysis.useCases.map((u) => (
              <div key={u.id} className="rounded-lg border border-slate-100 p-4 dark:border-white/[0.06]">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="indigo">{u.actor}</Badge>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{u.name}</p>
                </div>
                {u.description && <p className="mt-2 text-sm text-muted">{u.description}</p>}
                {u.mainFlow.trim() && (
                  <div className="mt-2 rounded-lg bg-slate-50 p-2.5 dark:bg-white/[0.03]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Main flow</p>
                    <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-muted">{u.mainFlow}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* 10 AS-IS */}
        <Section n={10} title="AS-IS Process" empty={!hasAsIs}>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <KV k="Current process" v={analysis.asIsToBe.currentProcess} />
            <KV k="Current problems" v={analysis.asIsToBe.currentProblems} />
            <KV k="Current tools" v={analysis.asIsToBe.currentTools} />
            <KV k="Bottlenecks" v={analysis.asIsToBe.bottlenecks} />
          </div>
        </Section>

        {/* 11 TO-BE */}
        <Section n={11} title="TO-BE Process" empty={!hasToBe}>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <KV k="Proposed process" v={analysis.asIsToBe.proposedProcess} />
            <KV k="New system" v={analysis.asIsToBe.newSystem} />
            <KV k="Improvements" v={analysis.asIsToBe.improvements} />
          </div>
        </Section>

        {/* 12 Solution */}
        <Section n={12} title="Proposed Solution" empty={!hasSolution}>
          {analysis.solution.name.trim() && (
            <p className="font-display text-lg font-bold text-slate-900 dark:text-white">{analysis.solution.name}</p>
          )}
          {analysis.solution.description.trim() && <P>{analysis.solution.description}</P>}
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            <KV k="Target users" v={analysis.solution.targetUsers} />
            <KV k="Technology suggestion" v={analysis.solution.technology} />
            <KV k="Risks" v={analysis.solution.risks} />
            <KV k="Limitations" v={analysis.solution.limitations} />
          </div>
          {analysis.features.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Proposed features</p>
              <ul className="mt-2 space-y-1.5">
                {analysis.features.map((f) => (
                  <li key={f.id} className="flex flex-wrap items-baseline gap-2 text-sm">
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{f.name}</span>
                    <span className="text-xs text-muted">
                      [{f.priority}
                      {f.userRole ? ` · ${f.userRole}` : ''}]
                    </span>
                    {f.description && <span className="text-muted">— {f.description}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Section>

        {/* 13 Risks */}
        <Section n={13} title="Risk Analysis" empty={analysis.risks.length === 0}>
          <div className="overflow-x-auto">
            <table className="table-base min-w-[560px]">
              <thead>
                <tr>
                  <th>Risk</th>
                  <th>P</th>
                  <th>I</th>
                  <th>Score</th>
                  <th>Level</th>
                  <th>Mitigation</th>
                </tr>
              </thead>
              <tbody>
                {[...analysis.risks]
                  .sort((a, b) => riskScore(b).score - riskScore(a).score)
                  .map((r) => {
                    const rs = riskScore(r)
                    return (
                      <tr key={r.id}>
                        <td className="font-medium">{r.risk}</td>
                        <td>{r.probability}</td>
                        <td>{r.impact}</td>
                        <td className="font-bold">{rs.score}</td>
                        <td>{rs.label}</td>
                        <td className="max-w-[220px]">{r.mitigation || '—'}</td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </Section>

        {/* 14 Benefits */}
        <Section
          n={14}
          title="Expected Benefits"
          empty={!analysis.solution.expectedBenefits.trim() && !analysis.asIsToBe.expectedBenefits.trim()}
        >
          <div className="grid gap-2.5">
            <KV k="Solution benefits" v={analysis.solution.expectedBenefits} />
            <KV k="Process benefits" v={analysis.asIsToBe.expectedBenefits} />
          </div>
        </Section>

        {/* 15 Conclusion */}
        <Section n={15} title="Conclusion">
          <P>
            {analysis.status === 'completed'
              ? `This analysis of ${cs.title} is complete. ${analysis.problems.length} problem${analysis.problems.length === 1 ? '' : 's'} were traced to root causes and translated into ${analysis.functionalRequirements.length + analysis.nonFunctionalRequirements.length} requirements, ${analysis.useCases.length} use case${analysis.useCases.length === 1 ? '' : 's'}, and a proposed solution${analysis.solution.name ? ` — ${analysis.solution.name}` : ''}. The next step is stakeholder review and phased implementation, starting with the highest-priority requirements.`
              : `This analysis of ${cs.title} is currently in progress. The findings documented so far provide a foundation for completing the investigation, validating requirements with stakeholders, and finalizing the solution proposal.`}
            {analysis.evaluation ? ` Evaluated completeness: ${analysis.evaluation.total}/100.` : ''}
          </P>
        </Section>

        <p className="no-print pb-4 text-center text-[11px] text-muted">
          Generated locally by System Analyst Simulator · <FileText className="inline h-3 w-3" /> use your browser's
          “Save as PDF” when printing to keep a shareable copy.
        </p>
      </motion.div>
    </div>
  )
}
