import { ArrowUpRight, Code2, Github } from 'lucide-react'
import { useI18n } from '../i18n/useI18n'
import { Card } from './ui'

const DEVELOPER_URL = 'https://github.com/Tenoriss'
const REPOSITORY_URL = 'https://github.com/Tenoriss/TRYSYSTEMANALYSTSIMULATOR'

/** Public project-maintainer card with direct links to the profile and source repository. */
export function DeveloperCard() {
  const { t } = useI18n()

  return (
    <Card className="relative overflow-hidden p-5 sm:p-6">
      <div
        className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl"
        aria-hidden
      />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-cyan-400/10 text-indigo-600 dark:text-indigo-300">
            <Code2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-500 dark:text-cyan-300">
              {t('dev.card.kicker')}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                {t('dev.card.name')}
              </h2>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                {t('dev.card.role')}
              </span>
            </div>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted sm:text-sm">
              {t('dev.card.description')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:shrink-0">
          <a className="btn btn-secondary btn-sm" href={DEVELOPER_URL} target="_blank" rel="noopener noreferrer">
            <Github className="h-4 w-4" aria-hidden="true" />
            {t('dev.card.profile')}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          <a className="btn btn-secondary btn-sm" href={REPOSITORY_URL} target="_blank" rel="noopener noreferrer">
            <Code2 className="h-4 w-4" aria-hidden="true" />
            {t('dev.card.source')}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </Card>
  )
}
