import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, FileText, PlayCircle, Radar, Search, Trash2 } from 'lucide-react'
import { Badge, Button, Card, EmptyState, ProgressBar, SectionHeader, Segmented } from '../components/ui'
import { ConfirmDialog } from '../components/Modal'
import { useApp } from '../context/AppContext'
import { getCase } from '../data/cases'
import { computeOverallProgress } from '../lib/scoring'
import { formatDate, relativeTime } from '../lib/utils'
import { industryText } from '../i18n'
import { localizeCase, useI18n } from '../i18n/useI18n'

type Filter = 'all' | 'in-progress' | 'completed'

export default function MyAnalyses() {
  const { data, deleteAnalysis } = useApp()
  const { t, lang } = useI18n()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('all')
  const [deleting, setDeleting] = useState<string | null>(null)

  const analyses = Object.values(data.analyses)
    .filter((a) => filter === 'all' || a.status === filter)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  const deletingCase = deleting ? localizeCase(getCase(deleting), lang) : undefined

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t('ma.title')}
        subtitle={t('ma.subtitle')}
        action={
          <Segmented<Filter>
            ariaLabel={t('ma.filterAria')}
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: t('ma.all', { count: Object.keys(data.analyses).length }) },
              { value: 'in-progress', label: t('ma.inProgress') },
              { value: 'completed', label: t('ma.completed') },
            ]}
          />
        }
      />

      {Object.keys(data.analyses).length === 0 ? (
        <EmptyState
          icon={Radar}
          title={t('ma.emptyTitle')}
          description={t('ma.emptyDesc')}
          action={
            <Link to="/cases">
              <Button icon={Search}>{t('ma.browse')}</Button>
            </Link>
          }
        />
      ) : analyses.length === 0 ? (
        <EmptyState icon={Search} title={t('ma.emptyFilterTitle')} description={t('ma.emptyFilterDesc')} />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-base min-w-[820px]">
              <thead>
                <tr>
                  <th>{t('tbl.case')}</th>
                  <th className="w-28">{t('tbl.industry')}</th>
                  <th className="w-44">{t('tbl.progress')}</th>
                  <th className="w-24">{t('tbl.score')}</th>
                  <th className="w-32">{t('tbl.status')}</th>
                  <th className="w-36">{t('tbl.lastUpdated')}</th>
                  <th className="w-40 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {analyses.map((a, i) => {
                  const c = localizeCase(getCase(a.caseId), lang)
                  if (!c) return null
                  const pct = computeOverallProgress(a)
                  return (
                    <motion.tr
                      key={a.caseId}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-cyan-400/10 text-indigo-500 dark:text-indigo-300">
                            <c.icon className="h-4.5 w-4.5" />
                          </span>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100">{c.title}</p>
                            <p className="text-[11px] text-muted">{t('ma.started', { date: formatDate(a.startedAt, lang) })}</p>
                          </div>
                        </div>
                      </td>
                      <td>{industryText(c.industry, lang)}</td>
                      <td>
                        <ProgressBar value={pct} showLabel />
                      </td>
                      <td className="font-bold">
                        {a.evaluation ? (
                          <span className="text-indigo-500 dark:text-indigo-300">{a.evaluation.total}</span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">—</span>
                        )}
                      </td>
                      <td>
                        <Badge tone={a.status === 'completed' ? 'emerald' : 'cyan'}>
                          {t(a.status === 'completed' ? 'status.completed' : 'status.inProgress')}
                        </Badge>
                      </td>
                      <td className="text-xs">{relativeTime(a.updatedAt, lang)}</td>
                      <td>
                        <div className="flex justify-end gap-1">
                          {a.status === 'completed' ? (
                            <button
                              onClick={() => navigate(`/analysis/${a.caseId}/report`)}
                              aria-label={`${t('ma.viewReport')} — ${c.title}`}
                              title={t('ma.viewReport')}
                              className="icon-btn h-8 w-8"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => navigate(`/analysis/${a.caseId}/${a.lastStep}`)}
                              aria-label={`${t('common.continue')} ${c.title}`}
                              title={t('common.continue')}
                              className="icon-btn h-8 w-8 text-indigo-500 hover:!bg-indigo-500/10"
                            >
                              <PlayCircle className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/analysis/${a.caseId}/report`)}
                            aria-label={`${t('ma.report')} — ${c.title}`}
                            title={t('ma.report')}
                            className="icon-btn h-8 w-8"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleting(a.caseId)}
                            aria-label={`${t('common.delete')} ${c.title}`}
                            title={t('common.delete')}
                            className="icon-btn h-8 w-8 hover:!bg-rose-500/10 hover:!text-rose-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteAnalysis(deleting)}
        title={t('ma.deleteTitle')}
        message={t('ma.deleteMessage', { case: deletingCase?.title ?? '—' })}
        confirmLabel={t('ma.deleteConfirm')}
      />
    </div>
  )
}
