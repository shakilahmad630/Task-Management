'use client'

import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'
import { IconEdit, IconTrash, IconCalendar, IconCheck } from './Icons'
import { formatDate, getDueDateStatus } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

export default function TaskCard({ task, onEdit, onDelete, onToggleStatus }) {
  const { user: currentUser } = useAuth()
  const isDone = task.status === 'DONE'
  const dueDateStatus = getDueDateStatus(task.dueDate, task.status)
  const taskOwner = task.user?.name || task.user?.username || task.user?.email

  const dueDateClass = [
    'task-due',
    dueDateStatus === 'overdue' ? 'overdue' : '',
    dueDateStatus === 'today'   ? 'today'   : '',
  ].filter(Boolean).join(' ')

  return (
    <article
      className={`task-card priority-${task.priority?.toLowerCase()}`}
      data-testid="task-card"
    >
      {/* Completion toggle */}
      <button
        id={`task-toggle-${task.id}`}
        className={`task-checkbox${isDone ? ' checked' : ''}`}
        onClick={() => onToggleStatus(task)}
        aria-label={isDone ? 'Mark as incomplete' : 'Mark as complete'}
        title={isDone ? 'Mark incomplete' : 'Mark complete'}
      >
        {isDone && <IconCheck size={11} />}
      </button>

      {/* Content */}
      <div className="task-content">
        <h3 className={`task-title${isDone ? ' done' : ''}`}>{task.title}</h3>

        {task.description && (
          <p className="task-desc">{task.description}</p>
        )}

        <div className="task-meta">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />

          {task.dueDate && (
            <span className={dueDateClass}>
              <IconCalendar size={12} />
              {dueDateStatus === 'overdue' && 'Overdue · '}
              {dueDateStatus === 'today'   && 'Due today · '}
              {formatDate(task.dueDate)}
            </span>
          )}

          {(currentUser?.role === 'ADMIN' || currentUser?.role === 'ROLE_ADMIN') && taskOwner && (
            <span style={{
              fontSize: '11px',
              padding: '2px 6px',
              borderRadius: '4px',
              background: 'var(--bg-hover)',
              color: 'var(--text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              border: '1px solid var(--border-color)',
            }} title={`Owned by ${taskOwner.email}`}>
              👤 {taskOwner.name || taskOwner.email}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="task-actions">
        <button
          id={`task-edit-${task.id}`}
          className="btn btn-ghost btn-icon"
          onClick={() => onEdit(task)}
          title="Edit task"
          aria-label="Edit task"
        >
          <IconEdit size={15} />
        </button>
        <button
          id={`task-delete-${task.id}`}
          className="btn btn-ghost btn-icon"
          onClick={() => onDelete(task)}
          title="Delete task"
          aria-label="Delete task"
          style={{ color: 'var(--priority-high-color)' }}
        >
          <IconTrash size={15} />
        </button>
      </div>
    </article>
  )
}
