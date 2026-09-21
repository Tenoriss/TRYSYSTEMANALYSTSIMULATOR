import {
  BookOpen,
  Briefcase,
  Building2,
  Car,
  Cpu,
  Factory,
  GraduationCap,
  HeartPulse,
  Home,
  Leaf,
  ShoppingCart,
  Store,
  Truck,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react'
import type { CaseScenario, Difficulty, IconType } from '../types'
import { nowISO, uid } from '../lib/utils'

/* Custom case studies authored by admins/developers. Stored browser-wide in
 * LocalStorage (shared across accounts on this device — no backend exists).
 * Icons are stored as keys and rehydrated to Lucide components on load. */

const CUSTOM_CASES_KEY = 'sas.customCases.v1'
export const CUSTOM_CASE_ID_PREFIX = 'custom-'

export const CASE_ICON_OPTIONS: { key: string; icon: IconType; label: string }[] = [
  { key: 'briefcase', icon: Briefcase, label: 'Briefcase' },
  { key: 'store', icon: Store, label: 'Store' },
  { key: 'cart', icon: ShoppingCart, label: 'Shopping cart' },
  { key: 'graduation', icon: GraduationCap, label: 'Graduation cap' },
  { key: 'health', icon: HeartPulse, label: 'Health' },
  { key: 'restaurant', icon: UtensilsCrossed, label: 'Restaurant' },
  { key: 'truck', icon: Truck, label: 'Truck' },
  { key: 'car', icon: Car, label: 'Car' },
  { key: 'factory', icon: Factory, label: 'Factory' },
  { key: 'building', icon: Building2, label: 'Building' },
  { key: 'home', icon: Home, label: 'Home' },
  { key: 'leaf', icon: Leaf, label: 'Leaf' },
  { key: 'wallet', icon: Wallet, label: 'Wallet' },
  { key: 'cpu', icon: Cpu, label: 'CPU' },
  { key: 'book', icon: BookOpen, label: 'Book' },
]

export interface StoredCase {
  id: string
  iconKey: string
  title: string
  industry: string
  difficulty: Difficulty
  estimatedTime: string
  tagline: string
  description: string
  organization: string
  currentSituation: string
  existingProcess: string[]
  knownProblems: string[]
  objectives: string[]
  constraints: string[]
  skills: string[]
  stakeholdersContext: { name: string; role: string; concern: string }[]
  interviewQuestions: string[]
  authorId?: string
  authorName?: string
  createdAt: string
  updatedAt: string
}

function iconFor(key: string): IconType {
  return CASE_ICON_OPTIONS.find((o) => o.key === key)?.icon ?? Briefcase
}

export function hydrateCase(stored: StoredCase): CaseScenario {
  return {
    id: stored.id,
    title: stored.title,
    industry: stored.industry,
    icon: iconFor(stored.iconKey),
    difficulty: stored.difficulty,
    estimatedTime: stored.estimatedTime,
    tagline: stored.tagline,
    description: stored.description,
    organization: stored.organization,
    currentSituation: stored.currentSituation,
    existingProcess: stored.existingProcess,
    knownProblems: stored.knownProblems,
    objectives: stored.objectives,
    constraints: stored.constraints,
    skills: stored.skills,
    stakeholdersContext: stored.stakeholdersContext,
    interviewQuestions: stored.interviewQuestions,
  }
}

export function isCustomCaseId(id: string | undefined): boolean {
  return !!id && id.startsWith(CUSTOM_CASE_ID_PREFIX)
}

export function loadCustomCases(): StoredCase[] {
  try {
    const raw = localStorage.getItem(CUSTOM_CASES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (c): c is StoredCase =>
        !!c && typeof c === 'object' && typeof c.id === 'string' && typeof c.title === 'string',
    )
  } catch {
    return []
  }
}

function persist(cases: StoredCase[]): boolean {
  try {
    localStorage.setItem(CUSTOM_CASES_KEY, JSON.stringify(cases))
    return true
  } catch {
    return false
  }
}

export function getStoredCase(id: string): StoredCase | undefined {
  return loadCustomCases().find((c) => c.id === id)
}

export function upsertCustomCase(
  data: Omit<StoredCase, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
): StoredCase | null {
  const cases = loadCustomCases()
  if (data.id) {
    const existing = cases.find((c) => c.id === data.id)
    if (!existing) return null
    const updated: StoredCase = { ...existing, ...data, id: existing.id, updatedAt: nowISO() }
    const next = cases.map((c) => (c.id === existing.id ? updated : c))
    return persist(next) ? updated : null
  }
  const created: StoredCase = {
    ...data,
    id: `${CUSTOM_CASE_ID_PREFIX}${uid()}`,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  }
  return persist([...cases, created]) ? created : null
}

export function deleteCustomCase(id: string): boolean {
  return persist(loadCustomCases().filter((c) => c.id !== id))
}
