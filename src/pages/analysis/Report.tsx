import { useEffect, useMemo, useRef } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText, Printer } from 'lucide-react'
import { Badge, Button } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import type { AnalysisCtx } from '../AnalysisLayout'
import { riskScore } from '../../lib/scoring'
import { formatDate } from '../../lib/utils'
import { DIFF_KEYS, INDUSTRY_KEYS, MOSCOW_KEYS, NFRCAT_KEYS, REQSTATUS_KEYS, SEV_KEYS, FREQ_KEYS, TRI_KEYS, tr } from '../../i18n'
import { useI18n, useCaseText } from '../../i18n/useI18n'

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
  const { t } = useI18n()
  return (
    <section className="print-area card p-5 sm:p-6">
      <h2 className="flex items-baseline gap-2.5 font-display text-base font-bold text-slate-900 dark:text-white">
        <span className="text-gradient">{String(n).padStart(2, '0')}</span>
        {title}
      </h2>
      {empty ? (
        <p className="mt-3 text-sm italic text-slate-400 dark:text-slate-500">{t('rp.noData')}</p>
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
  const { analysis, cs: rawCs } = useOutletContext<AnalysisCtx>()
  const { markReportGenerated } = useApp()
  const { t, lang } = useI18n()
  const cs = useCaseText(rawCs)
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
    parts.push(tr(lang, 'rp.exec.intro', { case: cs.title, industry: tr(lang, INDUSTRY_KEYS[cs.industry]) }))
    if (a.stakeholders.length || a.interviews.length)
      parts.push(tr(lang, 'rp.exec.stakeholders', { sh: a.stakeholders.length, iv: a.interviews.length }))
    if (a.problems.length)
      parts.push(
        tr(lang, 'rp.exec.problems', {
          pb: a.problems.length,
          crit: critical ? tr(lang, 'rp.exec.problemsCrit', { crit: critical }) : '',
        }),
      )
    if (a.functionalRequirements.length || a.nonFunctionalRequirements.length)
      parts.push(tr(lang, 'rp.exec.req', { fr: a.functionalRequirements.length, nfr: a.nonFunctionalRequirements.length }))
    if (a.solution.name.trim())
      parts.push(tr(lang, 'rp.exec.solution', { name: a.solution.name, feat: a.features.length, risk: a.risks.length }))
    if (a.evaluation) parts.push(tr(lang, 'rp.exec.score', { total: a.evaluation.total }))
    return parts.join(' ')
  }, [analysis, cs, lang])

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
            {t('rp.back')}
          </Button>
        </Link>
        <Button icon={Printer} onClick={() => window.print()}>
          {t('rp.print')}
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
                {t('rp.kicker')}
              </p>
              <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                {cs.title}
              </h1>
              <p className="mt-1 text-sm text-muted">
                {t(INDUSTRY_KEYS[cs.industry])} · {t(DIFF_KEYS[cs.difficulty])}
              </p>
            </div>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-cyan-400/10 text-indigo-500 dark:text-indigo-300">
              <cs.icon className="h-6 w-6" />
            </span>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 text-xs text-muted dark:border-white/[0.06]">
            <Badge tone="slate">{t('rp.preparedBy', { analyst: t('profile.analyst') })}</Badge>
            <Badge tone="slate">{formatDate(analysis.updatedAt, lang)}</Badge>
            <Badge tone={analysis.status === 'completed' ? 'emerald' : 'cyan'}>
              {t(analysis.status === 'completed' ? 'status.completed' : 'rp.inProgress')}
            </Badge>
            {analysis.evaluation && <Badge tone="indigo">{t('rp.score', { score: analysis.evaluation.total })}</Badge>}
          </div>
        </div>

        {/* 1 Executive summary */}
        <Section n={1} title={t('rp.s1')}>
          <P>{execSummary}</P>
        </Section>

        {/* 2 Organization */}
        <Section n={2} title={t('rp.s2')}>
          <P>{cs.organization}</P>
        </Section>

        {/* 3 Current situation */}
        <Section n={3} title={t('rp.s3')}>
          <P>{cs.currentSituation}</P>
          {analysis.asIsToBe.currentTools.trim() && (
            <div className="mt-3">
              <KV k={t('rp.currentTools')} v={analysis.asIsToBe.currentTools} />
            </div>
          )}
          <div className="mt-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('rp.existingProcess')}</p>
            <ol className="mt-1.5 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {cs.existingProcess.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
          </div>
        </Section>

        {/* 4 Stakeholders */}
        <Section n={4} title={t('rp.s4')} empty={analysis.stakeholders.length === 0}>
          <div className="overflow-x-auto">
            <table className="table-base min-w-[520px]">
              <thead>
                <tr>
                  <th>{t('rp.th.name')}</th>
                  <th>{t('rp.th.role')}</th>
                  <th>{t('rp.th.department')}</th>
                  <th>{t('rp.th.influence')}</th>
                  <th>{t('rp.th.interest')}</th>
                  <th>{t('rp.th.concern')}</th>
                </tr>
              </thead>
              <tbody>
                {analysis.stakeholders.map((s) => (
                  <tr key={s.id}>
                    <td className="font-semibold">{s.name}</td>
                    <td>{s.role}</td>
                    <td>{s.department || '—'}</td>
                    <td>{t(TRI_KEYS[s.influence])}</td>
                    <td>{t(TRI_KEYS[s.interest])}</td>
                    <td className="max-w-[200px]">{s.concern || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {analysis.interviews.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t('rp.interviewHighlights', { count: analysis.interviews.length })}
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
        <Section n={5} title={t('rp.s5')} empty={analysis.problems.length === 0}>
          <div className="overflow-x-auto">
            <table className="table-base min-w-[560px]">
              <thead>
                <tr>
                  <th>{t('rp.th.problem')}</th>
                  <th>{t('rp.th.severity')}</th>
                  <th>{t('rp.th.frequency')}</th>
                  <th>{t('rp.th.impact')}</th>
                </tr>
              </thead>
              <tbody>
                {analysis.problems.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <p className="font-semibold">{p.title}</p>
                      {p.description && <p className="mt-0.5 text-xs text-muted">{p.description}</p>}
                    </td>
                    <td>{t(SEV_KEYS[p.severity])}</td>
                    <td>{t(FREQ_KEYS[p.frequency])}</td>
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
          title={t('rp.s6')}
          empty={analysis.rootCauses.length === 0 && !analysis.problems.some((p) => p.rootCause.trim())}
        >
          <div className="space-y-3">
            {analysis.problems
              .filter((p) => p.rootCause.trim())
              .map((p) => (
                <div key={p.id} className="rounded-lg bg-slate-50 p-3 dark:bg-white/[0.03]">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{p.title}</p>
                  <p className="mt-1 text-sm text-muted">
                    <span className="font-semibold text-indigo-500 dark:text-indigo-300">{t('rp.rootCause')} </span>
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
                    <span className="font-bold text-emerald-600 dark:text-emerald-300">{t('rp.conclusion')} </span>
                    {rc.conclusion}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* 7 FR */}
        <Section n={7} title={t('rp.s7')} empty={analysis.functionalRequirements.length === 0}>
          <div className="overflow-x-auto">
            <table className="table-base min-w-[560px]">
              <thead>
                <tr>
                  <th>{t('rp.th.id')}</th>
                  <th>{t('rp.th.requirement')}</th>
                  <th>{t('rp.th.priority')}</th>
                  <th>{t('rp.th.source')}</th>
                  <th>{t('rp.th.status')}</th>
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
                    <td>{t(MOSCOW_KEYS[r.priority])}</td>
                    <td>{r.source || '—'}</td>
                    <td>{t(REQSTATUS_KEYS[r.status])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* 8 NFR */}
        <Section n={8} title={t('rp.s8')} empty={analysis.nonFunctionalRequirements.length === 0}>
          <div className="overflow-x-auto">
            <table className="table-base min-w-[520px]">
              <thead>
                <tr>
                  <th>{t('rp.th.id')}</th>
                  <th>{t('rp.th.requirement')}</th>
                  <th>{t('rp.th.category')}</th>
                  <th>{t('rp.th.priority')}</th>
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
                    <td>{t(NFRCAT_KEYS[r.category])}</td>
                    <td>{t(MOSCOW_KEYS[r.priority])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* 9 Use cases */}
        <Section n={9} title={t('rp.s9')} empty={analysis.useCases.length === 0}>
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
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('rp.mainFlow')}</p>
                    <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-muted">{u.mainFlow}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* 10 AS-IS */}
        <Section n={10} title={t('rp.s10')} empty={!hasAsIs}>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <KV k={t('at.currentProcess')} v={analysis.asIsToBe.currentProcess} />
            <KV k={t('at.currentProblems')} v={analysis.asIsToBe.currentProblems} />
            <KV k={t('rp.currentTools')} v={analysis.asIsToBe.currentTools} />
            <KV k={t('at.bottlenecks')} v={analysis.asIsToBe.bottlenecks} />
          </div>
        </Section>

        {/* 11 TO-BE */}
        <Section n={11} title={t('rp.s11')} empty={!hasToBe}>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <KV k={t('at.proposedProcess')} v={analysis.asIsToBe.proposedProcess} />
            <KV k={t('at.newSystem')} v={analysis.asIsToBe.newSystem} />
            <KV k={t('at.improvements')} v={analysis.asIsToBe.improvements} />
          </div>
        </Section>

        {/* 12 Solution */}
        <Section n={12} title={t('rp.s12')} empty={!hasSolution}>
          {analysis.solution.name.trim() && (
            <p className="font-display text-lg font-bold text-slate-900 dark:text-white">{analysis.solution.name}</p>
          )}
          {analysis.solution.description.trim() && <P>{analysis.solution.description}</P>}
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            <KV k={t('so.targetUsers')} v={analysis.solution.targetUsers} />
            <KV k={t('so.technology')} v={analysis.solution.technology} />
            <KV k={t('so.risks')} v={analysis.solution.risks} />
            <KV k={t('so.limitations')} v={analysis.solution.limitations} />
          </div>
          {analysis.features.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('rp.proposedFeatures')}</p>
              <ul className="mt-2 space-y-1.5">
                {analysis.features.map((f) => (
                  <li key={f.id} className="flex flex-wrap items-baseline gap-2 text-sm">
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{f.name}</span>
                    <span className="text-xs text-muted">
                      [{t(TRI_KEYS[f.priority])}
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
        <Section n={13} title={t('rp.s13')} empty={analysis.risks.length === 0}>
          <div className="overflow-x-auto">
            <table className="table-base min-w-[560px]">
              <thead>
                <tr>
                  <th>{t('rp.th.risk')}</th>
                  <th>{t('rp.th.p')}</th>
                  <th>{t('rp.th.i')}</th>
                  <th>{t('rp.th.score')}</th>
                  <th>{t('rp.th.level')}</th>
                  <th>{t('rp.th.mitigation')}</th>
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
                        <td>{t(TRI_KEYS[r.probability])}</td>
                        <td>{t(TRI_KEYS[r.impact])}</td>
                        <td className="font-bold">{rs.score}</td>
                        <td>{t(TRI_KEYS[rs.label])}</td>
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
          title={t('rp.s14')}
          empty={!analysis.solution.expectedBenefits.trim() && !analysis.asIsToBe.expectedBenefits.trim()}
        >
          <div className="grid gap-2.5">
            <KV k={t('rp.solutionBenefits')} v={analysis.solution.expectedBenefits} />
            <KV k={t('rp.processBenefits')} v={analysis.asIsToBe.expectedBenefits} />
          </div>
        </Section>

        {/* 15 Conclusion */}
        <Section n={15} title={t('rp.s15')}>
          <P>
            {analysis.status === 'completed'
              ? t('rp.conclDone', {
                  case: cs.title,
                  pb: analysis.problems.length,
                  req: analysis.functionalRequirements.length + analysis.nonFunctionalRequirements.length,
                  uc: analysis.useCases.length,
                  sol: analysis.solution.name ? ` — ${analysis.solution.name}` : '',
                })
              : t('rp.conclWip', { case: cs.title })}
            {analysis.evaluation ? t('rp.conclScore', { total: analysis.evaluation.total }) : ''}
          </P>
        </Section>

        <p className="no-print pb-4 text-center text-[11px] text-muted">
          <FileText className="inline h-3 w-3" /> {t('rp.footerNote')}
        </p>
      </motion.div>
    </div>
  )
}
