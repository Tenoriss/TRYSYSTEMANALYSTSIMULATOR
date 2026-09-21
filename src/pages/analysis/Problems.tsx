import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowDown,
  FileWarning,
  Flame,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  SectionHeader,
  Segmented,
  Select,
  Textarea,
} from '../../components/ui'
import type { BadgeTone } from '../../components/ui'
import { Modal } from '../../components/Modal'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import type { AnalysisCtx } from '../AnalysisLayout'
import { problemPriority, XP } from '../../lib/scoring'
import { nowISO, uid } from '../../lib/utils'
import { FREQ_KEYS, PRIORITY_LABEL_KEYS, SEV_KEYS } from '../../i18n'
import { useI18n } from '../../i18n/useI18n'
import type { Frequency, Problem, RootCause, Severity } from '../../types'

const SEVERITIES: Severity[] = ['Low', 'Medium', 'High', 'Critical']
const FREQUENCIES: Frequency[] = ['Rarely', 'Occasionally', 'Frequently', 'Constantly']
const SEV_TONE: Record<Severity, BadgeTone> = { Low: 'slate', Medium: 'amber', High: 'orange', Critical: 'rose' }
const PRIORITY_TONE: Record<string, BadgeTone> = { Low: 'slate', Medium: 'amber', High: 'orange', Critical: 'rose' }

interface ProblemForm {
  title: string
  description: string
  rootCause: string
  impact: string
  severity: Severity
  frequency: Frequency
  evidence: string
}

const EMPTY_FORM: ProblemForm = {
  title: '',
  description: '',
  rootCause: '',
  impact: '',
  severity: 'Medium',
  frequency: 'Occasionally',
  evidence: '',
}

type Tab = 'problems' | 'whys'

