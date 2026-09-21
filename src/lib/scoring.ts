import type { TranslationKey } from '../i18n'
import { tr } from '../i18n'
import type {
  CaseProgress,
  Evaluation,
  Frequency,
  Level3,
  Problem,
  Risk,
  Severity,
} from '../types'
import { nowISO, todayKey, yesterdayKey } from './utils'

/* --------------------------------- XP & Levels ------------------------------ */

export const XP = {
  startCase: 10,
  stakeholder: 10,
  interview: 10,
  problem: 15,
  rootCause: 15,
  requirement: 10,
  useCase: 20,
  processStep: 10,
  feature: 10,
  risk: 10,
  completeCase: 100,
  report: 50,
} as const

export interface LevelInfo {
  level: number
  title: string
  minXP: number
}

export const LEVELS: LevelInfo[] = [
  { level: 1, title: 'Junior Analyst', minXP: 0 },
  { level: 2, title: 'Associate Analyst', minXP: 150 },
  { level: 3, title: 'System Analyst', minXP: 400 },
  { level: 4, title: 'Senior Analyst', minXP: 800 },
  { level: 5, title: 'Solution Architect', minXP: 1500 },
]

export function levelForXP(xp: number): {
  info: LevelInfo
  next: LevelInfo | null
  progress: number
  intoLevel: number
  needed: number
} {
  let info = LEVELS[0]
  for (const l of LEVELS) if (xp >= l.minXP) info = l
  const idx = LEVELS.indexOf(info)
  const next = idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null
  const intoLevel = xp - info.minXP
  const needed = next ? next.minXP - info.minXP : 0
  const progress = next ? Math.round((intoLevel / needed) * 100) : 100
  return { info, next, progress, intoLevel, needed }
}

/* ----------------------------------- Streak --------------------------------- */

export function applyStreak(lastActivityDate: string | null, streak: number): number {
  const today = todayKey()
  if (lastActivityDate === today) return streak
  if (lastActivityDate === yesterdayKey()) return streak + 1
  return 1
}

/* ------------------------------ Priority helpers ---------------------------- */

const SEVERITY_SCORE: Record<Severity, number> = { Low: 1, Medium: 2, High: 3, Critical: 4 }
const FREQUENCY_SCORE: Record<Frequency, number> = { Rarely: 1, Occasionally: 2, Frequently: 3, Constantly: 4 }
const LEVEL3_SCORE: Record<Level3, number> = { Low: 1, Medium: 2, High: 3 }

export type PriorityLabel = 'Low' | 'Medium' | 'High' | 'Critical'

export function problemPriority(p: Problem): { score: number; label: PriorityLabel } {
  const score = SEVERITY_SCORE[p.severity] * FREQUENCY_SCORE[p.frequency]
  const label: PriorityLabel = score >= 12 ? 'Critical' : score >= 8 ? 'High' : score >= 4 ? 'Medium' : 'Low'
  return { score, label }
}

export function riskScore(r: Risk): { score: number; label: 'Low' | 'Medium' | 'High' } {
  const score = LEVEL3_SCORE[r.probability] * LEVEL3_SCORE[r.impact]
  const label = score >= 6 ? 'High' : score >= 3 ? 'Medium' : 'Low'
  return { score, label }
}

/* ------------------------------ Phase progress ------------------------------ */

export interface PhaseProgress {
  investigation: number
  problems: number
  requirements: number
  modeling: number
  solution: number
  evaluation: number
}

