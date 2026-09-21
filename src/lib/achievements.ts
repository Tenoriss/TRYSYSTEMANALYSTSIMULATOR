import {
  Award,
  Bot,
  Compass,
  FileSearch,
  Footprints,
  GitBranch,
  Crown,
  MessageSquareText,
  Shield,
  Sparkles,
  Trophy,
} from 'lucide-react'
import type { AppData, IconType } from '../types'
import { levelForXP } from './scoring'

export interface AchievementDef {
  id: string
  title: string
  description: string
  icon: IconType
  xp: number
  target: number
  progress: (d: AppData) => number
}

const allAnalyses = (d: AppData) => Object.values(d.analyses)
const sum = (d: AppData, pick: (a: ReturnType<typeof allAnalyses>[number]) => number) =>
  allAnalyses(d).reduce((acc, a) => acc + pick(a), 0)

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Start your first investigation.',
    icon: Footprints,
    xp: 25,
    target: 1,
    progress: (d) => allAnalyses(d).length,
  },
  {
    id: 'first-investigation',
    title: 'First Investigation',
    description: 'Complete your first case.',
    icon: FileSearch,
    xp: 50,
    target: 1,
    progress: (d) => allAnalyses(d).filter((a) => a.status === 'completed').length,
  },
  {
    id: 'requirement-hunter',
    title: 'Requirement Hunter',
    description: 'Create 10 requirements.',
    icon: Compass,
    xp: 50,
    target: 10,
    progress: (d) => sum(d, (a) => a.functionalRequirements.length + a.nonFunctionalRequirements.length),
  },
  {
    id: 'stakeholder-whisperer',
    title: 'Stakeholder Whisperer',
    description: 'Analyze 10 stakeholders.',
    icon: Bot,
    xp: 50,
    target: 10,
    progress: (d) => sum(d, (a) => a.stakeholders.length),
  },
  {
    id: 'interview-pro',
    title: 'Interview Pro',
    description: 'Conduct 5 stakeholder interviews.',
    icon: MessageSquareText,
    xp: 25,
    target: 5,
    progress: (d) => sum(d, (a) => a.interviews.length),
  },
  {
    id: 'process-mapper',
    title: 'Process Mapper',
    description: 'Create 5 process flow steps.',
    icon: GitBranch,
    xp: 40,
    target: 5,
    progress: (d) => sum(d, (a) => a.processSteps.length),
  },
  {
    id: 'risk-detective',
    title: 'Risk Detective',
    description: 'Create 20 risk analyses.',
    icon: Shield,
    xp: 75,
    target: 20,
    progress: (d) => sum(d, (a) => a.risks.length),
  },
  {
    id: 'deep-diver',
    title: 'Deep Diver',
    description: 'Complete a full 5 Whys analysis.',
    icon: Sparkles,
    xp: 25,
    target: 1,
    progress: (d) =>
      allAnalyses(d).filter((a) => a.rootCauses.some((r) => r.whys.every((w) => w.trim().length > 0))).length,
  },
  {
    id: 'problem-solver',
    title: 'Problem Solver',
    description: 'Complete 5 cases.',
    icon: Trophy,
    xp: 100,
    target: 5,
    progress: (d) => allAnalyses(d).filter((a) => a.status === 'completed').length,
  },
  {
    id: 'sharp-analyst',
    title: 'Sharp Analyst',
    description: 'Score 90+ on an evaluation.',
    icon: Award,
    xp: 100,
    target: 1,
    progress: (d) => allAnalyses(d).filter((a) => (a.evaluation?.total ?? 0) >= 90).length,
  },
  {
    id: 'senior-analyst',
    title: 'Solution Architect',
    description: 'Reach Level 5.',
    icon: Crown,
    xp: 200,
    target: 1,
    progress: (d) => (levelForXP(d.profile.xp).info.level >= 5 ? 1 : 0),
  },
]

/** Returns achievement defs that are completed but not yet unlocked. */
export function evaluateAchievements(d: AppData): AchievementDef[] {
  return ACHIEVEMENTS.filter((a) => !d.unlocked[a.id] && a.progress(d) >= a.target)
}
