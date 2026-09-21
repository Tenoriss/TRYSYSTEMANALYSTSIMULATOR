import { useCallback, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { CASES_ID } from '../data/cases.id'
import type { CaseScenario } from '../types'
import { tr } from './index'
import type { Lang, TranslationKey, Vars } from './index'

export type TFn = (key: TranslationKey, vars?: Vars) => string

export function useI18n(): { t: TFn; lang: Lang } {
  const { data } = useApp()
  const lang: Lang = data.settings.language === 'id' ? 'id' : 'en'
  const t = useCallback<TFn>((key, vars) => tr(lang, key, vars), [lang])
  return useMemo(() => ({ t, lang }), [t, lang])
}

/** Returns the case scenario with text content in the active language. */
export function useCaseText<T extends CaseScenario | undefined>(cs: T): T {
  const { lang } = useI18n()
  return useMemo(() => {
    if (!cs || lang === 'en') return cs
    const override = CASES_ID[cs.id]
    return (override ? { ...cs, ...override } : cs) as T
  }, [cs, lang])
}

/** Non-hook variant for already-known language. */
export function localizeCase<T extends CaseScenario | undefined>(cs: T, lang: Lang): T {
  if (!cs || lang === 'en') return cs
  const override = CASES_ID[cs.id]
  return (override ? { ...cs, ...override } : cs) as T
}
