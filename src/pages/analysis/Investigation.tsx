import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Briefcase,
  Building2,
  Check,
  MessageSquarePlus,
  MessagesSquare,
  Pencil,
  Plus,
  Quote,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react'
import { Badge, Button, Card, EmptyState, Field, Input, SectionHeader, Segmented, Select, Textarea } from '../../components/ui'
import { Modal } from '../../components/Modal'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import type { AnalysisCtx } from '../AnalysisLayout'
import { XP } from '../../lib/scoring'
import { formatDateTime, initials, nowISO, uid } from '../../lib/utils'
import type { Level3, Stakeholder } from '../../types'

const LEVELS: Level3[] = ['Low', 'Medium', 'High']
const LEVEL_TONE: Record<Level3, 'slate' | 'amber' | 'indigo'> = { Low: 'slate', Medium: 'amber', High: 'indigo' }

type Tab = 'stakeholders' | 'interviews'

interface StakeholderForm {
  name: string
  role: string
  department: string
  interest: Level3
  influence: Level3
  concern: string
}

const EMPTY_FORM: StakeholderForm = {
  name: '',
  role: '',
  department: '',
  interest: 'Medium',
  influence: 'Medium',
  concern: '',
}

/* ------------------------------- Matrix ---------------------------------- */

function InfluenceMatrix({ stakeholders }: { stakeholders: Stakeholder[] }) {
  const order: Level3[] = ['High', 'Medium', 'Low']
  const QUADRANT: Record<string, { label: string; cls: string }> = {
    'High-High': { label: 'Manage closely', cls: 'bg-indigo-500/[0.08] dark:bg-indigo-400/[0.08]' },
    'High-Medium': { label: 'Keep satisfied', cls: 'bg-cyan-400/[0.06] dark:bg-cyan-400/[0.05]' },
    'High-Low': { label: 'Keep satisfied', cls: 'bg-cyan-400/[0.06] dark:bg-cyan-400/[0.05]' },
    'Medium-High': { label: 'Keep informed', cls: 'bg-emerald-400/[0.06] dark:bg-emerald-400/[0.05]' },
    'Low-Low': { label: 'Monitor', cls: 'bg-slate-400/[0.04] dark:bg-white/[0.02]' },
    'Low-Medium': { label: 'Monitor', cls: 'bg-slate-400/[0.04] dark:bg-white/[0.02]' },
  }

  return (
    <Card className="p-5">
      <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">Interest × Influence Matrix</h3>
      <p className="mt-0.5 text-xs text-muted">Position stakeholders to decide your engagement strategy.</p>
      <div className="mt-4 flex gap-2">
        <div className="flex w-20 shrink-0 flex-col justify-between py-1 text-right">
          {order.map((inf) => (
            <span key={inf} className="flex h-24 items-center justify-end text-[10px] font-bold uppercase tracking-wide text-muted">
              {inf}
            </span>
          ))}
          <span className="pb-1 text-[9px] font-bold uppercase tracking-wide text-muted">Influence</span>
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-3 gap-1.5">
            {order.map((inf) =>
              (['Low', 'Medium', 'High'] as Level3[]).map((interest) => {
                const cell = stakeholders.filter((s) => s.influence === inf && s.interest === interest)
                const q = QUADRANT[`${inf}-${interest}`]
                return (
                  <div
                    key={`${inf}-${interest}`}
                    className={`relative flex h-24 flex-wrap content-start gap-1 overflow-hidden rounded-lg border border-slate-200/80 p-1.5 dark:border-white/[0.06] ${q?.cls ?? ''}`}
                    title={`Influence: ${inf} · Interest: ${interest}`}
                  >
                    {q && (
                      <span className="pointer-events-none absolute bottom-1 right-1.5 text-[8px] font-bold uppercase tracking-wide text-slate-400/80 dark:text-slate-500">
                        {q.label}
                      </span>
                    )}
                    {cell.map((s) => (
                      <span
                        key={s.id}
                        title={`${s.name} — ${s.role}`}
                        className="flex h-6 min-w-6 items-center justify-center rounded-md bg-indigo-500 px-1 text-[9px] font-bold text-white shadow-sm"
                      >
                        {initials(s.name)}
                      </span>
                    ))}
                  </div>
                )
              }),
            )}
          </div>
          <div className="mt-1.5 grid grid-cols-3 gap-1.5 text-center">
            {(['Low', 'Medium', 'High'] as Level3[]).map((i) => (
              <span key={i} className="text-[10px] font-bold uppercase tracking-wide text-muted">
                {i}
              </span>
            ))}
          </div>
          <p className="mt-1 text-center text-[9px] font-bold uppercase tracking-wide text-muted">Interest</p>
        </div>
      </div>
    </Card>
  )
}

