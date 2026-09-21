import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, ShieldAlert } from 'lucide-react'
import { DIFF_KEYS, INDUSTRY_KEYS } from '../../i18n'
import { useI18n } from '../../i18n/useI18n'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { CASE_ICON_OPTIONS, getStoredCase } from '../../data/customCases'
import type { StoredCase } from '../../data/customCases'
import { Badge, Button, Card, EmptyState, Field, Input, Select, Textarea } from '../../components/ui'
import type { Difficulty } from '../../types'

/* Case authoring form for admin/developer users (Level 5+). Structured lists
 * are edited as line-based textareas — one item per line keeps the UI simple
 * while StoredCase arrays stay structured. */

const DIFFICULTIES: Difficulty[] = ['Beginner', 'Intermediate', 'Advanced']
const CUSTOM_INDUSTRY = '__custom__'

interface FormState {
  title: string
  tagline: string
  industry: string
  customIndustry: string
  difficulty: Difficulty
  estimatedTime: string
  iconKey: string
  description: string
  organization: string
  currentSituation: string
  existingProcess: string
  knownProblems: string
  objectives: string
  constraints: string
  skills: string
  stakeholders: string
  interviewQuestions: string
}

const EMPTY: FormState = {
  title: '',
  tagline: '',
  industry: 'E-commerce',
  customIndustry: '',
  difficulty: 'Intermediate',
  estimatedTime: '45–60 min',
  iconKey: 'briefcase',
  description: '',
  organization: '',
  currentSituation: '',
  existingProcess: '',
  knownProblems: '',
  objectives: '',
  constraints: '',
  skills: '',
  stakeholders: '',
  interviewQuestions: '',
}

const lines = (text: string): string[] =>
  text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

function fromStored(stored: StoredCase, publicIndustries: readonly string[]): FormState {
  const known = publicIndustries.includes(stored.industry)
  return {
    title: stored.title,
    tagline: stored.tagline,
    industry: known ? stored.industry : CUSTOM_INDUSTRY,
    customIndustry: known ? '' : stored.industry,
    difficulty: stored.difficulty,
    estimatedTime: stored.estimatedTime,
    iconKey: stored.iconKey,
    description: stored.description,
    organization: stored.organization,
    currentSituation: stored.currentSituation,
    existingProcess: stored.existingProcess.join('\n'),
    knownProblems: stored.knownProblems.join('\n'),
    objectives: stored.objectives.join('\n'),
    constraints: stored.constraints.join('\n'),
    skills: stored.skills.join('\n'),
    stakeholders: stored.stakeholdersContext
      .map((s) => [s.name, s.role, s.concern].filter(Boolean).join(' | '))
      .join('\n'),
    interviewQuestions: stored.interviewQuestions.join('\n'),
  }
}

