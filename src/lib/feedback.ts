import { keyFor, readJSON, writeJSON } from './storage'
import { nowISO, uid } from './utils'

export type FeedbackCategory = 'idea' | 'bug' | 'content' | 'other'
export type FeedbackRating = 1 | 2 | 3 | 4 | 5

export interface FeedbackEntry {
  id: string
  category: FeedbackCategory
  rating: FeedbackRating
  message: string
  createdAt: string
}

const FEEDBACK_KEY = 'sas.feedback'
const MAX_FEEDBACK_ENTRIES = 20

function isFeedbackCategory(value: unknown): value is FeedbackCategory {
  return value === 'idea' || value === 'bug' || value === 'content' || value === 'other'
}

function isFeedbackEntry(value: unknown): value is FeedbackEntry {
  if (!value || typeof value !== 'object') return false
  const entry = value as Partial<FeedbackEntry>
  return (
    typeof entry.id === 'string' &&
    isFeedbackCategory(entry.category) &&
    typeof entry.rating === 'number' &&
    Number.isInteger(entry.rating) &&
    entry.rating >= 1 &&
    entry.rating <= 5 &&
    typeof entry.message === 'string' &&
    typeof entry.createdAt === 'string'
  )
}

/** Read the signed-in user's locally stored feedback notes. */
export function loadFeedback(accountId?: string | null): FeedbackEntry[] {
  const entries = readJSON<unknown>(keyFor(FEEDBACK_KEY, accountId), [])
  return Array.isArray(entries) ? entries.filter(isFeedbackEntry).slice(0, MAX_FEEDBACK_ENTRIES) : []
}

/** Save a feedback note on this device. Nothing is sent to a server. */
export function saveFeedback(
  input: Omit<FeedbackEntry, 'id' | 'createdAt'>,
  accountId?: string | null,
): boolean {
  const entry: FeedbackEntry = { ...input, id: uid(), createdAt: nowISO() }
  const entries = [entry, ...loadFeedback(accountId)].slice(0, MAX_FEEDBACK_ENTRIES)
  return writeJSON(keyFor(FEEDBACK_KEY, accountId), entries)
}
