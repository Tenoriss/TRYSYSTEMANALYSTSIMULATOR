import type { AppData } from '../types'

export const STORAGE_KEYS = {
  analyses: 'sas.analyses',
  profile: 'sas.profile',
  unlocked: 'sas.achievements',
  settings: 'sas.settings',
  feedback: 'sas.feedback',
} as const

/** Per-account key namespace (no backend — accounts live in this browser). */
export function keyFor(base: string, accountId?: string | null): string {
  return accountId ? `${base}.u.${accountId}` : base
}

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

export function clearAllKeys(accountId?: string | null): void {
  Object.values(STORAGE_KEYS).forEach((base) => removeKey(keyFor(base, accountId)))
}

/**
 * Pre-authentication data used four unsuffixed keys. When a user signs up or
 * logs in for the first time, move that legacy progress into their account so
 * nothing is lost. Only the first account to touch it gets it.
 */
export function migrateLegacyDataTo(accountId: string): void {
  try {
    let moved = false
    for (const base of Object.values(STORAGE_KEYS)) {
      const namespaced = keyFor(base, accountId)
      if (localStorage.getItem(namespaced) == null) {
        const legacy = localStorage.getItem(base)
        if (legacy != null) {
          localStorage.setItem(namespaced, legacy)
          moved = true
        }
      }
    }
    if (moved) Object.values(STORAGE_KEYS).forEach(removeKey)
  } catch {
    /* storage unavailable */
  }
}

export function loadPersistedData(accountId?: string | null): AppData | null {
  try {
    const rawProfile = localStorage.getItem(keyFor(STORAGE_KEYS.profile, accountId))
    if (!rawProfile) return null
    const profile = JSON.parse(rawProfile) as AppData['profile']
    const storedSettings = readJSON<Partial<AppData['settings']>>(keyFor(STORAGE_KEYS.settings, accountId), {})
    return {
      profile,
      analyses: readJSON(keyFor(STORAGE_KEYS.analyses, accountId), {}),
      unlocked: readJSON(keyFor(STORAGE_KEYS.unlocked, accountId), {}),
      settings: {
        theme: storedSettings.theme ?? 'dark',
        language: storedSettings.language === 'id' ? 'id' : 'en',
      },
    }
  } catch {
    return null
  }
}

export function persistData(data: AppData, accountId?: string | null): boolean {
  const ok =
    writeJSON(keyFor(STORAGE_KEYS.profile, accountId), data.profile) &&
    writeJSON(keyFor(STORAGE_KEYS.analyses, accountId), data.analyses) &&
    writeJSON(keyFor(STORAGE_KEYS.unlocked, accountId), data.unlocked) &&
    writeJSON(keyFor(STORAGE_KEYS.settings, accountId), data.settings)
  return ok
}