export function computePhaseProgress(a: CaseProgress): PhaseProgress {
  const investigation =
    (a.stakeholders.length > 0 ? 40 : 0) +
    (a.stakeholders.length >= 3 ? 10 : 0) +
    (a.interviews.length > 0 ? 35 : 0) +
    (a.interviews.length >= 3 ? 15 : 0)

  const problems =
    (a.problems.length > 0 ? 40 : 0) +
    (a.problems.length >= 3 ? 15 : 0) +
    (a.problems.some((p) => p.rootCause.trim()) ? 20 : 0) +
    (a.rootCauses.length > 0 || a.problems.filter((p) => p.rootCause.trim()).length >= 3 ? 25 : 0)

  const requirements =
    (a.functionalRequirements.length > 0 ? 35 : 0) +
    (a.functionalRequirements.length >= 3 ? 20 : 0) +
    (a.nonFunctionalRequirements.length > 0 ? 30 : 0) +
    (a.nonFunctionalRequirements.length >= 2 ? 15 : 0)

  const modeling =
    (a.useCases.length > 0 ? 30 : 0) +
    (a.useCases.length >= 2 ? 15 : 0) +
    (a.processSteps.length > 0 ? 25 : 0) +
    (a.processSteps.length >= 4 ? 15 : 0) +
    (a.asIsToBe.currentProcess.trim() && a.asIsToBe.proposedProcess.trim() ? 15 : 0)

  const solution =
    (a.solution.name.trim() ? 25 : 0) +
    (a.solution.description.trim() ? 20 : 0) +
    (a.features.length > 0 ? 25 : 0) +
    (a.features.length >= 3 ? 15 : 0) +
    (a.solution.technology.trim() || a.solution.expectedBenefits.trim() ? 15 : 0)

  return {
    investigation: Math.min(100, investigation),
    problems: Math.min(100, problems),
    requirements: Math.min(100, requirements),
    modeling: Math.min(100, modeling),
    solution: Math.min(100, solution),
    evaluation: a.evaluation ? (a.status === 'completed' ? 100 : 60) : 0,
  }
}

export function computeOverallProgress(a: CaseProgress): number {
  const p = computePhaseProgress(a)
  const total =
    p.investigation * 0.2 + p.problems * 0.2 + p.requirements * 0.2 + p.modeling * 0.15 + p.solution * 0.15 + p.evaluation * 0.1
  return Math.round(total)
}

/* --------------------------------- Evaluation ------------------------------- */

export interface EvaluationGate {
  ok: boolean
  checks: { key: TranslationKey; done: boolean }[]
}

export function evaluationGate(a: CaseProgress): EvaluationGate {
  const checks: { key: TranslationKey; done: boolean }[] = [
    { key: 'ev.gate1', done: a.stakeholders.length >= 1 },
    { key: 'ev.gate2', done: a.problems.length >= 1 },
    { key: 'ev.gate3', done: a.functionalRequirements.length >= 1 },
    { key: 'ev.gate4', done: a.solution.name.trim().length > 0 },
  ]
  return { ok: checks.every((c) => c.done), checks }
}

