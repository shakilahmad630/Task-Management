import { formatDate, getDueDateStatus, getInitials, getErrorMessage, STATUS_LABELS, PRIORITY_LABELS } from '../src/lib/utils'

describe('formatDate', () => {
  it('formats a valid ISO date string', () => {
    expect(formatDate('2024-12-25')).toBe('Dec 25, 2024')
  })

  it('returns "—" for null/undefined', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatDate(undefined)).toBe('—')
    expect(formatDate('')).toBe('—')
  })
})

describe('getDueDateStatus', () => {
  it('returns null when task is DONE', () => {
    expect(getDueDateStatus('2020-01-01', 'DONE')).toBeNull()
  })

  it('returns null when no dueDate', () => {
    expect(getDueDateStatus(null, 'TODO')).toBeNull()
    expect(getDueDateStatus('', 'TODO')).toBeNull()
  })

  it('returns "overdue" for past dates', () => {
    expect(getDueDateStatus('2000-01-01', 'TODO')).toBe('overdue')
  })
})

describe('getInitials', () => {
  it('returns initials from a full name', () => {
    expect(getInitials('John Doe')).toBe('JD')
  })

  it('returns first two chars for single-word names', () => {
    expect(getInitials('alice')).toBe('AL')
  })

  it('returns "?" for empty string', () => {
    expect(getInitials('')).toBe('?')
  })
})

describe('getErrorMessage', () => {
  it('extracts message from axios-style error', () => {
    const err = { response: { data: { message: 'Invalid credentials' } } }
    expect(getErrorMessage(err)).toBe('Invalid credentials')
  })

  it('falls back to error.message', () => {
    const err = { message: 'Network Error' }
    expect(getErrorMessage(err)).toBe('Network Error')
  })

  it('returns fallback for null', () => {
    expect(getErrorMessage(null)).toBe('Something went wrong.')
  })
})

describe('STATUS_LABELS', () => {
  it('has correct labels', () => {
    expect(STATUS_LABELS.TODO).toBe('To Do')
    expect(STATUS_LABELS.IN_PROGRESS).toBe('In Progress')
    expect(STATUS_LABELS.DONE).toBe('Done')
  })
})

describe('PRIORITY_LABELS', () => {
  it('has correct labels', () => {
    expect(PRIORITY_LABELS.LOW).toBe('Low')
    expect(PRIORITY_LABELS.MEDIUM).toBe('Medium')
    expect(PRIORITY_LABELS.HIGH).toBe('High')
  })
})
