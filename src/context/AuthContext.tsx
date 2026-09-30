import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { TranslationKey } from '../i18n'
import {
  createAccountRecord,
  endSession,
  findAccountByEmail,
  getSessionAccount,
  loadAccounts,
  saveAccounts,
  startSession,
} from '../lib/accounts'
import { hashPassword } from '../lib/crypto'
import { migrateLegacyDataTo } from '../lib/storage'
import type { Account, AccountRole } from '../types'

export interface AuthResult {
  ok: boolean
  error?: TranslationKey
}

export interface SignupInput {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: AccountRole | ''
  customRole?: string
}

export interface ProfileUpdateInput {
  name: string
  role: AccountRole | ''
  customRole?: string
}

interface AuthContextValue {
  account: Account | null
  isAuthenticated: boolean
  signup: (input: SignupInput) => Promise<AuthResult>
  login: (email: string, password: string) => Promise<AuthResult>
  updateProfile: (input: ProfileUpdateInput) => AuthResult
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(() => getSessionAccount())

  const signup = useCallback(async (input: SignupInput): Promise<AuthResult> => {
    if (!input.name.trim()) return { ok: false, error: 'auth.err.nameRequired' }
    if (!EMAIL_RE.test(input.email.trim())) return { ok: false, error: 'auth.err.invalidEmail' }
    if (input.password.length < 6) return { ok: false, error: 'auth.err.shortPassword' }
    if (input.password !== input.confirmPassword) return { ok: false, error: 'auth.err.passwordMismatch' }
    if (!input.role) return { ok: false, error: 'auth.err.roleRequired' }
    if (input.role === 'other' && !input.customRole?.trim()) return { ok: false, error: 'auth.err.customRoleRequired' }
    if (findAccountByEmail(input.email)) return { ok: false, error: 'auth.err.emailTaken' }

    const passwordHash = await hashPassword(input.email, input.password)
    const created = createAccountRecord(input.name, input.email, passwordHash, input.role, input.customRole)
    const accounts = [...loadAccounts(), created]
    if (!saveAccounts(accounts)) return { ok: false, error: 'toast.storageError' }
    migrateLegacyDataTo(created.id)
    startSession(created.id)
    setAccount(created)
    return { ok: true }
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const existing = findAccountByEmail(email)
    if (!existing) return { ok: false, error: 'auth.err.credentials' }
    const hash = await hashPassword(email, password)
    if (hash !== existing.passwordHash) return { ok: false, error: 'auth.err.credentials' }
    migrateLegacyDataTo(existing.id)
    startSession(existing.id)
    setAccount(existing)
    return { ok: true }
  }, [])

  const updateProfile = useCallback(
    (input: ProfileUpdateInput): AuthResult => {
      if (!account) return { ok: false, error: 'auth.err.credentials' }
      if (!input.name.trim()) return { ok: false, error: 'profile.err.nameRequired' }
      if (!input.role) return { ok: false, error: 'profile.err.roleRequired' }
      if (input.role === 'other' && !input.customRole?.trim()) {
        return { ok: false, error: 'profile.err.customRoleRequired' }
      }

      const updated: Account = {
        ...account,
        name: input.name.trim(),
        role: input.role,
        customRole: input.role === 'other' ? input.customRole?.trim() : undefined,
      }
      const accounts = loadAccounts()
      const accountIndex = accounts.findIndex((candidate) => candidate.id === account.id)
      if (accountIndex < 0) return { ok: false, error: 'auth.err.credentials' }
      accounts[accountIndex] = updated
      if (!saveAccounts(accounts)) return { ok: false, error: 'toast.storageError' }

      setAccount(updated)
      return { ok: true }
    },
    [account],
  )

  const logout = useCallback(() => {
    endSession()
    setAccount(null)
  }, [])

  const value = useMemo(
    () => ({ account, isAuthenticated: !!account, signup, login, updateProfile, logout }),
    [account, signup, login, updateProfile, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
