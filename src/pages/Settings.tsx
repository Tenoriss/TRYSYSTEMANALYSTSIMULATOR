import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Database,
  Download,
  FileUp,
  Monitor,
  Moon,
  Palette,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react'
import { Button, Card, SectionHeader, Segmented } from '../components/ui'
import { ConfirmDialog } from '../components/Modal'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import type { Theme } from '../types'

export default function Settings() {
  const { data, setTheme, exportData, importData, clearAll } = useApp()
  const toast = useToast()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [confirmClear, setConfirmClear] = useState(false)

  const handleExport = () => {
    if (exportData()) toast.success('Data exported', 'A JSON backup was downloaded.')
    else toast.error('Export failed', 'The backup could not be created.')
  }

  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text()
      if (!importData(text)) {
        toast.error('Invalid analysis data.', 'The file could not be imported.')
      } else {
        navigate('/dashboard')
      }
    } catch {
      toast.error('Invalid analysis data.', 'The file could not be imported.')
    }
  }

  const analysesCount = Object.keys(data.analyses).length

  return (
    <div className="space-y-6">
      <SectionHeader title="Settings" subtitle="Appearance and local data management — everything stays in your browser." />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        {/* Appearance */}
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-300">
              <Palette className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">Appearance</h2>
              <p className="text-xs text-muted">Choose how the simulator looks on this device.</p>
            </div>
          </div>
          <div className="mt-5">
            <Segmented<Theme>
              ariaLabel="Theme"
              value={data.settings.theme}
              onChange={setTheme}
              options={[
                {
                  value: 'dark',
                  label: (
                    <span className="inline-flex items-center gap-1.5">
                      <Moon className="h-3.5 w-3.5" /> Dark
                    </span>
                  ),
                },
                {
                  value: 'light',
                  label: (
                    <span className="inline-flex items-center gap-1.5">
                      <Sun className="h-3.5 w-3.5" /> Light
                    </span>
                  ),
                },
                {
                  value: 'system',
                  label: (
                    <span className="inline-flex items-center gap-1.5">
                      <Monitor className="h-3.5 w-3.5" /> System
                    </span>
                  ),
                },
              ]}
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {(['dark', 'light', 'system'] as Theme[]).map((t) => {
                const active = data.settings.theme === t
                return (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    aria-pressed={active}
                    className={`group overflow-hidden rounded-xl border-2 p-2 text-left transition ${
                      active
                        ? 'border-indigo-400/70 shadow-glow-sm'
                        : 'border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20'
                    }`}
                  >
                    <span
                      className={`block h-16 rounded-lg ${
                        t === 'light'
                          ? 'bg-gradient-to-br from-slate-50 to-slate-200'
                          : t === 'dark'
                            ? 'bg-gradient-to-br from-[#0c1322] to-[#05080f]'
                            : 'bg-gradient-to-br from-slate-100 from-50% to-[#05080f] to-50%'
                      }`}
                    >
                      <span className="m-2 block h-2 w-1/2 rounded-full bg-indigo-400/70" />
                      <span className="mx-2 block h-1.5 w-2/3 rounded-full bg-slate-400/40" />
                    </span>
                    <span className="mt-2 block text-center text-xs font-semibold capitalize text-slate-600 dark:text-slate-300">
                      {t}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </Card>

        {/* Data */}
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-500">
              <Database className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">Local Data</h2>
              <p className="text-xs text-muted">
                {analysesCount} {analysesCount === 1 ? 'analysis' : 'analyses'} · {data.profile.xp} XP ·{' '}
                {Object.keys(data.unlocked).length} achievements — all stored in LocalStorage.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4 dark:border-white/[0.07]">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                <Download className="h-4 w-4 text-indigo-500" /> Export Data
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Download a full JSON backup of every analysis, XP, achievements, and settings.
              </p>
              <Button size="sm" variant="secondary" className="mt-3" icon={FileUp} onClick={handleExport}>
                Download JSON
              </Button>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 dark:border-white/[0.07]">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                <Upload className="h-4 w-4 text-cyan-500" /> Import Data
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Restore a previously exported backup. The file is validated before anything is replaced.
              </p>
              <Button size="sm" variant="secondary" className="mt-3" icon={Upload} onClick={() => fileRef.current?.click()}>
                Import JSON
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                aria-label="Import JSON backup"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleImportFile(f)
                  e.target.value = ''
                }}
              />
            </div>
          </div>
        </Card>

        {/* Danger zone */}
        <Card className="border-rose-200/70 p-6 dark:border-rose-400/20">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">Danger Zone</h2>
              <p className="text-xs text-muted">Irreversible actions — export a backup first.</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-rose-500/[0.05] p-4 dark:bg-rose-400/[0.05]">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Clear all data</p>
              <p className="text-xs text-muted">
                Removes analyses, XP, achievements, and preferences from this browser.
              </p>
            </div>
            <Button variant="danger" size="sm" icon={Trash2} onClick={() => setConfirmClear(true)}>
              Clear All Data
            </Button>
          </div>
        </Card>

        <p className="pb-2 text-center text-[11px] text-muted">
          System Analyst Simulator v1.0 · 100% client-side, no account, no server.
        </p>
      </motion.div>

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => {
          clearAll()
          navigate('/dashboard')
        }}
        title="Clear all local data?"
        message="This will permanently delete all local analysis data. This action cannot be undone."
        confirmLabel="Yes, Delete Everything"
      />
    </div>
  )
}
