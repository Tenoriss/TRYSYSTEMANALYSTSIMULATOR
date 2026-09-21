import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowDown,
  ArrowLeftRight,
  ArrowRight,
  Boxes,
  ChevronsDownUp,
  GitBranch,
  ListOrdered,
  MoveDown,
  MoveUp,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  User,
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
import { Modal } from '../../components/Modal'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import type { AnalysisCtx } from '../AnalysisLayout'
import { XP } from '../../lib/scoring'
import { cn, nowISO, uid } from '../../lib/utils'
import type { AsIsToBe, ProcessStep, ProcessStepType, UseCase } from '../../types'

type Tab = 'usecases' | 'flow' | 'asistobe'

/* ------------------------------ Use Case SVG ------------------------------ */

function UseCaseDiagram({ useCases }: { useCases: UseCase[] }) {
  const actors = useMemo(() => [...new Set(useCases.map((u) => u.actor.trim()).filter(Boolean))], [useCases])
  if (useCases.length === 0) return null

  const ROW = 92
  const rows = Math.max(actors.length, useCases.length)
  const H = rows * ROW + 60
  const actorY = (i: number) => i * ROW + 70
  const ucY = (i: number) => i * ROW + 70
  const boundaryTop = 24
  const boundaryH = useCases.length * ROW + 8

  return (
    <Card className="overflow-x-auto p-5">
      <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">Use Case Diagram</h3>
      <p className="mt-0.5 text-xs text-muted">Generated automatically from your use cases.</p>
      <svg viewBox={`0 0 780 ${H}`} className="mt-4 min-w-[640px]" role="img" aria-label="Use case diagram">
        {/* System boundary */}
        <rect x={280} y={boundaryTop} width={470} height={boundaryH} rx={16} className="fill-slate-50 stroke-slate-200 dark:fill-white/[0.02] dark:stroke-white/10" />
        <text x={515} y={boundaryTop + 26} textAnchor="middle" className="fill-slate-400 text-[11px] font-bold dark:fill-slate-500" style={{ fontSize: 11 }}>
          PROPOSED SYSTEM
        </text>

        {/* Links */}
        {useCases.map((u, i) => {
          const ai = actors.indexOf(u.actor.trim())
          if (ai < 0) return null
          return (
            <line
              key={`link-${u.id}`}
              x1={168}
              y1={actorY(ai)}
              x2={330}
              y2={ucY(i)}
              className="stroke-slate-300 dark:stroke-white/15"
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
          )
        })}

        {/* Actors */}
        {actors.map((a, i) => {
          const y = actorY(i)
          return (
            <g key={a} transform={`translate(120, ${y})`}>
              <circle cx={0} cy={-18} r={10} className="fill-none stroke-indigo-500 dark:stroke-indigo-300" strokeWidth={2} />
              <line x1={0} y1={-8} x2={0} y2={16} className="stroke-indigo-500 dark:stroke-indigo-300" strokeWidth={2} />
              <line x1={-14} y1={0} x2={14} y2={0} className="stroke-indigo-500 dark:stroke-indigo-300" strokeWidth={2} />
              <line x1={0} y1={16} x2={-12} y2={34} className="stroke-indigo-500 dark:stroke-indigo-300" strokeWidth={2} />
              <line x1={0} y1={16} x2={12} y2={34} className="stroke-indigo-500 dark:stroke-indigo-300" strokeWidth={2} />
              <text y={52} textAnchor="middle" className="fill-slate-600 text-[11px] font-semibold dark:fill-slate-300" style={{ fontSize: 11 }}>
                {a.length > 16 ? `${a.slice(0, 15)}…` : a}
              </text>
            </g>
          )
        })}

        {/* Use cases */}
        {useCases.map((u, i) => {
          const y = ucY(i)
          const label = u.name.length > 34 ? `${u.name.slice(0, 33)}…` : u.name
          return (
            <g key={u.id} transform={`translate(515, ${y})`}>
              <ellipse rx={160} ry={30} className="fill-indigo-500/10 stroke-indigo-400/60 dark:fill-indigo-400/10" strokeWidth={1.5} />
              <text textAnchor="middle" dominantBaseline="middle" className="fill-slate-700 text-[12px] font-semibold dark:fill-slate-200" style={{ fontSize: 12 }}>
                {label}
              </text>
            </g>
          )
        })}
      </svg>
    </Card>
  )
}

