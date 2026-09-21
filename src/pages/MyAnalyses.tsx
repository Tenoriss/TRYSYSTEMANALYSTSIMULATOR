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

type Filter = 'all' | 'in-progress' | 'completed'

export default function MyAnalyses() {
  const { data, deleteAnalysis } = useApp()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('all')
  const [deleting, setDeleting] = useState<string | null>(null)

  const analyses = Object.values(data.analyses)
    .filter((a) => filter === 'all' || a.status === filter)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  const deletingCase = deleting ? getCase(deleting) : undefined

  return (
    <div className="space-y-6">
      <SectionHeader
        title="My Analyses"
        subtitle="Every investigation you have started — continue, review, or clean up."
        action={
          <Segmented<Filter>
            ariaLabel="Filter analyses"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: `All (${Object.keys(data.analyses).length})` },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
            ]}
          />
        }
      />

      {Object.keys(data.analyses).length === 0 ? (
        <EmptyState
          icon={Radar}
          title="No analyses yet."
          description="Pick a case from the library and your investigation workspace will appear here."
          action={
            <Link to="/cases">
              <Button icon={Search}>Browse Case Library</Button>
            </Link>
          }
        />
      ) : analyses.length === 0 ? (
        <EmptyState icon={Search} title="Nothing in this filter." description="Try a different status filter." />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-base min-w-[820px]">
              <thead>
                <tr>
                  <th>Case</th>
                  <th className="w-28">Industry</th>
                  <th className="w-44">Progress</th>
                  <th className="w-24">Score</th>
                  <th className="w-32">Status</th>
                  <th className="w-36">Last updated</th>
                  <th className="w-40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {analyses.map((a, i) => {
                  const c = getCase(a.caseId)
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
                            <p className="text-[11px] text-muted">Started {formatDate(a.startedAt)}</p>
                          </div>
                        </div>
                      </td>
                      <td>{c.industry}</td>
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
                          {a.status === 'completed' ? 'Completed' : 'In Progress'}
                        </Badge>
                      </td>
                      <td className="text-xs">{relativeTime(a.updatedAt)}</td>
                      <td>
                        <div className="flex justify-end gap-1">
                          {a.status === 'completed' ? (
                            <button
                              onClick={() => navigate(`/analysis/${a.caseId}/report`)}
                              aria-label={`View report for ${c.title}`}
                              title="View report"
                              className="icon-btn h-8 w-8"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => navigate(`/analysis/${a.caseId}/${a.lastStep}`)}
                              aria-label={`Continue ${c.title}`}
                              title="Continue"
                              className="icon-btn h-8 w-8 text-indigo-500 hover:!bg-indigo-500/10"
                            >
                              <PlayCircle className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/analysis/${a.caseId}/report`)}
                            aria-label={`Open report for ${c.title}`}
                            title="Report"
                            className="icon-btn h-8 w-8"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleting(a.caseId)}
                            aria-label={`Delete analysis of ${c.title}`}
                            title="Delete"
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
        title="Delete this analysis?"
        message={`This will permanently delete your entire analysis for “${deletingCase?.title ?? 'this case'}” — stakeholders, problems, requirements, models, and evaluation. This action cannot be undone.`}
        confirmLabel="Delete Analysis"
      />
    </div>
  )
}
