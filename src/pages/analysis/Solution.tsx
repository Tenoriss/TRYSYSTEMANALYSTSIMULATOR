import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Cpu,
  Gift,
  Layers,
  Lightbulb,
  Pencil,
  Plus,
  Shield,
  Trash2,
  Users2,
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
import { riskScore, XP } from '../../lib/scoring'
import { nowISO, uid } from '../../lib/utils'
import { TRI_KEYS } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import { useI18n } from '../../i18n/useI18n'
import type { Level3, Risk, SolutionFeature } from '../../types'

type Tab = 'design' | 'risks'

const LEVELS3: Level3[] = ['Low', 'Medium', 'High']
const RISK_TONE: Record<string, BadgeTone> = { Low: 'emerald', Medium: 'amber', High: 'rose' }

interface FeatureForm {
  name: string
  description: string
  priority: Level3
  userRole: string
}

const EMPTY_FEATURE: FeatureForm = { name: '', description: '', priority: 'Medium', userRole: '' }

interface RiskForm {
  risk: string
  probability: Level3
  impact: Level3
  mitigation: string
  owner: string
}

const EMPTY_RISK: RiskForm = { risk: '', probability: 'Medium', impact: 'Medium', mitigation: '', owner: '' }

/* ------------------------------- Risk matrix ------------------------------- */

function RiskMatrix({ risks }: { risks: Risk[] }) {
  const { t } = useI18n()
  const cells = useMemo(() => {
    const m: Record<string, Risk[]> = {}
    risks.forEach((r) => {
      const k = `${r.probability}-${r.impact}`
      if (!m[k]) m[k] = []
      m[k].push(r)
    })
    return m
  }, [risks])

  const probs: Level3[] = ['High', 'Medium', 'Low']
  const imps: Level3[] = ['Low', 'Medium', 'High']

  const cellBg = (p: Level3, i: Level3) => {
    const score = riskScore({ probability: p, impact: i } as Risk).score
    return score >= 6
      ? 'bg-rose-500/[0.09] dark:bg-rose-400/[0.08]'
      : score >= 3
        ? 'bg-amber-400/[0.08] dark:bg-amber-400/[0.07]'
        : 'bg-emerald-400/[0.07] dark:bg-emerald-400/[0.06]'
  }

  return (
    <Card className="p-5">
      <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">{t('rk.matrixTitle')}</h3>
      <div className="mt-4 flex gap-2">
        <div className="flex w-24 shrink-0 flex-col justify-between py-1 text-right">
          {probs.map((p) => (
            <span key={p} className="flex h-16 items-center justify-end text-[10px] font-bold uppercase tracking-wide text-muted">
              {t(TRI_KEYS[p])}
            </span>
          ))}
          <span className="text-[9px] font-bold uppercase tracking-wide text-muted">{t('rk.probabilityAxis')}</span>
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-3 gap-1.5">
            {probs.map((p) =>
              imps.map((i) => (
                <div
                  key={`${p}-${i}`}
                  className={`flex h-16 flex-wrap content-start gap-1 rounded-lg border border-slate-200/80 p-1.5 dark:border-white/[0.06] ${cellBg(p, i)}`}
                >
                  {(cells[`${p}-${i}`] ?? []).map((r) => (
                    <span
                      key={r.id}
                      title={r.risk}
                      className="max-w-full truncate rounded bg-slate-800/80 px-1.5 py-0.5 text-[9px] font-semibold text-white dark:bg-white/20"
                    >
                      {r.risk.length > 18 ? `${r.risk.slice(0, 17)}…` : r.risk}
                    </span>
                  ))}
                </div>
              )),
            )}
          </div>
          <div className="mt-1.5 grid grid-cols-3 gap-1.5 text-center">
            {imps.map((i) => (
              <span key={i} className="text-[10px] font-bold uppercase tracking-wide text-muted">
                {t(TRI_KEYS[i])}
              </span>
            ))}
          </div>
          <p className="mt-1 text-center text-[9px] font-bold uppercase tracking-wide text-muted">{t('rk.impactAxis')}</p>
        </div>
      </div>
    </Card>
  )
}

/* ---------------------------------- Page ----------------------------------- */

