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
import { MOSCOW_KEYS, NFRCAT_KEYS, REQSTATUS_KEYS } from '../../i18n'
import { useI18n } from '../../i18n/useI18n'
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
  const { t } = useI18n()
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
      toast.warning(t('common.requiredFields'), t('rq.statementRequired'))
      return
    }
    if (editingFR) {
      updateAnalysis(analysis.caseId, (d) => {
        d.functionalRequirements = d.functionalRequirements.map((r) =>
          r.id === editingFR.id ? { ...r, ...frForm } : r,
        )
      })
      toast.success(t('rq.updated'), editingFR.code)
    } else {
      const code = nextCode('FR', analysis.functionalRequirements.map((r) => r.code))
      updateAnalysis(
        analysis.caseId,
        (d) => {
          d.functionalRequirements.push({ id: uid(), code, ...frForm, createdAt: nowISO() })
        },
        { amount: XP.requirement, label: t('xp.requirement', { code }) },
      )
      toast.success(t('rq.addedFR'), code)
    }
    setFRModal(false)
  }

  const saveNFR = () => {
    if (!nfrForm.requirement.trim()) {
      toast.warning(t('common.requiredFields'), t('rq.statementRequired'))
      return
    }
    if (editingNFR) {
      updateAnalysis(analysis.caseId, (d) => {
        d.nonFunctionalRequirements = d.nonFunctionalRequirements.map((r) =>
          r.id === editingNFR.id ? { ...r, ...nfrForm } : r,
        )
      })
      toast.success(t('rq.updated'), editingNFR.code)
    } else {
      const code = nextCode('NFR', analysis.nonFunctionalRequirements.map((r) => r.code))
      updateAnalysis(
        analysis.caseId,
        (d) => {
          d.nonFunctionalRequirements.push({ id: uid(), code, ...nfrForm, createdAt: nowISO() })
        },
        { amount: XP.requirement, label: t('xp.requirement', { code }) },
      )
      toast.success(t('rq.addedNFR'), code)
    }
    setNFRModal(false)
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title={t('rq.title')}
        subtitle={t('rq.subtitle')}
        action={
          <Segmented<Tab>
            ariaLabel={t('rq.typesAria')}
            value={tab}
            onChange={setTab}
            options={[
              {
                value: 'functional',
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <ClipboardList className="h-3.5 w-3.5" /> {t('rq.tabFR', { count: analysis.functionalRequirements.length })}
                  </span>
                ),
              },
              {
                value: 'nonfunctional',
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" /> {t('rq.tabNFR', { count: analysis.nonFunctionalRequirements.length })}
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
            placeholder={t('rq.searchPh')}
            aria-label={t('rq.searchAria')}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            aria-label={t('rq.filterPriorityAria')}
            className="w-auto py-1.5 text-xs font-semibold"
            options={[{ value: 'all', label: t('rq.allPriorities') }, ...PRIORITIES.map((p) => ({ value: p, label: t(MOSCOW_KEYS[p]) }))]}
          />
          {tab === 'functional' ? (
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label={t('rq.filterStatusAria')}
              className="w-auto py-1.5 text-xs font-semibold"
              options={[{ value: 'all', label: t('rq.allStatuses') }, ...STATUSES.map((s) => ({ value: s, label: t(REQSTATUS_KEYS[s]) }))]}
            />
          ) : (
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label={t('rq.filterCategoryAria')}
              className="w-auto py-1.5 text-xs font-semibold"
              options={[{ value: 'all', label: t('rq.allCategories') }, ...CATEGORIES.map((c) => ({ value: c, label: t(NFRCAT_KEYS[c]) }))]}
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
            {tab === 'functional' ? t('rq.addFR') : t('rq.addNFR')}
          </Button>
        </div>
      </Card>

      {/* Content */}
      {tab === 'functional' ? (
        analysis.functionalRequirements.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={t('rq.emptyFRTitle')}
            description={t('rq.emptyFRDesc')}
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
          <EmptyState icon={Search} title={t('rq.noMatchTitle')} description={t('rq.noMatchDesc')} />
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-base min-w-[760px]">
                <thead>
                  <tr>
                    <th className="w-20">{t('tbl.id')}</th>
                    <th>{t('tbl.requirement')}</th>
                    <th className="w-32">{t('tbl.priority')}</th>
                    <th className="w-36">{t('tbl.source')}</th>
                    <th className="w-28">{t('tbl.status')}</th>
                    <th className="w-20 text-right">{t('common.actions')}</th>
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
                        <Badge tone={PRIORITY_TONE[r.priority]}>{t(MOSCOW_KEYS[r.priority])}</Badge>
                      </td>
                      <td className="text-xs">{r.source || '—'}</td>
                      <td>
                        <Badge tone={STATUS_TONE[r.status]}>{t(REQSTATUS_KEYS[r.status])}</Badge>
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
                            aria-label={t('rq.editCode', { code: r.code })}
                            title={t('common.edit')}
                            className="icon-btn h-8 w-8"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              updateAnalysis(analysis.caseId, (d) => {
                                d.functionalRequirements = d.functionalRequirements.filter((x) => x.id !== r.id)
                              })
                              toast.info(t('rq.removed', { code: r.code }))
                            }}
                            aria-label={`${t('common.delete')} ${r.code}`}
                            title={t('common.delete')}
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
          title={t('rq.emptyNFRTitle')}
          description={t('rq.emptyNFRDesc')}
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
        <EmptyState icon={Search} title={t('rq.noMatchTitle')} description={t('rq.noMatchDesc')} />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-base min-w-[720px]">
              <thead>
                <tr>
                  <th className="w-24">{t('tbl.id')}</th>
                  <th>{t('tbl.requirement')}</th>
                  <th className="w-32">{t('tbl.category')}</th>
                  <th className="w-32">{t('tbl.priority')}</th>
                  <th className="w-20 text-right">{t('common.actions')}</th>
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
                      <Badge tone="violet">{t(NFRCAT_KEYS[r.category])}</Badge>
                    </td>
                    <td>
                      <Badge tone={PRIORITY_TONE[r.priority]}>{t(MOSCOW_KEYS[r.priority])}</Badge>
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
                          aria-label={t('rq.editCode', { code: r.code })}
                          title={t('common.edit')}
                          className="icon-btn h-8 w-8"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            updateAnalysis(analysis.caseId, (d) => {
                              d.nonFunctionalRequirements = d.nonFunctionalRequirements.filter((x) => x.id !== r.id)
                            })
                            toast.info(t('rq.removed', { code: r.code }))
                          }}
                          aria-label={`${t('common.delete')} ${r.code}`}
                          title={t('common.delete')}
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
        title={editingFR ? t('rq.editCode', { code: editingFR.code }) : t('rq.newFR')}
        subtitle={t('rq.frSub')}
        wide
      >
        <div className="grid gap-4">
          <Field label={t('rq.requirementLabel')} hint={t('rq.frHint')}>
            <Input
              value={frForm.requirement}
              onChange={(e) => setFRForm({ ...frForm, requirement: e.target.value })}
              placeholder={t('rq.frPh')}
              aria-label={t('rq.statementAria')}
            />
          </Field>
          <Field label={t('pr.description')}>
            <Textarea
              value={frForm.description}
              onChange={(e) => setFRForm({ ...frForm, description: e.target.value })}
              placeholder={t('rq.descPh')}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t('rq.priorityMoscow')}>
              <Select
                value={frForm.priority}
                onChange={(e) => setFRForm({ ...frForm, priority: e.target.value as MoSCoW })}
                options={PRIORITIES.map((p) => ({ value: p, label: t(MOSCOW_KEYS[p]) }))}
                aria-label={t('tbl.priority')}
              />
            </Field>
            <Field label={t('tbl.source')}>
              <Input
                value={frForm.source}
                onChange={(e) => setFRForm({ ...frForm, source: e.target.value })}
                placeholder={t('rq.sourcePh')}
                aria-label={t('tbl.source')}
              />
            </Field>
            <Field label={t('tbl.status')}>
              <Select
                value={frForm.status}
                onChange={(e) => setFRForm({ ...frForm, status: e.target.value as ReqStatus })}
                options={STATUSES.map((s) => ({ value: s, label: t(REQSTATUS_KEYS[s]) }))}
                aria-label={t('tbl.status')}
              />
            </Field>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setFRModal(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={saveFR}>{editingFR ? t('form.saveChanges') : t('rq.addReq')}</Button>
        </div>
      </Modal>

      {/* NFR modal */}
      <Modal
        open={nfrModal}
        onClose={() => setNFRModal(false)}
        title={editingNFR ? t('rq.editCode', { code: editingNFR.code }) : t('rq.newNFR')}
        subtitle={t('rq.nfrSub')}
        wide
      >
        <div className="grid gap-4">
          <Field label={t('rq.requirementLabel')} hint={t('rq.nfrHint')}>
            <Input
              value={nfrForm.requirement}
              onChange={(e) => setNFRForm({ ...nfrForm, requirement: e.target.value })}
              placeholder={t('rq.nfrPh')}
              aria-label={t('rq.statementAria')}
            />
          </Field>
          <Field label={t('pr.description')}>
            <Textarea
              value={nfrForm.description}
              onChange={(e) => setNFRForm({ ...nfrForm, description: e.target.value })}
              placeholder={t('rq.nfrDescPh')}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('tbl.category')}>
              <Select
                value={nfrForm.category}
                onChange={(e) => setNFRForm({ ...nfrForm, category: e.target.value as NFRCategory })}
                options={CATEGORIES.map((c) => ({ value: c, label: t(NFRCAT_KEYS[c]) }))}
                aria-label={t('tbl.category')}
              />
            </Field>
            <Field label={t('tbl.priority')}>
              <Select
                value={nfrForm.priority}
                onChange={(e) => setNFRForm({ ...nfrForm, priority: e.target.value as MoSCoW })}
                options={PRIORITIES.map((p) => ({ value: p, label: t(MOSCOW_KEYS[p]) }))}
                aria-label={t('tbl.priority')}
              />
            </Field>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setNFRModal(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={saveNFR}>{editingNFR ? t('form.saveChanges') : t('rq.addReq')}</Button>
        </div>
      </Modal>
    </div>
  )
}
