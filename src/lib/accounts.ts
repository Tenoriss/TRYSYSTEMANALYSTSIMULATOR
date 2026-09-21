import type { Account } from '../types'
import { nowISO, uid } from './utils'

const ACCOUNTS_KEY = 'sas.accounts.v1'
const SESSION_KEY = 'sas.session.v1'

export function loadAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Account[]) : []
  } catch {
    return []
  }
}

export function saveAccounts(accounts: Account[]): boolean {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
    return true
  } catch {
    return false
  }
}

export function findAccountByEmail(email: string): Account | undefined {
  const normalized = email.trim().toLowerCase()
  return loadAccounts().find((a) => a.email.toLowerCase() === normalized)
}

export function getSessionAccountId(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

export function getSessionAccount(): Account | null {
  const id = getSessionAccountId()
  if (!id) return null
  return loadAccounts().find((a) => a.id === id) ?? null
}

export function startSession(accountId: string): void {
  try {
    localStorage.setItem(SESSION_KEY, accountId)
  } catch {
    /* storage unavailable */
  }
}

export function endSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    /* storage unavailable */
  }
}

export function createAccountRecord(
  name: string,
  email: string,
  passwordHash: string,
  role: Account['role'],
  customRole?: string,
): Account {
  return {
    id: uid(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    role,
    customRole: customRole?.trim() || undefined,
    createdAt: nowISO(),
  }
}
