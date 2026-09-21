import type { AppData } from '../types'

export const STORAGE_KEYS = {
  analyses: 'sas.analyses',
  profile: 'sas.profile',
  unlocked: 'sas.achievements',
  settings: 'sas.settings',
} as const

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

/** Returns true when the write succeeded. */
export function writeJSON(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

export function clearAllKeys(): void {
  Object.values(STORAGE_KEYS).forEach(removeKey)
}

export function loadPersistedData(): AppData | null {
  try {
    const rawProfile = localStorage.getItem(STORAGE_KEYS.profile)
    if (!rawProfile) return null
    const profile = JSON.parse(rawProfile) as AppData['profile']
    const storedSettings = readJSON<Partial<AppData['settings']>>(STORAGE_KEYS.settings, {})
    return {
      profile,
      analyses: readJSON(STORAGE_KEYS.analyses, {}),
      unlocked: readJSON(STORAGE_KEYS.unlocked, {}),
      settings: {
        theme: storedSettings.theme ?? 'dark',
        language: storedSettings.language === 'id' ? 'id' : 'en',
      },
    }
  } catch {
    return null
  }
}

export function persistData(data: AppData): boolean {
  const ok =
    writeJSON(STORAGE_KEYS.profile, data.profile) &&
    writeJSON(STORAGE_KEYS.analyses, data.analyses) &&
    writeJSON(STORAGE_KEYS.unlocked, data.unlocked) &&
    writeJSON(STORAGE_KEYS.settings, data.settings)
  return ok
}