/* ------------------------------- Main page -------------------------------- */

export default function Investigation() {
  const { analysis, cs } = useOutletContext<AnalysisCtx>()
  const { updateAnalysis } = useApp()
  const toast = useToast()

  const [tab, setTab] = useState<Tab>('stakeholders')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Stakeholder | null>(null)
  const [form, setForm] = useState<StakeholderForm>(EMPTY_FORM)

  // Interview state
  const [selectedStakeholder, setSelectedStakeholder] = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [isCustom, setIsCustom] = useState(false)

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (s: Stakeholder) => {
    setEditing(s)
    setForm({ name: s.name, role: s.role, department: s.department, interest: s.interest, influence: s.influence, concern: s.concern })
    setModalOpen(true)
  }

  const saveStakeholder = () => {
    if (!form.name.trim() || !form.role.trim()) {
      toast.warning('Please complete the required fields', 'Name and role are required.')
      return
    }
    if (editing) {
      updateAnalysis(analysis.caseId, (d) => {
        d.stakeholders = d.stakeholders.map((s) => (s.id === editing.id ? { ...s, ...form } : s))
      })
      toast.success('Stakeholder updated', form.name)
    } else {
      updateAnalysis(
        analysis.caseId,
        (d) => {
          d.stakeholders.push({ id: uid(), ...form, createdAt: nowISO() })
        },
        { amount: XP.stakeholder, label: 'Stakeholder added' },
      )
      toast.success('Stakeholder added', form.name)
    }
    setModalOpen(false)
  }

  const removeStakeholder = (id: string) => {
    updateAnalysis(analysis.caseId, (d) => {
      d.stakeholders = d.stakeholders.filter((s) => s.id !== id)
    })
    toast.info('Stakeholder removed')
  }

  const saveInterview = () => {
    if (!selectedStakeholder || !question.trim() || !answer.trim()) {
      toast.warning('Please complete the required fields', 'Choose a stakeholder, a question, and write an answer.')
      return
    }
    updateAnalysis(
      analysis.caseId,
      (d) => {
        d.interviews.push({
          id: uid(),
          stakeholder: selectedStakeholder,
          question: question.trim(),
          answer: answer.trim(),
          custom: isCustom || !cs.interviewQuestions.includes(question.trim()),
          createdAt: nowISO(),
        })
      },
      { amount: XP.interview, label: 'Interview logged' },
    )
    toast.success('Interview saved', `${selectedStakeholder}`)
    setQuestion('')
    setAnswer('')
    setIsCustom(false)
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Investigation"
        subtitle="Understand who is affected and gather first-hand evidence before analyzing anything."
        action={
          <Segmented<Tab>
            ariaLabel="Investigation sections"
            value={tab}
            onChange={setTab}
            options={[
              {
                value: 'stakeholders',
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" /> Stakeholders ({analysis.stakeholders.length})
                  </span>
                ),
              },
              {
                value: 'interviews',
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <MessagesSquare className="h-3.5 w-3.5" /> Interviews ({analysis.interviews.length})
                  </span>
                ),
              },
            ]}
          />
        }
      />

      {tab === 'stakeholders' ? (
        <div className="grid gap-5 xl:grid-cols-5">
          <div className="space-y-3 xl:col-span-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-muted">
                {analysis.stakeholders.length === 0
                  ? 'No stakeholders identified yet'
                  : `${analysis.stakeholders.length} stakeholder${analysis.stakeholders.length > 1 ? 's' : ''} identified`}
              </p>
              <Button size="sm" icon={UserPlus} onClick={openAdd}>
                Add Stakeholder
              </Button>
            </div>
            {analysis.stakeholders.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No stakeholders yet."
                description="Identify the people who affect or are affected by this system — decision makers, daily users, and external partners."
                action={
                  <Button size="sm" icon={Plus} onClick={openAdd}>
                    Identify First Stakeholder
                  </Button>
                }
              />
            ) : (
              analysis.stakeholders.map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 font-display text-sm font-bold text-white">
                          {initials(s.name)}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{s.name}</p>
                          <p className="text-xs text-muted">
                            <Briefcase className="mr-1 inline h-3 w-3" />
                            {s.role}
                            {s.department && (
                              <>
                                <span className="mx-1.5">·</span>
                                <Building2 className="mr-1 inline h-3 w-3" />
                                {s.department}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button onClick={() => openEdit(s)} aria-label={`Edit ${s.name}`} title="Edit" className="icon-btn h-8 w-8">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => removeStakeholder(s.id)}
                          aria-label={`Delete ${s.name}`}
                          title="Delete"
                          className="icon-btn h-8 w-8 hover:!bg-rose-500/10 hover:!text-rose-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    {s.concern && (
                      <p className="mt-2.5 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600 dark:bg-white/[0.03] dark:text-slate-300">
                        <Quote className="mr-1.5 inline h-3 w-3 text-indigo-400" />
                        {s.concern}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge tone={LEVEL_TONE[s.influence]}>Influence: {s.influence}</Badge>
                      <Badge tone={LEVEL_TONE[s.interest]}>Interest: {s.interest}</Badge>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
          <div className="xl:col-span-2">
            <InfluenceMatrix stakeholders={analysis.stakeholders} />
            <Card className="mt-4 p-4">
              <p className="text-xs leading-relaxed text-muted">
                <span className="font-bold text-slate-700 dark:text-slate-200">Analyst tip —</span> people you may meet
                in this case: {cs.stakeholdersContext.map((s) => s.name).join(', ')}. Add the ones your analysis
                actually involves.
              </p>
            </Card>
          </div>
        </div>
      ) : (
        /* ------------------------------ Interviews ----------------------------- */
        <div className="grid gap-5 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <Card className="p-5">
              <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">Interview Simulation</h3>
              <p className="mt-0.5 text-xs text-muted">Select a stakeholder, ask a question, record the answer.</p>

              {analysis.stakeholders.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-slate-300/80 p-4 text-center text-xs text-muted dark:border-white/[0.09]">
                  Add at least one stakeholder first — you need someone to interview.
                  <div className="mt-3">
                    <Button size="sm" variant="secondary" icon={UserPlus} onClick={() => setTab('stakeholders')}>
                      Go to Stakeholders
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  <Field label="Interviewee">
                    <Select
                      aria-label="Choose stakeholder"
                      value={selectedStakeholder}
                      onChange={(e) => setSelectedStakeholder(e.target.value)}
                      options={[
                        { value: '', label: 'Choose a stakeholder…' },
                        ...analysis.stakeholders.map((s) => ({ value: s.name, label: `${s.name} — ${s.role}` })),
                      ]}
                    />
                  </Field>

                  <div>
                    <span className="label">Suggested questions</span>
                    <div className="flex flex-wrap gap-1.5">
                      {cs.interviewQuestions.map((q) => (
                        <button
                          key={q}
                          onClick={() => {
                            setQuestion(q)
                            setIsCustom(false)
                          }}
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-medium leading-4 transition ${
                            question === q
                              ? 'border-indigo-400/60 bg-indigo-500/10 text-indigo-600 dark:border-indigo-400/40 dark:bg-indigo-400/10 dark:text-indigo-300'
                              : 'border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-500 dark:border-white/10 dark:text-slate-400'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        setQuestion('')
                        setIsCustom(true)
                      }}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:text-indigo-400 dark:text-indigo-300"
                    >
                      <MessageSquarePlus className="h-3.5 w-3.5" /> Write a custom question
                    </button>
                  </div>

                  <Field label="Question">
                    <Textarea
                      value={question}
                      onChange={(e) => {
                        setQuestion(e.target.value)
                        setIsCustom(true)
                      }}
                      placeholder="What problems occur most frequently in the current process?"
                      aria-label="Interview question"
                      className="min-h-[64px]"
                    />
                  </Field>
                  <Field label="Answer">
                    <Textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Write the stakeholder's answer as you understand it — this becomes evidence for your analysis."
                      aria-label="Interview answer"
                      className="min-h-[110px]"
                    />
                  </Field>
                  <Button className="w-full" icon={Plus} onClick={saveInterview}>
                    Save Interview Record
                  </Button>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-3 xl:col-span-3">
            <p className="text-sm font-semibold text-muted">
              {analysis.interviews.length === 0
                ? 'No interview records yet'
                : `${analysis.interviews.length} interview record${analysis.interviews.length > 1 ? 's' : ''}`}
            </p>
            {analysis.interviews.length === 0 ? (
              <EmptyState
                icon={MessagesSquare}
                title="No interviews yet."
                description="Run interview simulations to collect evidence — strong analysis starts with listening."
              />
            ) : (
              [...analysis.interviews].reverse().map((iv) => (
                <motion.div key={iv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 text-[10px] font-bold text-white">
                          {initials(iv.stakeholder)}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{iv.stakeholder}</p>
                          <p className="text-[11px] text-muted">{formatDateTime(iv.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {iv.custom && <Badge tone="violet">Custom</Badge>}
                        <button
                          onClick={() =>
                            updateAnalysis(analysis.caseId, (d) => {
                              d.interviews = d.interviews.filter((x) => x.id !== iv.id)
                            })
                          }
                          aria-label="Delete interview record"
                          title="Delete"
                          className="icon-btn h-8 w-8 hover:!bg-rose-500/10 hover:!text-rose-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      <p className="rounded-lg bg-indigo-500/[0.07] px-3 py-2 text-xs font-medium leading-relaxed text-indigo-700 dark:bg-indigo-400/[0.08] dark:text-indigo-200">
                        Q · {iv.question}
                      </p>
                      <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600 dark:bg-white/[0.03] dark:text-slate-300">
                        A · {iv.answer}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Stakeholder modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Stakeholder' : 'Add Stakeholder'}
        subtitle="Who has a stake in this system?"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name *">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Store Manager"
              aria-label="Stakeholder name"
            />
          </Field>
          <Field label="Role *">
            <Input
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="e.g. Decision Maker"
              aria-label="Stakeholder role"
            />
          </Field>
          <Field label="Department">
            <Input
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              placeholder="e.g. Operations"
              aria-label="Department"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Influence">
              <Select
                value={form.influence}
                onChange={(e) => setForm({ ...form, influence: e.target.value as Level3 })}
                options={LEVELS}
                aria-label="Influence level"
              />
            </Field>
            <Field label="Interest">
              <Select
                value={form.interest}
                onChange={(e) => setForm({ ...form, interest: e.target.value as Level3 })}
                options={LEVELS}
                aria-label="Interest level"
              />
            </Field>
          </div>
          <Field label="Main Concern" className="sm:col-span-2">
            <Textarea
              value={form.concern}
              onChange={(e) => setForm({ ...form, concern: e.target.value })}
              placeholder="What does this stakeholder care about most?"
              aria-label="Main concern"
              className="min-h-[70px]"
            />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={saveStakeholder} icon={Check}>
            {editing ? 'Save Changes' : 'Add Stakeholder'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
