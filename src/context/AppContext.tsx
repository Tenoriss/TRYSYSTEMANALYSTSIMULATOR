import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { AchievementDef } from '../lib/achievements'
import { evaluateAchievements } from '../lib/achievements'
import { achKeys, LEVEL_TITLE_KEYS, tr } from '../i18n'
import type { Lang } from '../i18n'
import { applyStreak, levelForXP, XP } from '../lib/scoring'
import { clearAllKeys, loadPersistedData, persistData } from '../lib/storage'
import type { AppData, CaseProgress, Evaluation, ExportFile, Theme } from '../types'
import { downloadJSON, nowISO, todayKey } from '../lib/utils'
import { useToast } from './ToastContext'

const DEFAULT_DATA: AppData = {
  analyses: {},
  profile: { xp: 0, streak: 0, lastActivityDate: null, onboarded: false, createdAt: nowISO() },
  unlocked: {},
  settings: { theme: 'dark', language: 'en' },
}

function emptyAnalysis(caseId: string): CaseProgress {
  return {
    caseId,
    status: 'in-progress',
    startedAt: nowISO(),
    updatedAt: nowISO(),
    lastStep: 'investigation',
    stakeholders: [],
    interviews: [],
    problems: [],
    rootCauses: [],
    functionalRequirements: [],
    nonFunctionalRequirements: [],
    useCases: [],
    processSteps: [],
    asIsToBe: {
      currentProcess: '',
      currentProblems: '',
      currentTools: '',
      bottlenecks: '',
      proposedProcess: '',
      newSystem: '',
      improvements: '',
      expectedBenefits: '',
    },
    solution: {
      name: '',
      description: '',
      targetUsers: '',
      technology: '',
      expectedBenefits: '',
      risks: '',
      limitations: '',
    },
    features: [],
    risks: [],
  }
}