export function computeEvaluation(
  a: CaseProgress,
  fb: (key: TranslationKey) => string = (k) => tr('en', k),
): Evaluation {
  /* Investigation (20): stakeholders 10 + interviews 10 */
  const sh = a.stakeholders.length
  const iv = a.interviews.length
  const shScore = sh === 0 ? 0 : sh === 1 ? 4 : sh === 2 ? 7 : 10
  const ivScore = iv === 0 ? 0 : iv === 1 ? 4 : iv === 2 ? 7 : 10
  const investigation = shScore + ivScore

  /* Problems (20): count 10 + root cause 6 + evidence/impact 4 */
  const pb = a.problems.length
  const pbCount = pb === 0 ? 0 : pb === 1 ? 5 : pb === 2 ? 8 : 10
  const withRC = a.problems.filter((p) => p.rootCause.trim()).length
  const rcRatio = pb === 0 ? 0 : withRC / pb
  const whysBonus = a.rootCauses.some((r) => r.whys.every((w) => w.trim()))
  let rcScore = rcRatio >= 0.8 ? 5 : rcRatio >= 0.5 ? 3 : rcRatio > 0 ? 2 : 0
  if (whysBonus) rcScore += 1
  const withEvidence = a.problems.filter((p) => p.evidence.trim() && p.impact.trim()).length
  const evRatio = pb === 0 ? 0 : withEvidence / pb
  const evScore = evRatio >= 0.8 ? 4 : evRatio > 0 ? 2 : 0
  const problems = pbCount + rcScore + evScore

  /* Requirements (20): functional 10 + non-functional 8 + review status 2 */
  const fr = a.functionalRequirements.length
  const nfr = a.nonFunctionalRequirements.length
  const frScore = fr === 0 ? 0 : fr <= 2 ? 4 : fr <= 4 ? 7 : 10
  const nfrScore = nfr === 0 ? 0 : nfr === 1 ? 4 : nfr === 2 ? 7 : 8
  const reviewed = a.functionalRequirements.filter((r) => r.status !== 'Proposed').length
  const reqStatusScore = reviewed >= 2 ? 2 : reviewed === 1 ? 1 : 0
  const requirements = frScore + nfrScore + reqStatusScore

  /* Modeling (15): use cases 8 + process flow 7 */
  const uc = a.useCases.length
  let ucScore = uc === 0 ? 0 : uc === 1 ? 3 : uc === 2 ? 5 : 7
  if (uc > 0 && a.useCases.some((u) => u.mainFlow.trim())) ucScore += 1
  const steps = a.processSteps.length
  const hasStartEnd = a.processSteps.some((s) => s.type === 'start') && a.processSteps.some((s) => s.type === 'end')
  const flowScore = steps === 0 ? 0 : steps >= 5 && hasStartEnd ? 7 : steps >= 4 ? 5 : steps >= 2 ? 3 : 1
  const modeling = ucScore + flowScore

  /* Solution (15) */
  const s = a.solution
  const solution =
    (s.name.trim() ? 2 : 0) +
    (s.description.trim() ? 2 : 0) +
    (a.features.length === 0 ? 0 : a.features.length <= 2 ? 2 : 4) +
    (s.technology.trim() ? 2 : 0) +
    (s.expectedBenefits.trim() ? 2 : 0) +
    (a.asIsToBe.currentProcess.trim() ? 1 : 0) +
    (a.asIsToBe.proposedProcess.trim() ? 1 : 0) +
    (a.asIsToBe.expectedBenefits.trim() ? 1 : 0)

  /* Risk (10) */
  const rk = a.risks.length
  const rkCount = rk === 0 ? 0 : rk === 1 ? 3 : rk === 2 ? 6 : 8
  const withMitigation = a.risks.filter((r) => r.mitigation.trim()).length
  const mitScore = rk > 0 && withMitigation === rk ? 2 : withMitigation > 0 ? 1 : 0
  const risk = rkCount + mitScore

  const breakdown: Evaluation['breakdown'] = {
    investigation: { score: investigation, max: 20 },
    problems: { score: problems, max: 20 },
    requirements: { score: requirements, max: 20 },
    modeling: { score: modeling, max: 15 },
    solution: { score: solution, max: 15 },
    risk: { score: risk, max: 10 },
  }
  const total = investigation + problems + requirements + modeling + solution + risk

  /* Feedback */
  const strengths: string[] = []
  const improvements: string[] = []

  if (sh >= 3) strengths.push(fb('fb.shStakeholders'))
  else improvements.push(fb('fb.impStakeholders'))

  if (iv >= 2) strengths.push(fb('fb.shInterviews'))
  else improvements.push(fb('fb.impInterviews'))

  if (fr >= 5) strengths.push(fb('fb.shFR'))
  else if (fr < 3) improvements.push(fb('fb.impFR'))

  if (nfr >= 3) strengths.push(fb('fb.shNFR'))
  else improvements.push(fb('fb.impNFR'))

  if (pb > 0 && withRC / pb >= 0.8) strengths.push(fb('fb.shRC'))
  else if (pb > withRC) improvements.push(fb('fb.impRC'))

  if (pb > 0 && withEvidence / pb < 0.5) improvements.push(fb('fb.impEvidence'))

  if (uc >= 2 && a.useCases.some((u) => u.mainFlow.trim())) strengths.push(fb('fb.shUC'))
  else improvements.push(fb('fb.impUC'))

  if (steps >= 5 && hasStartEnd) strengths.push(fb('fb.shFlow'))
  else improvements.push(fb('fb.impFlow'))

  if (!a.asIsToBe.currentProcess.trim()) improvements.push(fb('fb.impAsIs'))

  if (a.features.length >= 3) strengths.push(fb('fb.shFeatures'))
  else improvements.push(fb('fb.impFeatures'))

  if (rk > 0 && withMitigation === rk) strengths.push(fb('fb.shRisks'))
  else if (rk === 0) improvements.push(fb('fb.impRisks'))

  if (strengths.length === 0) strengths.push(fb('fb.shFallback'))
  if (improvements.length === 0) improvements.push(fb('fb.impFallback'))

  return { total, breakdown, strengths: strengths.slice(0, 5), improvements: improvements.slice(0, 6), computedAt: nowISO() }
}

export function scoreGrade(total: number): { label: string; tone: 'success' | 'info' | 'warning' | 'danger' } {
  if (total >= 90) return { label: 'Exceptional', tone: 'success' }
  if (total >= 75) return { label: 'Strong Analysis', tone: 'success' }
  if (total >= 60) return { label: 'Solid Foundation', tone: 'info' }
  if (total >= 40) return { label: 'Developing', tone: 'warning' }
  return { label: 'Needs Work', tone: 'danger' }
}
