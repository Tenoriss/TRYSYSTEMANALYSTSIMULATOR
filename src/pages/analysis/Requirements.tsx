import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  ClipboardList,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
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
import { XP } from '../../lib/scoring'
import { nowISO, uid } from '../../lib/utils'
import type {
  FunctionalRequirement,
  MoSCoW,
  NFRCategory,
  NonFunctionalRequirement,
  ReqStatus,
} from '../../types'

const PRIORITIES: MoSCoW[] = ['Must Have', 'Should Have', 'Could Have', "Won't Have"]
const STATUSES: ReqStatus[] = ['Proposed', 'Approved', 'Rejected']
const CATEGORIES: NFRCategory[] = ['Performance', 'Security', 'Usability', 'Reliability', 'Scalability', 'Availability']

const PRIORITY_TONE: Record<MoSCoW, BadgeTone> = {
  'Must Have': 'rose',
  'Should Have': 'amber',
  'Could Have': 'cyan',
  "Won't Have": 'slate',
}
const STATUS_TONE: Record<ReqStatus, BadgeTone> = { Proposed: 'slate', Approved: 'emerald', Rejected: 'rose' }

type Tab = 'functional' | 'nonfunctional'

function nextCode(prefix: string, codes: string[]): string {
  let max = 0
  for (const c of codes) {
    const m = c.match(/(\d+)$/)
    if (m) max = Math.max(max, parseInt(m[1], 10))
  }
  return `${prefix}-${String(max + 1).padStart(3, '0')}`
}

/* --------------------------------- FR form --------------------------------- */

interface FRForm {
  requirement: string
  description: string
  priority: MoSCoW
  source: string
  status: ReqStatus
}

interface NFRForm {
  requirement: string
  category: NFRCategory
  priority: MoSCoW
  description: string
}

const EMPTY_FR: FRForm = { requirement: '', description: '', priority: 'Must Have', source: '', status: 'Proposed' }
const EMPTY_NFR: NFRForm = { requirement: '', category: 'Performance', priority: 'Must Have', description: '' }

