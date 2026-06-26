import { format, formatDistanceToNow, isPast, isToday, parseISO } from 'date-fns'

// ── Date Helpers ─────────────────────────────────────────────────────────────

/**
 * Format a date string to a human-readable format
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return '—'
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, 'MMM d, yyyy')
  } catch {
    return '—'
  }
}

/**
 * Format a date as relative time (e.g., "2 days ago")
 */
export function formatRelative(date) {
  if (!date) return ''
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return formatDistanceToNow(d, { addSuffix: true })
  } catch {
    return ''
  }
}

/**
 * Returns the due-date status: 'overdue' | 'today' | 'upcoming' | null
 */
export function getDueDateStatus(dueDate, status) {
  if (!dueDate || status === 'DONE') return null
  try {
    const d = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate
    if (isToday(d)) return 'today'
    if (isPast(d)) return 'overdue'
    return 'upcoming'
  } catch {
    return null
  }
}

// ── Status Helpers ────────────────────────────────────────────────────────────

export const STATUS_OPTIONS = [
  { value: 'TODO',        label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE',        label: 'Done' },
]

export const PRIORITY_OPTIONS = [
  { value: 'LOW',    label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH',   label: 'High' },
]

export const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Created Date' },
  { value: 'dueDate',   label: 'Due Date' },
  { value: 'priority',  label: 'Priority' },
  { value: 'title',     label: 'Title' },
]

export const STATUS_LABELS = {
  TODO:        'To Do',
  IN_PROGRESS: 'In Progress',
  DONE:        'Done',
}

export const PRIORITY_LABELS = {
  LOW:    'Low',
  MEDIUM: 'Medium',
  HIGH:   'High',
}

// ── String Helpers ────────────────────────────────────────────────────────────

/**
 * Get initials from a name or email
 */
export function getInitials(nameOrEmail = '') {
  if (!nameOrEmail) return '?'
  const parts = nameOrEmail.trim().split(/[\s@]+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return nameOrEmail.slice(0, 2).toUpperCase()
}

/**
 * Extract a user-friendly error message from an Axios error
 */
export function getErrorMessage(error) {
  if (!error) return 'Something went wrong.'
  if (error.response?.data?.message) return error.response.data.message
  if (error.response?.data?.error) return error.response.data.error
  if (error.message) return error.message
  return 'Something went wrong.'
}

// ── Priority sort value ───────────────────────────────────────────────────────
export const PRIORITY_ORDER = { HIGH: 3, MEDIUM: 2, LOW: 1 }
