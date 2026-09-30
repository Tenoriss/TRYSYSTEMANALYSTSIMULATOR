import { useMemo, useState } from 'react'
import { ArrowRight, BookOpen, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '../components/Modal'
import { Badge, Button, Card, EmptyState, Input } from '../components/ui'
import { ANALYSIS_METHODS } from '../data/analysisMethods'
import type { AnalysisMethod, MethodCategory } from '../data/analysisMethods'
import { useApp } from '../context/AppContext'
import { useI18n } from '../i18n/useI18n'
import type { TranslationKey } from '../i18n'
import type { BadgeTone } from '../components/ui'

const CATEGORY_KEYS: Record<MethodCategory, TranslationKey> = {
  investigation: 'methods.category.investigation',
  problems: 'methods.category.problems',
  requirements: 'methods.category.requirements',
  modeling: 'methods.category.modeling',
  solution: 'methods.category.solution',
  evaluation: 'methods.category.evaluation',
}

const CATEGORY_TONES: Record<MethodCategory, BadgeTone> = {
  investigation: 'cyan',
  problems: 'rose',
  requirements: 'violet',
  modeling: 'indigo',
  solution: 'amber',
  evaluation: 'emerald',
}

const CATEGORIES: (MethodCategory | 'all')[] = [
  'all',
  'investigation',
  'problems',
  'requirements',
  'modeling',
  'solution',
  'evaluation',
]

function methodContent(method: AnalysisMethod, lang: 'en' | 'id') {
  return method.copy[lang]
}

export default function Methods() {
  const { data } = useApp()
  const { t, lang } = useI18n()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<MethodCategory | 'all'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const activeAnalysis = useMemo(
    () =>
      Object.values(data.analyses)
        .filter((analysis) => analysis.status === 'in-progress')
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0],
    [data.analyses],
  )

  const filteredMethods = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(lang)
    return ANALYSIS_METHODS.filter((method) => {
      if (category !== 'all' && method.category !== category) return false
      if (!normalizedQuery) return true
      const copy = methodContent(method, lang)
      const searchableText = [
        copy.title,
        copy.summary,
        copy.whenToUse,
        copy.output,
        ...copy.steps,
        ...copy.tags,
      ]
        .join(' ')
        .toLocaleLowerCase(lang)
      return searchableText.includes(normalizedQuery)
    })
  }, [category, lang, query])

  const selectedMethod = ANALYSIS_METHODS.find((method) => method.id === selectedId) ?? null
  const selectedCopy = selectedMethod ? methodContent(selectedMethod, lang) : null

  const openMethodStep = (method: AnalysisMethod) => {
    setSelectedId(null)
    if (activeAnalysis) navigate(`/analysis/${activeAnalysis.caseId}/${method.step}`)
    else navigate('/cases')
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-indigo-200/70 bg-gradient-to-br from-white via-indigo-50/80 to-cyan-50/70 p-6 shadow-sm dark:border-indigo-400/15 dark:from-[#101a2e] dark:via-[#0c1322] dark:to-[#0b1820] sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-indigo-400/15 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" aria-hidden />
        <div className="relative max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="indigo" icon={BookOpen}>{t('methods.kicker')}</Badge>
            <span className="text-xs font-semibold text-muted">{t('methods.count', { count: ANALYSIS_METHODS.length })}</span>
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            {t('methods.title')}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
            {t('methods.subtitle')}
          </p>
          <div className="relative mt-6 max-w-xl">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('methods.searchPlaceholder')}
              aria-label={t('methods.searchAria')}
              className="h-11 border-slate-200/80 bg-white/85 pl-10 dark:border-white/10 dark:bg-white/[0.05]"
            />
          </div>
        </div>
      </section>

      <section aria-label={t('methods.phaseLabel')}>
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">{t('methods.phaseLabel')}</p>
          <p className="text-xs font-semibold text-muted" aria-live="polite">
            {t('methods.count', { count: filteredMethods.length })}
          </p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2" role="group" aria-label={t('methods.phaseLabel')}>
          {CATEGORIES.map((item) => {
            const active = category === item
            const label = item === 'all' ? t('methods.category.all') : t(CATEGORY_KEYS[item])
            return (
              <button
                key={item}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(item)}
                className={`shrink-0 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                  active
                    ? 'border-indigo-500 bg-indigo-500 text-white shadow-sm shadow-indigo-500/20'
                    : 'border-slate-200 bg-white/70 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:border-indigo-400/30 dark:hover:text-indigo-300'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </section>

      {filteredMethods.length === 0 ? (
        <EmptyState
          icon={Search}
          title={t('methods.noResultsTitle')}
          description={t('methods.noResultsDesc')}
          className="py-14"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredMethods.map((method) => {
            const copy = methodContent(method, lang)
            const Icon = method.icon
            return (
              <Card key={method.id} className="flex h-full flex-col p-5" hover>
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-cyan-400/10 text-indigo-600 dark:text-indigo-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  <Badge tone={CATEGORY_TONES[method.category]}>{t(CATEGORY_KEYS[method.category])}</Badge>
                </div>
                <h2 className="mt-4 font-display text-base font-semibold leading-snug text-slate-900 dark:text-white">
                  {copy.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{copy.summary}</p>
                <div className="mt-4 rounded-xl bg-slate-50/80 px-3.5 py-3 dark:bg-white/[0.035]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-300">
                    {t('methods.detail.when')}
                  </p>
                  <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {copy.whenToUse}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={ArrowRight}
                  className="mt-3 self-start px-1"
                  onClick={() => setSelectedId(method.id)}
                >
                  {t('methods.readGuide')}
                </Button>
              </Card>
            )
          })}
        </div>
      )}

      {selectedMethod && selectedCopy && (
        <Modal
          open
          onClose={() => setSelectedId(null)}
          title={selectedCopy.title}
          subtitle={selectedCopy.summary}
          wide
        >
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={CATEGORY_TONES[selectedMethod.category]}>{t(CATEGORY_KEYS[selectedMethod.category])}</Badge>
              <span className="text-xs text-muted">{t('methods.detail.phase')}</span>
            </div>

            <section className="rounded-2xl border border-indigo-200/70 bg-indigo-50/70 p-4 dark:border-indigo-400/15 dark:bg-indigo-400/[0.06]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">
                {t('methods.detail.when')}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{selectedCopy.whenToUse}</p>
            </section>

            <section>
              <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                {t('methods.detail.steps')}
              </h3>
              <ol className="mt-3 space-y-3">
                {selectedCopy.steps.map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-bold text-indigo-600 dark:text-indigo-300">
                      {index + 1}
                    </span>
                    <p className="pt-0.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{step}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-2xl border border-slate-200 p-4 dark:border-white/[0.07]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('methods.detail.output')}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{selectedCopy.output}</p>
            </section>

            <p className="text-xs leading-relaxed text-muted">{t('methods.detail.note')}</p>
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4 dark:border-white/[0.06]">
              <Button variant="secondary" onClick={() => setSelectedId(null)}>
                {t('common.close')}
              </Button>
              <Button icon={ArrowRight} onClick={() => openMethodStep(selectedMethod)}>
                {activeAnalysis ? t('methods.detail.openInAnalysis') : t('methods.detail.browseCases')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