export interface AppContextValue {
  data: AppData
  lastSavedAt: number
  getAnalysis: (caseId: string) => CaseProgress | undefined
  startCase: (caseId: string) => CaseProgress
  updateAnalysis: (
    caseId: string,
    mutator: (draft: CaseProgress) => void,
    xp?: { amount: number; label: string },
  ) => void
  setLastStep: (caseId: string, step: CaseProgress['lastStep']) => void
  completeCase: (caseId: string) => void
  setEvaluation: (caseId: string, evaluation: Evaluation) => void
  deleteAnalysis: (caseId: string) => void
  markReportGenerated: (caseId: string) => void
  setTheme: (theme: Theme) => void
  setLanguage: (lang: Lang) => void
  completeOnboarding: () => void
  exportData: () => boolean
  importData: (jsonText: string) => boolean
  clearAll: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

function resolveSystemDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function AppProvider({ children }: { children: ReactNode }) {
  const toast = useToast()
  const [data, setData] = useState<AppData>(() => loadPersistedData() ?? DEFAULT_DATA)
  const [lastSavedAt, setLastSavedAt] = useState<number>(Date.now())
  const dataRef = useRef(data)
  dataRef.current = data

  /* ------------------------------- persistence ------------------------------ */
  const commit = useCallback(
    (updater: (d: AppData) => AppData, opts?: { xp?: { amount: number; label: string }; silent?: boolean }) => {
      let next = updater(dataRef.current)

      // XP grant + streak + level up
      const lang: Lang = next.settings.language === 'id' ? 'id' : 'en'
      if (opts?.xp) {
        const { amount, label } = opts.xp
        const before = next.profile
        const levelBefore = levelForXP(before.xp).info.level
        const newStreak = applyStreak(before.lastActivityDate, before.streak)
        const newXP = before.xp + amount
        next = {
          ...next,
          profile: { ...before, xp: newXP, streak: newStreak, lastActivityDate: todayKey() },
        }
        toast.xp(amount, label)
        const levelAfter = levelForXP(newXP).info
        if (levelAfter.level > levelBefore) {
          toast.push(
            'achievement',
            tr(lang, 'toast.levelUp'),
            tr(lang, 'toast.levelUpDesc', {
              level: levelAfter.level,
              title: tr(lang, LEVEL_TITLE_KEYS[levelAfter.level - 1]),
            }),
          )
        }
      }

      // Achievement scanning (loop to allow XP bonuses to chain-unlock)
      for (let i = 0; i < 3; i++) {
        const fresh: AchievementDef[] = evaluateAchievements(next)
        if (fresh.length === 0) break
        for (const a of fresh) {
          next = {
            ...next,
            unlocked: { ...next.unlocked, [a.id]: nowISO() },
            profile: { ...next.profile, xp: next.profile.xp + a.xp },
          }
          toast.achievement(tr(lang, achKeys(a.id).title), a.xp)
        }
      }

      const ok = persistData(next)
      if (!ok) toast.error(tr(lang, 'toast.storageError'), tr(lang, 'toast.storageErrorDesc'))
      setLastSavedAt(Date.now())
      setData(next)
    },
    [toast],
  )

  /* ---------------------------------- theme --------------------------------- */
  const applyThemeClass = useCallback((theme: Theme) => {
    const dark = theme === 'dark' || (theme === 'system' && resolveSystemDark())
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  }, [])

  useEffect(() => {
    applyThemeClass(data.settings.theme)
    if (data.settings.theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyThemeClass('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [data.settings.theme, applyThemeClass])

  /* ---------------------------------- actions -------------------------------- */
  const getAnalysis = useCallback((caseId: string) => dataRef.current.analyses[caseId], [])

  const startCase = useCallback(
    (caseId: string): CaseProgress => {
      const existing = dataRef.current.analyses[caseId]
      if (existing) return existing
      const fresh = emptyAnalysis(caseId)
      commit(
        (d) => ({ ...d, analyses: { ...d.analyses, [caseId]: fresh } }),
        { xp: { amount: XP.startCase, label: tr(dataRef.current.settings.language, 'xp.startCase') } },
      )
      return fresh
    },
    [commit],
  )

  const updateAnalysis = useCallback(
    (caseId: string, mutator: (draft: CaseProgress) => void, xp?: { amount: number; label: string }) => {
      const current = dataRef.current.analyses[caseId]
      if (!current) return
      const draft = structuredClone(current)
      mutator(draft)
      draft.updatedAt = nowISO()
      commit((d) => ({ ...d, analyses: { ...d.analyses, [caseId]: draft } }), { xp })
    },
    [commit],
  )

  const setLastStep = useCallback(
    (caseId: string, step: CaseProgress['lastStep']) => {
      const current = dataRef.current.analyses[caseId]
      if (!current || current.lastStep === step) return
      commit((d) => ({
        ...d,
        analyses: { ...d.analyses, [caseId]: { ...current, lastStep: step, updatedAt: nowISO() } },
      }))
    },
    [commit],
  )

  const completeCase = useCallback(
    (caseId: string) => {
      const current = dataRef.current.analyses[caseId]
      if (!current || current.status === 'completed') return
      commit(
        (d) => ({
          ...d,
          analyses: {
            ...d.analyses,
            [caseId]: { ...current, status: 'completed', completedAt: nowISO(), updatedAt: nowISO() },
          },
        }),
        { xp: { amount: XP.completeCase, label: tr(dataRef.current.settings.language, 'xp.completeCase') } },
      )
      toast.success(
        tr(dataRef.current.settings.language, 'toast.caseCompleted'),
        tr(dataRef.current.settings.language, 'toast.caseCompletedDesc'),
      )
    },
    [commit, toast],
  )

  const setEvaluation = useCallback(
    (caseId: string, evaluation: Evaluation) => {
      const current = dataRef.current.analyses[caseId]
      if (!current) return
      commit((d) => ({
        ...d,
        analyses: { ...d.analyses, [caseId]: { ...current, evaluation, updatedAt: nowISO() } },
      }))
    },
    [commit],
  )

  const deleteAnalysis = useCallback(
    (caseId: string) => {
      const lang = dataRef.current.settings.language
      commit((d) => {
        const analyses = { ...d.analyses }
        delete analyses[caseId]
        return { ...d, analyses }
      })
      toast.info(tr(lang, 'toast.analysisDeleted'), tr(lang, 'toast.analysisDeletedDesc'))
    },
    [commit, toast],
  )

  const markReportGenerated = useCallback(
    (caseId: string) => {
      const current = dataRef.current.analyses[caseId]
      if (!current || current.reportGeneratedAt) return
      commit(
        (d) => ({
          ...d,
          analyses: {
            ...d.analyses,
            [caseId]: { ...current, reportGeneratedAt: nowISO(), updatedAt: nowISO() },
          },
        }),
        { xp: { amount: XP.report, label: tr(dataRef.current.settings.language, 'xp.report') } },
      )
    },
    [commit],
  )

  const setTheme = useCallback(
    (theme: Theme) => {
      commit((d) => ({ ...d, settings: { ...d.settings, theme } }))
    },
    [commit],
  )

  const setLanguage = useCallback(
    (lang: Lang) => {
      commit((d) => ({ ...d, settings: { ...d.settings, language: lang } }))
    },
    [commit],
  )

  const completeOnboarding = useCallback(() => {
    commit((d) => ({ ...d, profile: { ...d.profile, onboarded: true } }))
  }, [commit])

  const exportData = useCallback((): boolean => {
    try {
      const payload: ExportFile = {
        app: 'system-analyst-simulator',
        version: 1,
        exportedAt: nowISO(),
        data: dataRef.current,
      }
      downloadJSON(`system-analyst-export-${todayKey()}.json`, payload)
      return true
    } catch {
      return false
    }
  }, [])

  const importData = useCallback(
    (jsonText: string): boolean => {
      try {
        const parsed = JSON.parse(jsonText) as Partial<ExportFile>
        const d = parsed?.data
        const valid =
          parsed?.app === 'system-analyst-simulator' &&
          !!d &&
          typeof d === 'object' &&
          typeof d.profile === 'object' &&
          typeof d.profile?.xp === 'number' &&
          typeof d.analyses === 'object' &&
          typeof d.settings === 'object'
        if (!valid || !d) return false
        const incomingSettings = d.settings as Partial<AppData['settings']> | undefined
        const incoming: AppData = {
          profile: { ...DEFAULT_DATA.profile, ...d.profile },
          analyses: d.analyses ?? {},
          unlocked: d.unlocked ?? {},
          settings: {
            theme:
              incomingSettings?.theme === 'light' || incomingSettings?.theme === 'system'
                ? incomingSettings.theme
                : 'dark',
            language: incomingSettings?.language === 'id' ? 'id' : 'en',
          },
        }
        const lang = incoming.settings.language
        const ok = persistData(incoming)
        if (!ok) {
          toast.error(tr(lang, 'toast.storageError'), tr(lang, 'toast.storageErrorDesc'))
          return false
        }
        setData(incoming)
        toast.success(tr(lang, 'toast.imported'), tr(lang, 'toast.importedDesc'))
        return true
      } catch {
        return false
      }
    },
    [toast],
  )

  const clearAll = useCallback(() => {
    const lang = dataRef.current.settings.language
    clearAllKeys()
    const fresh: AppData = { ...DEFAULT_DATA, profile: { ...DEFAULT_DATA.profile, onboarded: true } }
    setData(fresh)
    toast.info(tr(lang, 'toast.cleared'), tr(lang, 'toast.clearedDesc'))
  }, [toast])

  const value = useMemo<AppContextValue>(
    () => ({
      data,
      lastSavedAt,
      getAnalysis,
      startCase,
      updateAnalysis,
      setLastStep,
      completeCase,
      setEvaluation,
      deleteAnalysis,
      markReportGenerated,
      setTheme,
      setLanguage,
      completeOnboarding,
      exportData,
      importData,
      clearAll,
    }),
    [
      data,
      lastSavedAt,
      getAnalysis,
      startCase,
      updateAnalysis,
      setLastStep,
      completeCase,
      setEvaluation,
      deleteAnalysis,
      markReportGenerated,
      setTheme,
      setLanguage,
      completeOnboarding,
      exportData,
      importData,
      clearAll,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
