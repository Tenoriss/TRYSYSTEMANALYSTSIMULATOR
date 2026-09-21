import type { ElementType } from 'react'

export type Theme = 'dark' | 'light' | 'system'
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'
export type AnalysisStatus = 'not-started' | 'in-progress' | 'completed'
export type Level3 = 'Low' | 'Medium' | 'High'
export type Severity = 'Low' | 'Medium' | 'High' | 'Critical'
export type Frequency = 'Rarely' | 'Occasionally' | 'Frequently' | 'Constantly'
export type MoSCoW = 'Must Have' | 'Should Have' | 'Could Have' | "Won't Have"
export type ReqStatus = 'Proposed' | 'Approved' | 'Rejected'
export type NFRCategory =
  | 'Performance'
  | 'Security'
  | 'Usability'
  | 'Reliability'
  | 'Scalability'
  | 'Availability'
export type ProcessStepType = 'start' | 'process' | 'decision' | 'end'
export type AnalysisStepKey =
  | 'investigation'
  | 'problems'
  | 'requirements'
  | 'modeling'
  | 'solution'
  | 'evaluation'
  | 'report'

export type IconType = ElementType

/* ---------------------------------- Cases --------------------------------- */

export interface StakeholderContext {
  name: string
  role: string
  concern: string
}

export interface CaseScenario {
  id: string
  title: string
  industry: string
  icon: IconType
  difficulty: Difficulty
  estimatedTime: string
  tagline: string
  description: string
  organization: string
  currentSituation: string
  existingProcess: string[]
  stakeholdersContext: StakeholderContext[]
  knownProblems: string[]
  objectives: string[]
  constraints: string[]
  skills: string[]
  interviewQuestions: string[]
}

/* ------------------------------ Analysis data ------------------------------ */

export interface Stakeholder {
  id: string
  name: string
  role: string
  department: string
  interest: Level3
  influence: Level3
  concern: string
  createdAt: string
}

export interface Interview {
  id: string
  stakeholder: string
  question: string
  answer: string
  custom: boolean
  createdAt: string
}

export interface Problem {
  id: string
  title: string
  description: string
  rootCause: string
  impact: string
  severity: Severity
  frequency: Frequency
  evidence: string
  createdAt: string
}

export interface RootCause {
  id: string
  problem: string
  whys: string[] // always 5 entries
  conclusion: string
  createdAt: string
}

export interface FunctionalRequirement {
  id: string
  code: string
  requirement: string
  description: string
  priority: MoSCoW
  source: string
  status: ReqStatus
  createdAt: string
}

export interface NonFunctionalRequirement {
  id: string
  code: string
  requirement: string
  category: NFRCategory
  priority: MoSCoW
  description: string
  createdAt: string
}

export interface UseCase {
  id: string
  actor: string
  name: string
  description: string
  preconditions: string
  mainFlow: string
  alternativeFlow: string
  postconditions: string
  createdAt: string
}

export interface ProcessStep {
  id: string
  type: ProcessStepType
  label: string
  note: string
}

export interface AsIsToBe {
  currentProcess: string
  currentProblems: string
  currentTools: string
  bottlenecks: string
  proposedProcess: string
  newSystem: string
  improvements: string
  expectedBenefits: string
}

export interface SolutionFeature {
  id: string
  name: string
  description: string
  priority: Level3
  userRole: string
}

export interface Solution {
  name: string
  description: string
  targetUsers: string
  technology: string
  expectedBenefits: string
  risks: string
  limitations: string
}

export interface Risk {
  id: string
  risk: string
  probability: Level3
  impact: Level3
  mitigation: string
  owner: string
  createdAt: string
}

export interface EvaluationBreakdown {
  investigation: { score: number; max: number }
  problems: { score: number; max: number }
  requirements: { score: number; max: number }
  modeling: { score: number; max: number }
  solution: { score: number; max: number }
  risk: { score: number; max: number }
}

export interface Evaluation {
  total: number
  breakdown: EvaluationBreakdown
  strengths: string[]
  improvements: string[]
  computedAt: string
}

export interface CaseProgress {
  caseId: string
  status: AnalysisStatus
  startedAt: string
  updatedAt: string
  completedAt?: string
  lastStep: AnalysisStepKey
  stakeholders: Stakeholder[]
  interviews: Interview[]
  problems: Problem[]
  rootCauses: RootCause[]
  functionalRequirements: FunctionalRequirement[]
  nonFunctionalRequirements: NonFunctionalRequirement[]
  useCases: UseCase[]
  processSteps: ProcessStep[]
  asIsToBe: AsIsToBe
  solution: Solution
  features: SolutionFeature[]
  risks: Risk[]
  evaluation?: Evaluation
  reportGeneratedAt?: string
}

/* ------------------------------ App-level data ----------------------------- */

export interface Profile {
  xp: number
  streak: number
  lastActivityDate: string | null
  onboarded: boolean
  createdAt: string
}

export interface Settings {
  theme: Theme
}

export interface AppData {
  analyses: Record<string, CaseProgress>
  profile: Profile
  /** achievementId -> ISO date unlocked */
  unlocked: Record<string, string>
  settings: Settings
}

export interface ExportFile {
  app: 'system-analyst-simulator'
  version: 1
  exportedAt: string
  data: AppData
}