export default function Solution() {
  const { analysis } = useOutletContext<AnalysisCtx>()
  const { updateAnalysis } = useApp()
  const { t } = useI18n()
  const toast = useToast()
  const [tab, setTab] = useState<Tab>('design')

  const [featureModal, setFeatureModal] = useState(false)
  const [editingFeature, setEditingFeature] = useState<SolutionFeature | null>(null)
  const [featureForm, setFeatureForm] = useState<FeatureForm>(EMPTY_FEATURE)

  const [riskModal, setRiskModal] = useState(false)
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null)
  const [riskForm, setRiskForm] = useState<RiskForm>(EMPTY_RISK)

  const saveSolutionField = (field: keyof AnalysisCtx['analysis']['solution'], value: string) => {
    if (value === analysis.solution[field]) return
    updateAnalysis(analysis.caseId, (d) => {
      d.solution = { ...d.solution, [field]: value }
    })
    toast.success(t('common.analysisSaved'))
  }

  const saveFeature = () => {
    if (!featureForm.name.trim()) {
      toast.warning(t('common.requiredFields'), t('feat.nameRequired'))
      return
    }
    if (editingFeature) {
      updateAnalysis(analysis.caseId, (d) => {
        d.features = d.features.map((f) => (f.id === editingFeature.id ? { ...f, ...featureForm } : f))
      })
      toast.success(t('feat.updated'), featureForm.name)
    } else {
      updateAnalysis(
        analysis.caseId,
        (d) => {
          d.features.push({ id: uid(), ...featureForm })
        },
        { amount: XP.feature, label: t('xp.feature') },
      )
    }
    setFeatureModal(false)
  }

  const saveRisk = () => {
    if (!riskForm.risk.trim()) {
      toast.warning(t('common.requiredFields'), t('rk.describeRequired'))
      return
    }
    if (editingRisk) {
      updateAnalysis(analysis.caseId, (d) => {
        d.risks = d.risks.map((r) => (r.id === editingRisk.id ? { ...r, ...riskForm } : r))
      })
      toast.success(t('rk.updated'))
    } else {
      updateAnalysis(
        analysis.caseId,
        (d) => {
          d.risks.push({ id: uid(), ...riskForm, createdAt: nowISO() })
        },
        { amount: XP.risk, label: t('xp.risk') },
      )
    }
    setRiskModal(false)
  }

  const SOLUTION_FIELDS: [keyof AnalysisCtx['analysis']['solution'], TranslationKey, TranslationKey][] = [
    ['description', 'so.description', 'so.descriptionPh'],
    ['targetUsers', 'so.targetUsers', 'so.targetUsersPh'],
    ['technology', 'so.technology', 'so.technologyPh'],
    ['expectedBenefits', 'so.expectedBenefits', 'so.expectedBenefitsPh'],
    ['risks', 'so.risks', 'so.risksPh'],
    ['limitations', 'so.limitations', 'so.limitationsPh'],
  ]

  return (
    <div className="space-y-5">
      <SectionHeader
        title={t('so.title')}
        subtitle={t('so.subtitle')}
        action={
          <Segmented<Tab>
            ariaLabel={t('so.sectionsAria')}
            value={tab}
            onChange={setTab}
            options={[
              {
                value: 'design',
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5" /> {t('so.tabDesign', { count: analysis.features.length })}
                  </span>
                ),
              },
              {
                value: 'risks',
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" /> {t('so.tabRisks', { count: analysis.risks.length })}
                  </span>
                ),
              },
            ]}
          />
        }
      />

      {tab === 'design' ? (
        <div className="grid gap-5 xl:grid-cols-5">
          {/* Solution form */}
          <div className="xl:col-span-3">
            <Card className="p-5 sm:p-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-cyan-400/10 text-indigo-500 dark:text-indigo-300">
                  <Layers className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">{t('so.proposed')}</h3>
                  <p className="text-xs text-muted">{t('so.autosave')}</p>
                </div>
              </div>
              <div className="mt-5 space-y-4">
                <Field label={t('so.solutionName')}>
                  <Input
                    defaultValue={analysis.solution.name}
                    placeholder={t('so.solutionNamePh')}
                    aria-label={t('so.solutionName')}
                    onBlur={(e) => saveSolutionField('name', e.target.value)}
                  />
                </Field>
                {SOLUTION_FIELDS.map(([key, labelKey, phKey]) => (
                  <Field key={key} label={t(labelKey)}>
                    <Textarea
                      defaultValue={analysis.solution[key]}
                      placeholder={t(phKey)}
                      aria-label={t(labelKey)}
                      onBlur={(e) => saveSolutionField(key, e.target.value)}
                    />
                  </Field>
                ))}
              </div>
            </Card>
          </div>

          {/* Features */}
          <div className="space-y-3 xl:col-span-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-muted">{t('so.proposedFeatures')}</p>
              <Button
                size="sm"
                icon={Plus}
                onClick={() => {
                  setEditingFeature(null)
                  setFeatureForm(EMPTY_FEATURE)
                  setFeatureModal(true)
                }}
              >
                {t('so.addFeature')}
              </Button>
            </div>
            {analysis.features.length === 0 ? (
              <EmptyState
                icon={Gift}
                title={t('so.featEmptyTitle')}
                description={t('so.featEmptyDesc')}
                action={
                  <Button
                    size="sm"
                    icon={Plus}
                    onClick={() => {
                      setEditingFeature(null)
                      setFeatureForm(EMPTY_FEATURE)
                      setFeatureModal(true)
                    }}
                  >
                    {t('so.addFirstFeature')}
                  </Button>
                }
              />
            ) : (
              analysis.features.map((f, i) => (
                <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-500">
                          <Cpu className="h-3.5 w-3.5" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{f.name}</p>
                          {f.userRole && (
                            <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted">
                              <Users2 className="h-3 w-3" /> {f.userRole}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Badge tone={f.priority === 'High' ? 'rose' : f.priority === 'Medium' ? 'amber' : 'slate'}>{t(TRI_KEYS[f.priority])}</Badge>
                        <button
                          onClick={() => {
                            setEditingFeature(f)
                            setFeatureForm({ name: f.name, description: f.description, priority: f.priority, userRole: f.userRole })
                            setFeatureModal(true)
                          }}
                          aria-label={`${t('common.edit')} ${f.name}`}
                          title={t('common.edit')}
                          className="icon-btn h-7 w-7"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => {
                            updateAnalysis(analysis.caseId, (d) => {
                              d.features = d.features.filter((x) => x.id !== f.id)
                            })
                            toast.info(t('feat.removed'))
                          }}
                          aria-label={`${t('common.delete')} ${f.name}`}
                          title={t('common.delete')}
                          className="icon-btn h-7 w-7 hover:!bg-rose-500/10 hover:!text-rose-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    {f.description && <p className="mt-2 text-xs leading-relaxed text-muted">{f.description}</p>}
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* ------------------------------ RISK ANALYSIS ----------------------------- */
        <div className="grid gap-5 xl:grid-cols-5">
          <div className="space-y-3 xl:col-span-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-muted">{t('rk.register')}</p>
              <Button
                size="sm"
                icon={Plus}
                onClick={() => {
                  setEditingRisk(null)
                  setRiskForm(EMPTY_RISK)
                  setRiskModal(true)
                }}
              >
                {t('rk.add')}
              </Button>
            </div>
            {analysis.risks.length === 0 ? (
              <EmptyState
                icon={Shield}
                title={t('rk.emptyTitle')}
                description={t('rk.emptyDesc')}
                action={
                  <Button
                    size="sm"
                    icon={Plus}
                    onClick={() => {
                      setEditingRisk(null)
                      setRiskForm(EMPTY_RISK)
                      setRiskModal(true)
                    }}
                  >
                    {t('rk.addFirst')}
                  </Button>
                }
              />
            ) : (
              [...analysis.risks]
                .sort((a, b) => riskScore(b).score - riskScore(a).score)
                .map((r) => {
                  const rs = riskScore(r)
                  return (
                    <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black ${
                                rs.label === 'High'
                                  ? 'bg-rose-500/10 text-rose-500'
                                  : rs.label === 'Medium'
                                    ? 'bg-amber-400/10 text-amber-500'
                                    : 'bg-emerald-400/10 text-emerald-500'
                              }`}
                            >
                              {rs.score}
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">{r.risk}</p>
                              <div className="mt-1.5 flex flex-wrap gap-1.5">
                                <Badge tone="slate">{t('rk.probability', { p: t(TRI_KEYS[r.probability]) })}</Badge>
                                <Badge tone="slate">{t('rk.impact', { i: t(TRI_KEYS[r.impact]) })}</Badge>
                                <Badge tone={RISK_TONE[rs.label]}>{t('rk.level', { level: t(TRI_KEYS[rs.label]) })}</Badge>
                                {r.owner && <Badge tone="indigo">{t('rk.owner', { owner: r.owner })}</Badge>}
                              </div>
                            </div>
                          </div>
                          <div className="flex shrink-0 gap-1">
                            <button
                              onClick={() => {
                                setEditingRisk(r)
                                setRiskForm({
                                  risk: r.risk,
                                  probability: r.probability,
                                  impact: r.impact,
                                  mitigation: r.mitigation,
                                  owner: r.owner,
                                })
                                setRiskModal(true)
                              }}
                              aria-label={t('common.edit')}
                              title={t('common.edit')}
                              className="icon-btn h-8 w-8"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                updateAnalysis(analysis.caseId, (d) => {
                                  d.risks = d.risks.filter((x) => x.id !== r.id)
                                })
                                toast.info(t('rk.removed'))
                              }}
                              aria-label={t('common.delete')}
                              title={t('common.delete')}
                              className="icon-btn h-8 w-8 hover:!bg-rose-500/10 hover:!text-rose-500"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        {r.mitigation && (
                          <p className="mt-2.5 rounded-lg bg-emerald-500/[0.06] px-3 py-2 text-xs leading-relaxed text-emerald-700 dark:bg-emerald-400/[0.08] dark:text-emerald-200">
                            <span className="font-bold">{t('rk.mitigation')}</span> {r.mitigation}
                          </p>
                        )}
                      </Card>
                    </motion.div>
                  )
                })
            )}
          </div>
          <div className="xl:col-span-2">
            <RiskMatrix risks={analysis.risks} />
            <Card className="mt-4 p-4">
              <p className="text-xs leading-relaxed text-muted">{t('rk.scoringNote')}</p>
            </Card>
          </div>
        </div>
      )}

      {/* Feature modal */}
      <Modal open={featureModal} onClose={() => setFeatureModal(false)} title={editingFeature ? t('feat.editTitle') : t('feat.addTitle')}>
        <div className="grid gap-4">
          <Field label={t('feat.name')}>
            <Input value={featureForm.name} onChange={(e) => setFeatureForm({ ...featureForm, name: e.target.value })} placeholder={t('feat.namePh')} aria-label={t('feat.name')} />
          </Field>
          <Field label={t('feat.description')}>
            <Textarea value={featureForm.description} onChange={(e) => setFeatureForm({ ...featureForm, description: e.target.value })} placeholder={t('feat.descriptionPh')} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t('feat.priority')}>
              <Select
                value={featureForm.priority}
                onChange={(e) => setFeatureForm({ ...featureForm, priority: e.target.value as Level3 })}
                options={LEVELS3.map((l) => ({ value: l, label: t(TRI_KEYS[l]) }))}
                aria-label={t('feat.priority')}
              />
            </Field>
            <Field label={t('feat.userRole')}>
              <Input value={featureForm.userRole} onChange={(e) => setFeatureForm({ ...featureForm, userRole: e.target.value })} placeholder={t('feat.userRolePh')} aria-label={t('feat.userRole')} />
            </Field>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setFeatureModal(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={saveFeature}>{editingFeature ? t('form.saveChanges') : t('so.addFeature')}</Button>
        </div>
      </Modal>

      {/* Risk modal */}
      <Modal open={riskModal} onClose={() => setRiskModal(false)} title={editingRisk ? t('rk.editTitle') : t('rk.addTitle')} subtitle={t('rk.addSub')}>
        <div className="grid gap-4">
          <Field label={t('rk.riskField')}>
            <Input value={riskForm.risk} onChange={(e) => setRiskForm({ ...riskForm, risk: e.target.value })} placeholder={t('rk.riskPh')} aria-label={t('rk.riskField')} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t('rk.probabilityField')}>
              <Select
                value={riskForm.probability}
                onChange={(e) => setRiskForm({ ...riskForm, probability: e.target.value as Level3 })}
                options={LEVELS3.map((l) => ({ value: l, label: t(TRI_KEYS[l]) }))}
                aria-label={t('rk.probabilityField')}
              />
            </Field>
            <Field label={t('rk.impactField')}>
              <Select
                value={riskForm.impact}
                onChange={(e) => setRiskForm({ ...riskForm, impact: e.target.value as Level3 })}
                options={LEVELS3.map((l) => ({ value: l, label: t(TRI_KEYS[l]) }))}
                aria-label={t('rk.impactField')}
              />
            </Field>
          </div>
          <Field label={t('rk.mitigationField')}>
            <Textarea value={riskForm.mitigation} onChange={(e) => setRiskForm({ ...riskForm, mitigation: e.target.value })} placeholder={t('rk.mitigationPh')} />
          </Field>
          <Field label={t('rk.ownerField')}>
            <Input value={riskForm.owner} onChange={(e) => setRiskForm({ ...riskForm, owner: e.target.value })} placeholder={t('rk.ownerPh')} aria-label={t('rk.ownerField')} />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setRiskModal(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={saveRisk}>{editingRisk ? t('form.saveChanges') : t('rk.add')}</Button>
        </div>
      </Modal>
    </div>
  )
}