export default function CaseForm() {
  const { id } = useParams<{ id: string }>()
  const editingId = id ?? null
  const { t } = useI18n()
  const { isAdmin } = useApp()
  const { addCustomCase } = useApp()
  const { account } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(EMPTY)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const publicIndustries = useMemo(() => Object.keys(INDUSTRY_KEYS), [])

  const existing = editingId ? getStoredCase(editingId) : undefined

  useEffect(() => {
    if (editingId && existing && !loaded) {
      setForm(fromStored(existing, publicIndustries))
      setLoaded(true)
    }
  }, [editingId, existing, loaded, publicIndustries])

  const set = (patch: Partial<FormState>) => {
    setForm((f) => ({ ...f, ...patch }))
    setError(null)
  }

  if (!isAdmin) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title={t('cf.notAdmin')}
        description={`${t('cf.notAdminDesc')} ${t('admin.hint')}`}
        action={
          <Button icon={ArrowLeft} variant="secondary" onClick={() => navigate('/cases')}>
            {t('cf.backToCases')}
          </Button>
        }
      />
    )
  }

  if (editingId && !existing) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title={t('cd.notFound')}
        description={t('cd.notFoundDesc')}
        action={
          <Button icon={ArrowLeft} variant="secondary" onClick={() => navigate('/cases')}>
            {t('cf.backToCases')}
          </Button>
        }
      />
    )
  }

  const save = () => {
    const industry = form.industry === CUSTOM_INDUSTRY ? form.customIndustry.trim() : form.industry
    const requiredText = [form.title, form.tagline, industry, form.description, form.organization, form.currentSituation]
    if (requiredText.some((v) => !v.trim())) {
      setError(t('cf.required'))
      return
    }
    const listFields = [form.existingProcess, form.knownProblems, form.objectives, form.interviewQuestions]
    if (listFields.some((v) => lines(v).length === 0)) {
      setError(t('cf.needLists'))
      return
    }
    const stakeholders = lines(form.stakeholders).map((line) => {
      const [name = '', role = '', concern = ''] = line.split('|').map((p) => p.trim())
      return { name, role, concern }
    })
    const ok = addCustomCase({
      ...(editingId ? { id: editingId } : {}),
      title: form.title.trim(),
      tagline: form.tagline.trim(),
      industry,
      difficulty: form.difficulty,
      estimatedTime: form.estimatedTime.trim() || '45–60 min',
      iconKey: form.iconKey,
      description: form.description.trim(),
      organization: form.organization.trim(),
      currentSituation: form.currentSituation.trim(),
      existingProcess: lines(form.existingProcess),
      knownProblems: lines(form.knownProblems),
      objectives: lines(form.objectives),
      constraints: lines(form.constraints),
      skills: lines(form.skills),
      stakeholdersContext: stakeholders,
      interviewQuestions: lines(form.interviewQuestions),
      authorId: account?.id ?? existing?.authorId,
      authorName: account?.name ?? existing?.authorName,
    })
    if (ok) {
      navigate('/cases')
    } else {
      setError(t('toast.storageError'))
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <button
          onClick={() => navigate('/cases')}
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition hover:text-slate-700 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t('cf.backToCases')}
        </button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {editingId ? t('cf.edit') : t('cf.new')}
          </h1>
          <Badge tone="violet">{t('cases.custom')}</Badge>
        </div>
        <p className="mt-1.5 text-sm text-muted">{editingId ? t('cf.editSub') : t('cf.newSub')}</p>
      </motion.div>

      {/* Basics */}
      <Card className="space-y-4 p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-muted">{t('cf.basics')}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('cf.title')}>
            <Input value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder={t('cf.titlePh')} />
          </Field>
          <Field label={t('cf.tagline')}>
            <Input value={form.tagline} onChange={(e) => set({ tagline: e.target.value })} placeholder={t('cf.taglinePh')} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('cf.industry')}>
            <Select
              value={form.industry}
              onChange={(e) => set({ industry: e.target.value })}
              options={[
                ...publicIndustries.map((ind) => ({ value: ind, label: t(INDUSTRY_KEYS[ind]) })),
                { value: CUSTOM_INDUSTRY, label: t('cf.industryCustom') },
              ]}
            />
          </Field>
          {form.industry === CUSTOM_INDUSTRY ? (
            <Field label={t('cf.industry')}>
              <Input
                value={form.customIndustry}
                onChange={(e) => set({ customIndustry: e.target.value })}
                placeholder={t('cf.industryCustomPh')}
              />
            </Field>
          ) : (
            <Field label={t('cf.difficulty')}>
              <Select
                value={form.difficulty}
                onChange={(e) => set({ difficulty: e.target.value as Difficulty })}
                options={DIFFICULTIES.map((d) => ({ value: d, label: t(DIFF_KEYS[d]) }))}
              />
            </Field>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {form.industry === CUSTOM_INDUSTRY && (
            <Field label={t('cf.difficulty')}>
              <Select
                value={form.difficulty}
                onChange={(e) => set({ difficulty: e.target.value as Difficulty })}
                options={DIFFICULTIES.map((d) => ({ value: d, label: t(DIFF_KEYS[d]) }))}
              />
            </Field>
          )}
          <Field label={t('cf.time')}>
            <Input
              value={form.estimatedTime}
              onChange={(e) => set({ estimatedTime: e.target.value })}
              placeholder={t('cf.timePh')}
            />
          </Field>
          <Field label={t('cf.icon')}>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {CASE_ICON_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  title={opt.label}
                  aria-label={opt.label}
                  aria-pressed={form.iconKey === opt.key}
                  onClick={() => set({ iconKey: opt.key })}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
                    form.iconKey === opt.key
                      ? 'border-indigo-400 bg-indigo-500/10 text-indigo-500 dark:text-indigo-300'
                      : 'border-slate-200 text-muted hover:border-indigo-300 hover:text-slate-600 dark:border-white/10 dark:hover:text-slate-300'
                  }`}
                >
                  <opt.icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </Field>
        </div>
      </Card>

      {/* Story */}
      <Card className="space-y-4 p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-muted">{t('cf.story')}</p>
        <Field label={t('cf.description')}>
          <Textarea rows={3} value={form.description} onChange={(e) => set({ description: e.target.value })} placeholder={t('cf.descriptionPh')} />
        </Field>
        <Field label={t('cf.organization')}>
          <Textarea rows={3} value={form.organization} onChange={(e) => set({ organization: e.target.value })} placeholder={t('cf.organizationPh')} />
        </Field>
        <Field label={t('cf.situation')}>
          <Textarea rows={3} value={form.currentSituation} onChange={(e) => set({ currentSituation: e.target.value })} placeholder={t('cf.situationPh')} />
        </Field>
      </Card>

      {/* Lists */}
      <Card className="space-y-4 p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-muted">{t('cf.lists')}</p>
        <p className="text-xs text-muted">{t('cf.linesHint')}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('cf.existingProcess')}>
            <Textarea rows={4} value={form.existingProcess} onChange={(e) => set({ existingProcess: e.target.value })} />
          </Field>
          <Field label={t('cf.knownProblems')}>
            <Textarea rows={4} value={form.knownProblems} onChange={(e) => set({ knownProblems: e.target.value })} />
          </Field>
          <Field label={t('cf.objectives')}>
            <Textarea rows={4} value={form.objectives} onChange={(e) => set({ objectives: e.target.value })} />
          </Field>
          <Field label={t('cf.constraints')}>
            <Textarea rows={4} value={form.constraints} onChange={(e) => set({ constraints: e.target.value })} />
          </Field>
          <Field label={t('cf.skills')}>
            <Textarea rows={4} value={form.skills} onChange={(e) => set({ skills: e.target.value })} />
          </Field>
          <Field label={t('cf.questions')}>
            <Textarea rows={4} value={form.interviewQuestions} onChange={(e) => set({ interviewQuestions: e.target.value })} />
          </Field>
        </div>
        <Field label={t('cf.stakeholders')}>
          <Textarea
            rows={4}
            value={form.stakeholders}
            onChange={(e) => set({ stakeholders: e.target.value })}
            placeholder={t('cf.stakeholdersPh')}
          />
        </Field>
      </Card>

      {error && (
        <p role="alert" className="rounded-xl bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-500 dark:text-rose-300">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3 pb-10">
        <Button variant="secondary" onClick={() => navigate('/cases')}>
          {t('common.cancel')}
        </Button>
        <Button icon={Save} onClick={save}>
          {t('cf.save')}
        </Button>
      </div>
    </div>
  )
}