export default function Requirements() {
  const { analysis } = useOutletContext<AnalysisCtx>()
  const { updateAnalysis } = useApp()
  const toast = useToast()

  const [tab, setTab] = useState<Tab>('functional')
  const [query, setQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const [frModal, setFRModal] = useState(false)
  const [editingFR, setEditingFR] = useState<FunctionalRequirement | null>(null)
  const [frForm, setFRForm] = useState<FRForm>(EMPTY_FR)

  const [nfrModal, setNFRModal] = useState(false)
  const [editingNFR, setEditingNFR] = useState<NonFunctionalRequirement | null>(null)
  const [nfrForm, setNFRForm] = useState<NFRForm>(EMPTY_NFR)

  const frList = useMemo(() => {
    const q = query.trim().toLowerCase()
    return analysis.functionalRequirements.filter((r) => {
      if (priorityFilter !== 'all' && r.priority !== priorityFilter) return false
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (q && !`${r.code} ${r.requirement} ${r.description} ${r.source}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [analysis.functionalRequirements, query, priorityFilter, statusFilter])

  const nfrList = useMemo(() => {
    const q = query.trim().toLowerCase()
    return analysis.nonFunctionalRequirements.filter((r) => {
      if (priorityFilter !== 'all' && r.priority !== priorityFilter) return false
      if (categoryFilter !== 'all' && r.category !== categoryFilter) return false
      if (q && !`${r.code} ${r.requirement} ${r.description}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [analysis.nonFunctionalRequirements, query, priorityFilter, categoryFilter])

  const saveFR = () => {
    if (!frForm.requirement.trim()) {
      toast.warning('Please complete the required fields', 'Requirement statement is required.')
      return
    }
    if (editingFR) {
      updateAnalysis(analysis.caseId, (d) => {
        d.functionalRequirements = d.functionalRequirements.map((r) =>
          r.id === editingFR.id ? { ...r, ...frForm } : r,
        )
      })
      toast.success('Requirement updated', editingFR.code)
    } else {
      const code = nextCode('FR', analysis.functionalRequirements.map((r) => r.code))
      updateAnalysis(
        analysis.caseId,
        (d) => {
          d.functionalRequirements.push({ id: uid(), code, ...frForm, createdAt: nowISO() })
        },
        { amount: XP.requirement, label: `${code} added` },
      )
      toast.success('Functional requirement added', code)
    }
    setFRModal(false)
  }

  const saveNFR = () => {
    if (!nfrForm.requirement.trim()) {
      toast.warning('Please complete the required fields', 'Requirement statement is required.')
      return
    }
    if (editingNFR) {
      updateAnalysis(analysis.caseId, (d) => {
        d.nonFunctionalRequirements = d.nonFunctionalRequirements.map((r) =>
          r.id === editingNFR.id ? { ...r, ...nfrForm } : r,
        )
      })
      toast.success('Requirement updated', editingNFR.code)
    } else {
      const code = nextCode('NFR', analysis.nonFunctionalRequirements.map((r) => r.code))
      updateAnalysis(
        analysis.caseId,
        (d) => {
          d.nonFunctionalRequirements.push({ id: uid(), code, ...nfrForm, createdAt: nowISO() })
        },
        { amount: XP.requirement, label: `${code} added` },
      )
      toast.success('Non-functional requirement added', code)
    }
    setNFRModal(false)
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Requirements"
        subtitle="Translate problems into clear, prioritized statements of what the system must do — and how well."
        action={
          <Segmented<Tab>
            ariaLabel="Requirement types"
            value={tab}
            onChange={setTab}
            options={[
              {
                value: 'functional',
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <ClipboardList className="h-3.5 w-3.5" /> Functional ({analysis.functionalRequirements.length})
                  </span>
                ),
              },
              {
                value: 'nonfunctional',
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" /> Non-Functional ({analysis.nonFunctionalRequirements.length})
                  </span>
                ),
              },
            ]}
          />
        }
      />

      {/* Toolbar */}
      <Card className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search requirements…"
            aria-label="Search requirements"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            aria-label="Filter by priority"
            className="w-auto py-1.5 text-xs font-semibold"
            options={[{ value: 'all', label: 'All priorities' }, ...PRIORITIES.map((p) => ({ value: p, label: p }))]}
          />
          {tab === 'functional' ? (
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
              className="w-auto py-1.5 text-xs font-semibold"
              options={[{ value: 'all', label: 'All statuses' }, ...STATUSES.map((s) => ({ value: s, label: s }))]}
            />
          ) : (
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by category"
              className="w-auto py-1.5 text-xs font-semibold"
              options={[{ value: 'all', label: 'All categories' }, ...CATEGORIES.map((c) => ({ value: c, label: c }))]}
            />
          )}
          <Button
            size="sm"
            icon={Plus}
            onClick={() => {
              if (tab === 'functional') {
                setEditingFR(null)
                setFRForm(EMPTY_FR)
                setFRModal(true)
              } else {
                setEditingNFR(null)
                setNFRForm(EMPTY_NFR)
                setNFRModal(true)
              }
            }}
          >
            Add {tab === 'functional' ? 'FR' : 'NFR'}
          </Button>
        </div>
      </Card>

      {/* Content */}
      {tab === 'functional' ? (
        analysis.functionalRequirements.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No requirements yet."
            description="Start documenting what the system needs. A good requirement reads: “The system shall …”."
            action={
              <Button
                size="sm"
                icon={Plus}
                onClick={() => {
                  setEditingFR(null)
                  setFRForm(EMPTY_FR)
                  setFRModal(true)
                }}
              >
                Write First Requirement
              </Button>
            }
          />
        ) : frList.length === 0 ? (
          <EmptyState icon={Search} title="Nothing matches your filters." description="Adjust the search or filters above." />
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-base min-w-[760px]">
                <thead>
                  <tr>
                    <th className="w-20">ID</th>
                    <th>Requirement</th>
                    <th className="w-32">Priority</th>
                    <th className="w-36">Source</th>
                    <th className="w-28">Status</th>
                    <th className="w-20 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {frList.map((r) => (
                    <tr key={r.id}>
                      <td className="font-mono text-xs font-bold text-indigo-500 dark:text-indigo-300">{r.code}</td>
                      <td>
                        <p className="font-medium text-slate-800 dark:text-slate-100">{r.requirement}</p>
                        {r.description && <p className="mt-0.5 text-xs text-muted">{r.description}</p>}
                      </td>
                      <td>
                        <Badge tone={PRIORITY_TONE[r.priority]}>{r.priority}</Badge>
                      </td>
                      <td className="text-xs">{r.source || '—'}</td>
                      <td>
                        <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
                      </td>
                      <td>
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingFR(r)
                              setFRForm({
                                requirement: r.requirement,
                                description: r.description,
                                priority: r.priority,
                                source: r.source,
                                status: r.status,
                              })
                              setFRModal(true)
                            }}
                            aria-label={`Edit ${r.code}`}
                            title="Edit"
                            className="icon-btn h-8 w-8"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              updateAnalysis(analysis.caseId, (d) => {
                                d.functionalRequirements = d.functionalRequirements.filter((x) => x.id !== r.id)
                              })
                              toast.info(`${r.code} removed`)
                            }}
                            aria-label={`Delete ${r.code}`}
                            title="Delete"
                            className="icon-btn h-8 w-8 hover:!bg-rose-500/10 hover:!text-rose-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      ) : analysis.nonFunctionalRequirements.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No non-functional requirements yet."
          description="Define how well the system must perform: speed, security, usability, reliability, scalability, availability."
          action={
            <Button
              size="sm"
              icon={Plus}
              onClick={() => {
                setEditingNFR(null)
                setNFRForm(EMPTY_NFR)
                setNFRModal(true)
              }}
            >
              Write First NFR
            </Button>
          }
        />
      ) : nfrList.length === 0 ? (
        <EmptyState icon={Search} title="Nothing matches your filters." description="Adjust the search or filters above." />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-base min-w-[720px]">
              <thead>
                <tr>
                  <th className="w-24">ID</th>
                  <th>Requirement</th>
                  <th className="w-32">Category</th>
                  <th className="w-32">Priority</th>
                  <th className="w-20 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {nfrList.map((r) => (
                  <tr key={r.id}>
                    <td className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-300">{r.code}</td>
                    <td>
                      <p className="font-medium text-slate-800 dark:text-slate-100">{r.requirement}</p>
                      {r.description && <p className="mt-0.5 text-xs text-muted">{r.description}</p>}
                    </td>
                    <td>
                      <Badge tone="violet">{r.category}</Badge>
                    </td>
                    <td>
                      <Badge tone={PRIORITY_TONE[r.priority]}>{r.priority}</Badge>
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingNFR(r)
                            setNFRForm({
                              requirement: r.requirement,
                              category: r.category,
                              priority: r.priority,
                              description: r.description,
                            })
                            setNFRModal(true)
                          }}
                          aria-label={`Edit ${r.code}`}
                          title="Edit"
                          className="icon-btn h-8 w-8"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            updateAnalysis(analysis.caseId, (d) => {
                              d.nonFunctionalRequirements = d.nonFunctionalRequirements.filter((x) => x.id !== r.id)
                            })
                            toast.info(`${r.code} removed`)
                          }}
                          aria-label={`Delete ${r.code}`}
                          title="Delete"
                          className="icon-btn h-8 w-8 hover:!bg-rose-500/10 hover:!text-rose-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* FR modal */}
      <Modal
        open={frModal}
        onClose={() => setFRModal(false)}
        title={editingFR ? `Edit ${editingFR.code}` : 'New Functional Requirement'}
        subtitle="What must the system do?"
        wide
      >
        <div className="grid gap-4">
          <Field label="Requirement *" hint="Start with “The system shall …”">
            <Input
              value={frForm.requirement}
              onChange={(e) => setFRForm({ ...frForm, requirement: e.target.value })}
              placeholder="The system shall record every stock movement in real time"
              aria-label="Requirement statement"
            />
          </Field>
          <Field label="Description">
            <Textarea
              value={frForm.description}
              onChange={(e) => setFRForm({ ...frForm, description: e.target.value })}
              placeholder="Details, acceptance criteria, edge cases…"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Priority (MoSCoW)">
              <Select value={frForm.priority} onChange={(e) => setFRForm({ ...frForm, priority: e.target.value as MoSCoW })} options={PRIORITIES} aria-label="Priority" />
            </Field>
            <Field label="Source">
              <Input
                value={frForm.source}
                onChange={(e) => setFRForm({ ...frForm, source: e.target.value })}
                placeholder="e.g. Store Manager"
                aria-label="Source"
              />
            </Field>
            <Field label="Status">
              <Select value={frForm.status} onChange={(e) => setFRForm({ ...frForm, status: e.target.value as ReqStatus })} options={STATUSES} aria-label="Status" />
            </Field>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setFRModal(false)}>
            Cancel
          </Button>
          <Button onClick={saveFR}>{editingFR ? 'Save Changes' : 'Add Requirement'}</Button>
        </div>
      </Modal>

      {/* NFR modal */}
      <Modal
        open={nfrModal}
        onClose={() => setNFRModal(false)}
        title={editingNFR ? `Edit ${editingNFR.code}` : 'New Non-Functional Requirement'}
        subtitle="How well must the system behave?"
        wide
      >
        <div className="grid gap-4">
          <Field label="Requirement *" hint="Make it measurable when possible">
            <Input
              value={nfrForm.requirement}
              onChange={(e) => setNFRForm({ ...nfrForm, requirement: e.target.value })}
              placeholder="Stock lookup results appear within 2 seconds"
              aria-label="Requirement statement"
            />
          </Field>
          <Field label="Description">
            <Textarea
              value={nfrForm.description}
              onChange={(e) => setNFRForm({ ...nfrForm, description: e.target.value })}
              placeholder="Thresholds, rationale, measurement method…"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category">
              <Select value={nfrForm.category} onChange={(e) => setNFRForm({ ...nfrForm, category: e.target.value as NFRCategory })} options={CATEGORIES} aria-label="Category" />
            </Field>
            <Field label="Priority">
              <Select value={nfrForm.priority} onChange={(e) => setNFRForm({ ...nfrForm, priority: e.target.value as MoSCoW })} options={PRIORITIES} aria-label="Priority" />
            </Field>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setNFRModal(false)}>
            Cancel
          </Button>
          <Button onClick={saveNFR}>{editingNFR ? 'Save Changes' : 'Add Requirement'}</Button>
        </div>
      </Modal>
    </div>
  )
}
