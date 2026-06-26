'use client'

import { activitiesApi } from './api'

/**
 * Activity Log utility — logs task changes to the backend.
 */

export async function logActivity({ taskId, action, description, changes = [] }) {
  console.log("Sending log activity request to backend:", { taskId, action, description, changes })
  if (!taskId) return
  
  try {
    await activitiesApi.log({
      taskId,
      action,
      description,
      changes
    })
  } catch (err) {
    console.error('Failed to log activity', err)
  }
}

// ── Helpers to build human-readable descriptions ──────────────────────────

const FIELD_LABELS = {
  title:       'Title',
  description: 'Description',
  status:      'Status',
  priority:    'Priority',
  dueDate:     'Due Date',
  assignedToEmail: 'Assignee',
}

const STATUS_LABELS = {
  TODO:        'To Do',
  IN_PROGRESS: 'In Progress',
  DONE:        'Done',
}

const PRIORITY_LABELS = {
  LOW:    'Low',
  MEDIUM: 'Medium',
  HIGH:   'High',
}

function friendlyValue(field, value) {
  if (!value) return '(none)'
  if (field === 'status')   return STATUS_LABELS[value] || value
  if (field === 'priority') return PRIORITY_LABELS[value] || value
  if (field === 'dueDate')  return new Date(value).toLocaleDateString()
  if (typeof value === 'string' && value.length > 60) return value.slice(0, 60) + '…'
  return value
}

/**
 * Build and log a "created" activity.
 */
export function logTaskCreated(task) {
  logActivity({
    taskId: task.id,
    action: 'created',
    description: `Created task "${task.title}"`,
    changes: [],
  })
}

/**
 * Build and log an "updated" activity by diffing old vs new task.
 */
export function logTaskUpdated(taskId, oldTask, newData) {
  const changes = []
  
  // Normalize old task data for comparison
  const normalizedOld = {
    ...oldTask,
    assignedToEmail: oldTask?.user?.email || oldTask?.assignedToEmail
  }

  for (const field of Object.keys(FIELD_LABELS)) {
    const oldVal = normalizedOld[field]
    const newVal = newData[field]
    if (newVal !== undefined && String(oldVal || '') !== String(newVal || '')) {
      changes.push({
        field,
        label:    FIELD_LABELS[field],
        oldValue: friendlyValue(field, oldVal),
        newValue: friendlyValue(field, newVal),
      })
    }
  }

  if (changes.length === 0) return

  const summary =
    changes.length === 1
      ? `Changed ${changes[0].label} from "${changes[0].oldValue}" to "${changes[0].newValue}"`
      : `Updated ${changes.map((c) => c.label).join(', ')}`

  logActivity({ taskId, action: 'updated', description: summary, changes })
}

/**
 * Build and log a "status_changed" activity.
 */
export function logStatusChanged(taskId, oldStatus, newStatus) {
  logActivity({
    taskId,
    action: 'status_changed',
    description: `Status changed from "${STATUS_LABELS[oldStatus] || oldStatus}" to "${STATUS_LABELS[newStatus] || newStatus}"`,
    changes: [{ field: 'status', label: 'Status', oldValue: STATUS_LABELS[oldStatus] || oldStatus, newValue: STATUS_LABELS[newStatus] || newStatus }],
  })
}

/**
 * Build and log a "deleted" activity.
 */
export function logTaskDeleted(task) {
  logActivity({
    taskId: task.id,
    action: 'deleted',
    description: `Deleted task "${task.title}"`,
    changes: [],
  })
}
