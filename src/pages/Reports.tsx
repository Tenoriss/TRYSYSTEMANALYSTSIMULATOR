import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, FileText, PlusCircle, Printer } from 'lucide-react'
import { Badge, Button, Card, EmptyState } from '../components/ui'
import { useApp } from '../context/AppContext'
import { getCase } from '../data/cases'
import { formatDate } from '../lib/utils'

export default function Reports() {
  const { data } = useApp()
  const navigate = useNavigate()

  const analyses = Object.values(data.analyses).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  const generated = analyses.filter((a) => a.reportGeneratedAt)

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500 dark:text-cyan-300">Deliverables</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Reports
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted">
          Professional analysis reports compiled from your case work. Open one to review, print, or save as PDF.
        </p>
      </div>

      {analyses.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No reports yet."
          description="Reports are built from your investigations — start a case to create your first one."
          action={
            <Link to="/cases">
              <Button icon={PlusCircle}>Start a Case</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {analyses.map((a, i) => {
            const c = getCase(a.caseId)
            if (!c) return null
            return (
              <motion.div key={a.caseId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card hover className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-cyan-400/10 text-indigo-500 dark:text-indigo-300">
                        <FileText className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                          {c.title}
                        </h3>
                        <p className="text-xs text-muted">{c.industry} · System Analysis Report</p>
                      </div>
                    </div>
                    {a.evaluation && <Badge tone="indigo">Score {a.evaluation.total}</Badge>}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-muted">
                    <Clock className="h-3 w-3" />
                    {a.reportGeneratedAt
                      ? `Generated ${formatDate(a.reportGeneratedAt)}`
                      : 'Not generated yet — open to generate'}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" onClick={() => navigate(`/analysis/${a.caseId}/report`)}>
                      Open Report
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={Printer}
                      onClick={() => {
                        navigate(`/analysis/${a.caseId}/report`)
                        setTimeout(() => window.print(), 600)
                      }}
                    >
                      Print
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {generated.length > 0 && (
        <p className="text-center text-xs text-muted">
          {generated.length} report{generated.length > 1 ? 's' : ''} generated · use Print → “Save as PDF” to share
          with your team.
        </p>
      )}
    </div>
  )
}