/* --------------------------------- Page ----------------------------------- */

interface UCForm {
  actor: string
  name: string
  description: string
  preconditions: string
  mainFlow: string
  alternativeFlow: string
  postconditions: string
}

const EMPTY_UC: UCForm = {
  actor: '',
  name: '',
  description: '',
  preconditions: '',
  mainFlow: '',
  alternativeFlow: '',
  postconditions: '',
}

export default function Modeling() {
  const { analysis } = useOutletContext<AnalysisCtx>()
  const { updateAnalysis } = useApp()
  const toast = useToast()
  const [tab, setTab] = useState<Tab>('usecases')

  /* Use case state */
  const [ucModal, setUCModal] = useState(false)
  const [editingUC, setEditingUC] = useState<UseCase | null>(null)
  const [ucForm, setUCForm] = useState<UCForm>(EMPTY_UC)

  /* Process flow state */
  const [flowModal, setFlowModal] = useState(false)
  const [editingStep, setEditingStep] = useState<ProcessStep | null>(null)
  const [stepType, setStepType] = useState<ProcessStepType>('process')
  const [stepLabel, setStepLabel] = useState('')
  const [stepNote, setStepNote] = useState('')

  const saveUC = () => {
    if (!ucForm.actor.trim() || !ucForm.name.trim()) {
      toast.warning('Please complete the required fields', 'Actor and use case name are required.')
      return
    }
    if (editingUC) {
      updateAnalysis(analysis.caseId, (d) => {
        d.useCases = d.useCases.map((u) => (u.id === editingUC.id ? { ...u, ...ucForm } : u))
      })
      toast.success('Use case updated', ucForm.name)
    } else {
      updateAnalysis(
        analysis.caseId,
        (d) => {
          d.useCases.push({ id: uid(), ...ucForm, createdAt: nowISO() })
        },
        { amount: XP.useCase, label: 'Use case created' },
      )
      toast.success('Use case created', ucForm.name)
    }
    setUCModal(false)
  }

  const saveStep = () => {
    if (!stepLabel.trim()) {
      toast.warning('Please complete the required fields', 'Step label is required.')
      return
    }
    if (editingStep) {
      updateAnalysis(analysis.caseId, (d) => {
        d.processSteps = d.processSteps.map((s) =>
          s.id === editingStep.id ? { ...s, type: stepType, label: stepLabel, note: stepNote } : s,
        )
      })
      toast.success('Step updated')
    } else {
      updateAnalysis(
        analysis.caseId,
        (d) => {
          d.processSteps.push({ id: uid(), type: stepType, label: stepLabel, note: stepNote })
        },
        { amount: XP.processStep, label: 'Process step added' },
      )
    }
    setFlowModal(false)
    setStepLabel('')
    setStepNote('')
    setStepType('process')
    setEditingStep(null)
  }

  const moveStep = (id: string, dir: -1 | 1) => {
    updateAnalysis(analysis.caseId, (d) => {
      const idx = d.processSteps.findIndex((s) => s.id === id)
      const to = idx + dir
      if (idx < 0 || to < 0 || to >= d.processSteps.length) return
      const arr = [...d.processSteps]
      const [item] = arr.splice(idx, 1)
      arr.splice(to, 0, item)
      d.processSteps = arr
    })
  }

  const saveAsIsToBe = (patch: Partial<AsIsToBe>) => {
    updateAnalysis(analysis.caseId, (d) => {
      d.asIsToBe = { ...d.asIsToBe, ...patch }
    })
    toast.success('Analysis saved')
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title="System Modeling"
        subtitle="Model how actors will interact with the solution and how work flows through it."
        action={
          <Segmented<Tab>
            ariaLabel="Modeling sections"
            value={tab}
            onChange={setTab}
            options={[
              {
                value: 'usecases',
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> Use Cases ({analysis.useCases.length})
                  </span>
                ),
              },
              {
                value: 'flow',
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <GitBranch className="h-3.5 w-3.5" /> Process Flow ({analysis.processSteps.length})
                  </span>
                ),
              },
              {
                value: 'asistobe',
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <ArrowLeftRight className="h-3.5 w-3.5" /> AS-IS vs TO-BE
                  </span>
                ),
              },
            ]}
          />
        }
      />

      {/* ----------------------------- USE CASES ----------------------------- */}
      {tab === 'usecases' && (
        <div className="space-y-5">
          <UseCaseDiagram useCases={analysis.useCases} />
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-muted">
              {analysis.useCases.length === 0 ? 'No use cases defined yet' : `${analysis.useCases.length} use case${analysis.useCases.length > 1 ? 's' : ''}`}
            </p>
            <Button
              size="sm"
              icon={Plus}
              onClick={() => {
                setEditingUC(null)
                setUCForm(EMPTY_UC)
                setUCModal(true)
              }}
            >
              Add Use Case
            </Button>
          </div>
          {analysis.useCases.length === 0 ? (
            <EmptyState
              icon={User}
              title="No use cases yet."
              description="Describe how each actor will use the proposed system — name, flow, and outcomes."
              action={
                <Button
                  size="sm"
                  icon={Plus}
                  onClick={() => {
                    setEditingUC(null)
                    setUCForm(EMPTY_UC)
                    setUCModal(true)
                  }}
                >
                  Create First Use Case
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {analysis.useCases.map((u) => (
                <Card key={u.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-indigo-400/50 bg-indigo-500/10 text-indigo-500 dark:text-indigo-300">
                        <User className="h-4 w-4" />
                      </span>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{u.name}</h3>
                        <p className="text-xs text-muted">Actor: {u.actor}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        onClick={() => {
                          setEditingUC(u)
                          setUCForm({
                            actor: u.actor,
                            name: u.name,
                            description: u.description,
                            preconditions: u.preconditions,
                            mainFlow: u.mainFlow,
                            alternativeFlow: u.alternativeFlow,
                            postconditions: u.postconditions,
                          })
                          setUCModal(true)
                        }}
                        aria-label={`Edit use case ${u.name}`}
                        title="Edit"
                        className="icon-btn h-8 w-8"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          updateAnalysis(analysis.caseId, (d) => {
                            d.useCases = d.useCases.filter((x) => x.id !== u.id)
                          })
                          toast.info('Use case removed')
                        }}
                        aria-label={`Delete use case ${u.name}`}
                        title="Delete"
                        className="icon-btn h-8 w-8 hover:!bg-rose-500/10 hover:!text-rose-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {u.description && <p className="mt-3 text-sm leading-relaxed text-muted">{u.description}</p>}
                  <dl className="mt-3 space-y-2 text-xs">
                    {u.preconditions && (
                      <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-white/[0.03]">
                        <dt className="font-bold uppercase tracking-wide text-[10px] text-slate-400">Preconditions</dt>
                        <dd className="mt-1 whitespace-pre-line leading-relaxed text-slate-600 dark:text-slate-300">{u.preconditions}</dd>
                      </div>
                    )}
                    {u.mainFlow && (
                      <div className="rounded-lg bg-indigo-500/[0.06] p-2.5 dark:bg-indigo-400/[0.07]">
                        <dt className="font-bold uppercase tracking-wide text-[10px] text-indigo-500 dark:text-indigo-300">Main flow</dt>
                        <dd className="mt-1 whitespace-pre-line leading-relaxed text-slate-600 dark:text-slate-300">{u.mainFlow}</dd>
                      </div>
                    )}
                    {u.alternativeFlow && (
                      <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-white/[0.03]">
                        <dt className="font-bold uppercase tracking-wide text-[10px] text-amber-500">Alternative flow</dt>
                        <dd className="mt-1 whitespace-pre-line leading-relaxed text-slate-600 dark:text-slate-300">{u.alternativeFlow}</dd>
                      </div>
                    )}
                    {u.postconditions && (
                      <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-white/[0.03]">
                        <dt className="font-bold uppercase tracking-wide text-[10px] text-emerald-500">Postconditions</dt>
                        <dd className="mt-1 whitespace-pre-line leading-relaxed text-slate-600 dark:text-slate-300">{u.postconditions}</dd>
                      </div>
                    )}
                  </dl>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------- PROCESS FLOW ---------------------------- */}
      {tab === 'flow' && (
        <div className="grid gap-5 xl:grid-cols-5">
          <div className="space-y-3 xl:col-span-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-muted">Flow steps</p>
              <Button
                size="sm"
                icon={Plus}
                onClick={() => {
                  setEditingStep(null)
                  setStepType('process')
                  setStepLabel('')
                  setStepNote('')
                  setFlowModal(true)
                }}
              >
                Add Step
              </Button>
            </div>
            {analysis.processSteps.length === 0 ? (
              <EmptyState
                icon={GitBranch}
                title="No process steps yet."
                description="Map the target process step by step: start, activities, decisions, and end states."
                action={
                  <Button
                    size="sm"
                    icon={Plus}
                    onClick={() => {
                      setEditingStep(null)
                      setStepType('process')
                      setFlowModal(true)
                    }}
                  >
                    Add First Step
                  </Button>
                }
              />
            ) : (
              analysis.processSteps.map((s, i) => (
                <Card key={s.id} className="flex items-center gap-3 p-3">
                  <Badge
                    tone={
                      s.type === 'start' ? 'emerald' : s.type === 'end' ? 'rose' : s.type === 'decision' ? 'amber' : 'indigo'
                    }
                    className="w-[74px] justify-center"
                  >
                    {s.type}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{s.label}</p>
                    {s.note && <p className="truncate text-[11px] text-muted">{s.note}</p>}
                  </div>
                  <div className="flex shrink-0 gap-0.5">
                    <button onClick={() => moveStep(s.id, -1)} disabled={i === 0} aria-label="Move step up" title="Move up" className="icon-btn h-7 w-7 disabled:opacity-30">
                      <MoveUp className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => moveStep(s.id, 1)} disabled={i === analysis.processSteps.length - 1} aria-label="Move step down" title="Move down" className="icon-btn h-7 w-7 disabled:opacity-30">
                      <MoveDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingStep(s)
                        setStepType(s.type)
                        setStepLabel(s.label)
                        setStepNote(s.note)
                        setFlowModal(true)
                      }}
                      aria-label="Edit step"
                      title="Edit"
                      className="icon-btn h-7 w-7"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        updateAnalysis(analysis.caseId, (d) => {
                          d.processSteps = d.processSteps.filter((x) => x.id !== s.id)
                        })
                        toast.info('Step removed')
                      }}
                      aria-label="Delete step"
                      title="Delete"
                      className="icon-btn h-7 w-7 hover:!bg-rose-500/10 hover:!text-rose-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Flow visualization */}
          <div className="xl:col-span-3">
            <Card className="p-6">
              <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">Process Visualization</h3>
              {analysis.processSteps.length === 0 ? (
                <p className="mt-3 text-sm text-muted">Add steps to see the flow rendered here.</p>
              ) : (
                <div className="mx-auto mt-5 flex max-w-sm flex-col items-center">
                  {analysis.processSteps.map((s, i) => (
                    <div key={s.id} className="flex w-full flex-col items-center">
                      {i > 0 && (
                        <div className="flex flex-col items-center py-0.5">
                          <span className="h-4 w-px bg-slate-300 dark:bg-white/15" />
                          <div className="flex items-center gap-1">
                            <ArrowDown className="h-3.5 w-3.5 text-slate-300 dark:text-slate-500" />
                            {s.note && (
                              <span className="rounded bg-amber-400/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-500">
                                {s.note}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className={cn(
                          'flex min-h-[44px] w-full max-w-[280px] items-center justify-center px-4 py-2 text-center text-xs font-semibold shadow-sm',
                          s.type === 'start' &&
                            'rounded-full bg-emerald-500 text-white shadow-emerald-500/30',
                          s.type === 'end' && 'rounded-full bg-rose-500 text-white shadow-rose-500/30',
                          s.type === 'process' &&
                            'rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-400/30 dark:bg-indigo-400/10 dark:text-indigo-200',
                          s.type === 'decision' &&
                            'w-[200px] rounded-xl border border-amber-300/70 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200',
                        )}
                      >
                        {s.type === 'start' || s.type === 'end' ? s.label.toUpperCase() : s.label}
                      </motion.div>
                    </div>
                  ))}
                </div>
              )}
              {analysis.processSteps.length > 0 && (
                <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted">
                  <RotateCcw className="h-3 w-3" /> Decision notes appear on the connecting arrows.
                </p>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* ---------------------------- AS-IS / TO-BE ---------------------------- */}
      {tab === 'asistobe' && (
        <div className="space-y-4">
          <Card className="flex items-center gap-3 border-indigo-200/70 bg-indigo-500/[0.05] p-4 dark:border-indigo-400/20 dark:bg-indigo-400/[0.06]">
            <ChevronsDownUp className="h-5 w-5 shrink-0 text-indigo-500 dark:text-indigo-300" />
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Contrast the current reality with your proposed future. A sharp AS-IS / TO-BE comparison is the
              backbone of your final report. Changes are saved when you leave a field.
            </p>
          </Card>
          <div className="relative grid gap-4 lg:grid-cols-2">
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/40 lg:flex">
              <ArrowRight className="h-5 w-5" />
            </div>

            <Card className="p-5">
              <div className="flex items-center gap-2">
                <Badge tone="rose">AS-IS</Badge>
                <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">Current System</h3>
              </div>
              <div className="mt-4 space-y-4">
                {(
                  [
                    ['currentProcess', 'Current process', 'How does work flow today, step by step?'],
                    ['currentProblems', 'Current problems', 'What hurts the most today?'],
                    ['currentTools', 'Current tools', 'Paper ledgers, spreadsheets, phone calls…'],
                    ['bottlenecks', 'Bottlenecks', 'Where does work pile up or stall?'],
                  ] as [keyof AsIsToBe, string, string][]
                ).map(([key, label, ph]) => (
                  <Field key={key} label={label}>
                    <Textarea
                      defaultValue={analysis.asIsToBe[key]}
                      placeholder={ph}
                      aria-label={`AS-IS: ${label}`}
                      onBlur={(e) => {
                        if (e.target.value !== analysis.asIsToBe[key]) saveAsIsToBe({ [key]: e.target.value })
                      }}
                    />
                  </Field>
                ))}
              </div>
            </Card>

            <Card className="border-emerald-200/60 p-5 dark:border-emerald-400/15">
              <div className="flex items-center gap-2">
                <Badge tone="emerald">TO-BE</Badge>
                <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">Proposed System</h3>
              </div>
              <div className="mt-4 space-y-4">
                {(
                  [
                    ['proposedProcess', 'Proposed process', 'How will work flow in the new system?'],
                    ['newSystem', 'New system', 'What will the system do? Core capabilities…'],
                    ['improvements', 'Improvements', 'What specifically gets better, and by how much?'],
                    ['expectedBenefits', 'Expected benefits', 'Time saved, errors reduced, revenue protected…'],
                  ] as [keyof AsIsToBe, string, string][]
                ).map(([key, label, ph]) => (
                  <Field key={key} label={label}>
                    <Textarea
                      defaultValue={analysis.asIsToBe[key]}
                      placeholder={ph}
                      aria-label={`TO-BE: ${label}`}
                      onBlur={(e) => {
                        if (e.target.value !== analysis.asIsToBe[key]) saveAsIsToBe({ [key]: e.target.value })
                      }}
                    />
                  </Field>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Use case modal */}
      <Modal open={ucModal} onClose={() => setUCModal(false)} title={editingUC ? 'Edit Use Case' : 'New Use Case'} subtitle="How does an actor achieve a goal with the system?" wide>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Actor *">
            <Input value={ucForm.actor} onChange={(e) => setUCForm({ ...ucForm, actor: e.target.value })} placeholder="e.g. Cashier" list="uc-actors" aria-label="Actor" />
            <datalist id="uc-actors">
              {analysis.stakeholders.map((s) => (
                <option key={s.id} value={s.name} />
              ))}
            </datalist>
          </Field>
          <Field label="Use case name *">
            <Input value={ucForm.name} onChange={(e) => setUCForm({ ...ucForm, name: e.target.value })} placeholder="e.g. Record Stock Adjustment" aria-label="Use case name" />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <Textarea value={ucForm.description} onChange={(e) => setUCForm({ ...ucForm, description: e.target.value })} placeholder="What goal does this use case accomplish?" className="min-h-[60px]" />
          </Field>
          <Field label="Preconditions">
            <Textarea value={ucForm.preconditions} onChange={(e) => setUCForm({ ...ucForm, preconditions: e.target.value })} placeholder={'One per line\ne.g. User is logged in'} className="min-h-[70px]" />
          </Field>
          <Field label="Postconditions">
            <Textarea value={ucForm.postconditions} onChange={(e) => setUCForm({ ...ucForm, postconditions: e.target.value })} placeholder={'What is true when this succeeds?'} className="min-h-[70px]" />
          </Field>
          <Field label="Main flow" hint="One step per line">
            <Textarea value={ucForm.mainFlow} onChange={(e) => setUCForm({ ...ucForm, mainFlow: e.target.value })} placeholder={'1. Actor opens stock screen\n2. Actor scans item\n3. System shows current stock'} className="min-h-[110px]" />
          </Field>
          <Field label="Alternative flow" hint="Exceptions and branches">
            <Textarea value={ucForm.alternativeFlow} onChange={(e) => setUCForm({ ...ucForm, alternativeFlow: e.target.value })} placeholder={'2a. Item not found → actor creates it\n3a. Stock negative → warning shown'} className="min-h-[110px]" />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setUCModal(false)}>
            Cancel
          </Button>
          <Button onClick={saveUC} icon={Boxes}>{editingUC ? 'Save Changes' : 'Create Use Case'}</Button>
        </div>
      </Modal>

      {/* Flow step modal */}
      <Modal open={flowModal} onClose={() => setFlowModal(false)} title={editingStep ? 'Edit Step' : 'Add Process Step'}>
        <div className="grid gap-4">
          <Field label="Step type">
            <Select value={stepType} onChange={(e) => setStepType(e.target.value as ProcessStepType)} options={[
              { value: 'start', label: 'Start' },
              { value: 'process', label: 'Process' },
              { value: 'decision', label: 'Decision' },
              { value: 'end', label: 'End' },
            ]} aria-label="Step type" />
          </Field>
          <Field label="Label *">
            <Input value={stepLabel} onChange={(e) => setStepLabel(e.target.value)} placeholder={stepType === 'decision' ? 'e.g. Stock available?' : 'e.g. Check stock'} aria-label="Step label" />
          </Field>
          <Field label="Branch note" hint="Shown on the incoming arrow — e.g. YES / NO for decisions">
            <Input value={stepNote} onChange={(e) => setStepNote(e.target.value)} placeholder="e.g. YES" aria-label="Branch note" />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setFlowModal(false)}>
            Cancel
          </Button>
          <Button onClick={saveStep} icon={ListOrdered}>{editingStep ? 'Save Step' : 'Add Step'}</Button>
        </div>
      </Modal>
    </div>
  )
}
