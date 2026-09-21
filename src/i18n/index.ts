import { en } from './en'
import type { TranslationKey } from './en'
import { idDict } from './id'
import type { AccountRole, Difficulty, Frequency, MoSCoW, NFRCategory, ReqStatus, Severity, Level3 } from '../types'

export type Lang = 'en' | 'id'
export type { TranslationKey }
export type Vars = Record<string, string | number>

export const LANGUAGES: { value: Lang; labelKey: TranslationKey }[] = [
  { value: 'en', labelKey: 'lang.en' },
  { value: 'id', labelKey: 'lang.id' },
]

const DICTS: Record<Lang, Record<string, string>> = {
  en: en as unknown as Record<string, string>,
  id: idDict as Record<string, string>,
}

/** Pure translator usable outside React components. */
export function tr(lang: Lang, key: TranslationKey, vars?: Vars): string {
  let s = DICTS[lang][key] ?? DICTS.en[key] ?? (key as string)
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.split(`{${k}}`).join(String(v))
    }
  }
  return s
}

/* ------------------------- enum → translation-key maps --------------------- */

export const TRI_KEYS: Record<Level3, TranslationKey> = {
  Low: 'tri.Low',
  Medium: 'tri.Medium',
  High: 'tri.High',
}

export const SEV_KEYS: Record<Severity, TranslationKey> = {
  Low: 'sev.Low',
  Medium: 'sev.Medium',
  High: 'sev.High',
  Critical: 'sev.Critical',
}

export const FREQ_KEYS: Record<Frequency, TranslationKey> = {
  Rarely: 'freq.Rarely',
  Occasionally: 'freq.Occasionally',
  Frequently: 'freq.Frequently',
  Constantly: 'freq.Constantly',
}

export const MOSCOW_KEYS: Record<MoSCoW, TranslationKey> = {
  'Must Have': 'moscow.must',
  'Should Have': 'moscow.should',
  'Could Have': 'moscow.could',
  "Won't Have": 'moscow.wont',
}

export const REQSTATUS_KEYS: Record<ReqStatus, TranslationKey> = {
  Proposed: 'reqStatus.proposed',
  Approved: 'reqStatus.approved',
  Rejected: 'reqStatus.rejected',
}

export const NFRCAT_KEYS: Record<NFRCategory, TranslationKey> = {
  Performance: 'nfrcat.Performance',
  Security: 'nfrcat.Security',
  Usability: 'nfrcat.Usability',
  Reliability: 'nfrcat.Reliability',
  Scalability: 'nfrcat.Scalability',
  Availability: 'nfrcat.Availability',
}

export const DIFF_KEYS: Record<Difficulty, TranslationKey> = {
  Beginner: 'diff.Beginner',
  Intermediate: 'diff.Intermediate',
  Advanced: 'diff.Advanced',
}

export const INDUSTRY_KEYS: Record<string, TranslationKey> = {
  Retail: 'industry.Retail',
  Education: 'industry.Education',
  Healthcare: 'industry.Healthcare',
  Restaurant: 'industry.Restaurant',
  Logistics: 'industry.Logistics',
  Finance: 'industry.Finance',
}

export const LEVEL_TITLE_KEYS: TranslationKey[] = ['lvl.1', 'lvl.2', 'lvl.3', 'lvl.4', 'lvl.5']

export const GRADE_KEYS: Record<string, TranslationKey> = {
  Exceptional: 'grade.Exceptional',
  'Strong Analysis': 'grade.Strong',
  'Solid Foundation': 'grade.Solid',
  Developing: 'grade.Developing',
  'Needs Work': 'grade.NeedsWork',
}

export const PRIORITY_LABEL_KEYS: Record<string, TranslationKey> = {
  Low: 'tri.Low',
  Medium: 'tri.Medium',
  High: 'tri.High',
  Critical: 'sev.Critical',
}

/** Achievement id → dictionary keys (single cast point for dynamic keys). */
export function achKeys(achievementId: string): { title: TranslationKey; desc: TranslationKey } {
  return {
    title: `ach.${achievementId}.title` as TranslationKey,
    desc: `ach.${achievementId}.desc` as TranslationKey,
  }
}

export const ROLE_KEYS: Record<AccountRole, TranslationKey> = {
  mahasiswa: 'role.mahasiswa',
  pelajar: 'role.pelajar',
  guru: 'role.guru',
  dosen: 'role.dosen',
  undisclosed: 'role.undisclosed',
  other: 'role.other',
}

const ACCOUNT_ROLES: AccountRole[] = ['mahasiswa', 'pelajar', 'guru', 'dosen', 'undisclosed', 'other']

/** Role options for the signup form. */
export function roleOptions(): AccountRole[] {
  return ACCOUNT_ROLES
}

/** Industry text: translated for the built-in six, raw passthrough for custom ones. */
export function industryText(industry: string, lang: Lang): string {
  const key = INDUSTRY_KEYS[industry]
  return key ? tr(lang, key) : industry
}