export default function Problems() {
  const { analysis } = useOutletContext<AnalysisCtx>()
  const { updateAnalysis } = useApp()
  const { t } = useI18n()
  const toast = useToast()

  const [tab, setTab] = useState<Tab>('problems')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Problem | null>(null)
  const [form, setForm] = useState<ProblemForm>(EMPTY_FORM)
  const [editingWhys, setEditingWhys] = useState<RootCause | null>(null)

  const sorted = useMemo(
    () => [...analysis.problems].sort((a, b) => problemPriority(b).score - problemPriority(a).score),
    [analysis.problems],
  )

  const sevCount = useMemo(() => {
    const m: Record<Severity, number> = { Low: 0, Medium: 0, High: 0, Critical: 0 }
    analysis.problems.forEach((p) => m[p.severity]++)
    return m
  }, [analysis.problems])
  const sevTotal = Math.max(1, analysis.problems.length)

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }
  const openEdit = (p: Problem) => {
    setEditing(p)
    setForm({
      title: p.title,
      description: p.description,
      rootCause: p.rootCause,
      impact: p.impact,
      severity: p.severity,
      frequency: p.frequency,
      evidence: p.evidence,
    })
    setModalOpen(true)
  }

  const saveProblem = () => {
    if (!form.title.trim()) {
      toast.warning(t('common.requiredFields'), t('pr.titleRequired'))
      return
    }
    if (editing) {
      updateAnalysis(analysis.caseId, (d) => {
        d.problems = d.problems.map((p) => (p.id === editing.id ? { ...p, ...form } : p))
      })
      toast.success(t('pr.updated'), form.title)
    } else {
      updateAnalysis(
        analysis.caseId,
        (d) => {
          d.problems.push({ id: uid(), ...form, createdAt: nowISO() })
        },
        { amount: XP.problem, label: t('xp.problem') },
      )
      toast.success(t('pr.added'), form.title)
    }
    setModalOpen(false)
  }

  const saveWhys = (rc: RootCause) => {
    if (!rc.problem.trim() || rc.whys.every((w) => !w.trim())) {
      toast.warning(t('common.requiredFields'), t('wh.needProblem'))
      return
    }
    const isNew = !analysis.rootCauses.some((r) => r.id === rc.id)
    updateAnalysis(
      analysis.caseId,
      (d) => {
        if (isNew) d.rootCauses.push(rc)
        else d.rootCauses = d.rootCauses.map((r) => (r.id === rc.id ? rc : r))
      },
      isNew ? { amount: XP.rootCause, label: t('xp.rootCause') } : undefined,
    )
    toast.success(isNew ? t('wh.saved') : t('wh.updated'), rc.problem)
    setEditingWhys(null)
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title={t('pr.title')}
        subtitle={t('pr.subtitle')}
        action={
          <Segmented<Tab>
            ariaLabel={t('pr.sectionsAria')}
            value={tab}
            onChange={setTab}
            options={[
              {
                value: 'problems',
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" /> {t('pr.tabProblems', { count: analysis.problems.length })}
                  </span>
                ),
              },
              {
                value: 'whys',
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <Search className="h-3.5 w-3.5" /> {t('pr.tabWhys', { count: analysis.rootCauses.length })}
                  </span>
                ),
              },
            ]}
          />
        }
      />

      {tab === 'problems' ? (
        <>
          {analysis.problems.length > 0 && (
            <Card className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted">{t('pr.distribution')}</p>
                <p className="text-xs text-muted">
                  {t('pr.count', { count: analysis.problems.length, s: analysis.problems.length > 1 ? 's' : '' })}
                </p>
              </div>
              <div className="mt-2.5 flex h-3 gap-0.5 overflow-hidden rounded-full">
                {SEVERITIES.map((s) =>
                  sevCount[s] > 0 ? (
                    <motion.div
                      key={s}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      style={{ width: `${(sevCount[s] / sevTotal) * 100}%` }}
                      className={`origin-left ${
                        s === 'Critical'
                          ? 'bg-rose-500'
                          : s === 'High'
                            ? 'bg-orange-400'
                            : s === 'Medium'
                              ? 'bg-amber-400'
                              : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                      title={`${t(SEV_KEYS[s])}: ${sevCount[s]}`}
                    />
                  ) : null,
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-3">
                {SEVERITIES.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        s === 'Critical'
                          ? 'bg-rose-500'
                          : s === 'High'
                            ? 'bg-orange-400'
                            : s === 'Medium'
                              ? 'bg-amber-400'
                              : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    />
                    {t(SEV_KEYS[s])} ({sevCount[s]})
                  </span>
                ))}
              </div>
            </Card>
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-muted">{t('pr.sortedBy')}</p>
            <Button size="sm" icon={Plus} onClick={openAdd}>
              {t('pr.add')}
            </Button>
          </div>

          {sorted.length === 0 ? (
            <EmptyState
              icon={FileWarning}
              title={t('pr.emptyTitle')}
              description={t('pr.emptyDesc')}
              action={
                <Button size="sm" icon={Plus} onClick={openAdd}>
                  {t('pr.addFirst')}
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {sorted.map((p, i) => {
                const pr = problemPriority(p)
                return (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <Card className="flex h-full flex-col p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                              p.severity === 'Critical'
                                ? 'bg-rose-500/10 text-rose-500'
                                : p.severity === 'High'
                                  ? 'bg-orange-400/10 text-orange-500'
                                  : p.severity === 'Medium'
                                    ? 'bg-amber-400/10 text-amber-500'
                                    : 'bg-slate-400/10 text-slate-400'
                            }`}
                          >
                            <Flame className="h-4 w-4" />
                          </span>
                          <div>
                            <h3 className="font-semibold leading-snug text-slate-900 dark:text-white">{p.title}</h3>
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              <Badge tone={SEV_TONE[p.severity]}>{t(SEV_KEYS[p.severity])}</Badge>
                              <Badge tone="slate">{t(FREQ_KEYS[p.frequency])}</Badge>
                              <Badge tone={PRIORITY_TONE[pr.label]}>
                                {t('pr.priority', { label: t(PRIORITY_LABEL_KEYS[pr.label]) })}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button onClick={() => openEdit(p)} aria-label={`${t('common.edit')} ${p.title}`} title={t('common.edit')} className="icon-btn h-8 w-8">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              updateAnalysis(analysis.caseId, (d) => {
                                d.problems = d.problems.filter((x) => x.id !== p.id)
                              })
                              toast.info(t('pr.removed'))
                            }}
                            aria-label={`${t('common.delete')} ${p.title}`}
                            title={t('common.delete')}
                            className="icon-btn h-8 w-8 hover:!bg-rose-500/10 hover:!text-rose-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      {p.description && <p className="mt-3 text-sm leading-relaxed text-muted">{p.description}</p>}
                      <div className="mt-3 grid flex-1 gap-2 text-xs sm:grid-cols-2">
                        {p.rootCause ? (
                          <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-white/[0.03]">
                            <p className="font-bold uppercase tracking-wide text-[10px] text-indigo-500 dark:text-indigo-300">{t('pr.rootCause')}</p>
                            <p className="mt-1 leading-relaxed text-slate-600 dark:text-slate-300">{p.rootCause}</p>
                          </div>
                        ) : (
                          <button
                            onClick={() => openEdit(p)}
                            className="rounded-lg border border-dashed border-slate-300/80 p-2.5 text-left text-muted transition hover:border-indigo-300 hover:text-indigo-500 dark:border-white/10"
                          >
                            {t('pr.addRootCause')}
                          </button>
                        )}
                        {p.impact && (
                          <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-white/[0.03]">
                            <p className="font-bold uppercase tracking-wide text-[10px] text-orange-500">{t('pr.impact')}</p>
                            <p className="mt-1 leading-relaxed text-slate-600 dark:text-slate-300">{p.impact}</p>
                          </div>
                        )}
                        {p.evidence && (
                          <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-white/[0.03] sm:col-span-2">
                            <p className="font-bold uppercase tracking-wide text-[10px] text-emerald-500">{t('pr.evidence')}</p>
                            <p className="mt-1 leading-relaxed text-slate-600 dark:text-slate-300">{p.evidence}</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </>
      ) : (
        <FiveWhys
          analysis={analysis}
          editing={editingWhys}
          setEditing={setEditingWhys}
          onSave={saveWhys}
          onDelete={(id) => {
            updateAnalysis(analysis.caseId, (d) => {
              d.rootCauses = d.rootCauses.filter((r) => r.id !== id)
            })
            toast.info(t('wh.removed'))
          }}
        />
      )}

      {/* Problem modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? t('pr.editTitle') : t('pr.addTitle')} subtitle={t('pr.addSub')} wide>
        <div className="grid gap-4">
          <Field label={t('pr.problemTitle')}>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={t('pr.problemTitlePh')}
              aria-label={t('pr.problemTitleAria')}
            />
          </Field>
          <Field label={t('pr.description')}>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={t('pr.descriptionPh')}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('pr.severity')}>
              <Select
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value as Severity })}
                options={SEVERITIES.map((s) => ({ value: s, label: t(SEV_KEYS[s]) }))}
                aria-label={t('pr.severity')}
              />
            </Field>
            <Field label={t('pr.frequency')}>
              <Select
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value as Frequency })}
                options={FREQUENCIES.map((f) => ({ value: f, label: t(FREQ_KEYS[f]) }))}
                aria-label={t('pr.frequency')}
              />
            </Field>
          </div>
          <Field label={t('pr.rootCause')}>
            <Textarea value={form.rootCause} onChange={(e) => setForm({ ...form, rootCause: e.target.value })} placeholder={t('pr.rootCausePh')} className="min-h-[64px]" />
          </Field>
          <Field label={t('pr.impact')}>
            <Textarea value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })} placeholder={t('pr.impactPh')} className="min-h-[64px]" />
          </Field>
          <Field label={t('pr.evidence')}>
            <Textarea value={form.evidence} onChange={(e) => setForm({ ...form, evidence: e.target.value })} placeholder={t('pr.evidencePh')} className="min-h-[64px]" />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={saveProblem}>{editing ? t('form.saveChanges') : t('pr.add')}</Button>
        </div>
      </Modal>
    </div>
  )
}

/* ------------------------------- 5 Whys panel ------------------------------- */

function FiveWhys({
  analysis,
  editing,
  setEditing,
  onSave,
  onDelete,
}: {
  analysis: AnalysisCtx['analysis']
  editing: RootCause | null
  setEditing: (r: RootCause | null) => void
  onSave: (r: RootCause) => void
  onDelete: (id: string) => void
}) {
  const { t } = useI18n()
  const startNew = () =>
    setEditing({ id: uid(), problem: analysis.problems[0]?.title ?? '', whys: ['', '', '', '', ''], conclusion: '', createdAt: nowISO() })

  return (
    <div className="grid gap-5 xl:grid-cols-5">
      <div className="xl:col-span-2">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">{t('wh.title')}</h3>
            {!editing && (
              <Button size="sm" variant="secondary" icon={Plus} onClick={startNew}>
                {t('wh.new')}
              </Button>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted">{t('wh.desc')}</p>

          {editing ? (
            <div className="mt-4 space-y-3">
              <Field label={t('wh.problemStatement')}>
                <Input
                  value={editing.problem}
                  onChange={(e) => setEditing({ ...editing, problem: e.target.value })}
                  list="whys-problems"
                  aria-label={t('wh.problemStatement')}
                />
                <datalist id="whys-problems">
                  {analysis.problems.map((p) => (
                    <option key={p.id} value={p.title} />
                  ))}
                </datalist>
              </Field>
              {editing.whys.map((w, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex-1">
                    <span className="label">{t('wh.whyN', { n: i + 1 })}</span>
                    <div className="flex items-center gap-2">
                      <ArrowDown className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
                      <Input
                        value={w}
                        onChange={(e) => {
                          const whys = [...editing.whys]
                          whys[i] = e.target.value
                          setEditing({ ...editing, whys })
                        }}
                        placeholder={i === 0 ? t('wh.why1Ph') : t('wh.whyNextPh')}
                        aria-label={t('wh.whyNAria', { n: i + 1 })}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Field label={t('wh.conclusion')}>
                <Textarea
                  value={editing.conclusion}
                  onChange={(e) => setEditing({ ...editing, conclusion: e.target.value })}
                  placeholder={t('wh.conclusionPh')}
                  className="min-h-[64px]"
                />
              </Field>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => onSave(editing)}>
                  {t('wh.save')}
                </Button>
                <Button variant="secondary" onClick={() => setEditing(null)}>
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState
                className="py-8"
                icon={Search}
                title={t('wh.emptyTitle')}
                description={t('wh.emptyDesc')}
                action={
                  <Button size="sm" icon={Plus} onClick={startNew}>
                    {t('wh.start')}
                  </Button>
                }
              />
            </div>
          )}
        </Card>
      </div>

      <div className="space-y-3 xl:col-span-3">
        <p className="text-sm font-semibold text-muted">
          {analysis.rootCauses.length === 0
            ? t('wh.none')
            : t('wh.count', { count: analysis.rootCauses.length, s: analysis.rootCauses.length > 1 ? 's' : '' })}
        </p>
        {analysis.rootCauses.map((rc) => (
          <motion.div key={rc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-slate-900 dark:text-white">{rc.problem}</h3>
                <div className="flex shrink-0 gap-1">
                  <button onClick={() => setEditing(rc)} aria-label={t('common.edit')} title={t('common.edit')} className="icon-btn h-8 w-8">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => onDelete(rc.id)} aria-label={t('common.delete')} title={t('common.delete')} className="icon-btn h-8 w-8 hover:!bg-rose-500/10 hover:!text-rose-500">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="mt-3 space-y-0">
                {rc.whys.map((w, i) =>
                  w.trim() ? (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-[10px] font-bold text-indigo-500 dark:text-indigo-300">
                          {i + 1}
                        </span>
                        {i < rc.whys.filter((x) => x.trim()).length - 1 && <span className="h-full w-px bg-slate-200 dark:bg-white/10" />}
                      </div>
                      <p className="pb-4 pt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{w}</p>
                    </div>
                  ) : null,
                )}
              </div>
              {rc.conclusion.trim() && (
                <div className="mt-1 rounded-lg bg-emerald-500/[0.07] px-3 py-2 text-xs leading-relaxed text-emerald-700 dark:bg-emerald-400/[0.08] dark:text-emerald-200">
                  <span className="font-bold">{t('wh.rootCauseLabel')}</span> {rc.conclusion}
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
