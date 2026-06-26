import { STATUS_LABELS } from '@/lib/utils'

const CONFIG = {
  TODO: {
    label: STATUS_LABELS.TODO,
    style: {
      color: 'var(--status-todo-color)',
      background: 'var(--status-todo-bg)',
    },
  },
  IN_PROGRESS: {
    label: STATUS_LABELS.IN_PROGRESS,
    style: {
      color: 'var(--status-progress-color)',
      background: 'var(--status-progress-bg)',
    },
  },
  DONE: {
    label: STATUS_LABELS.DONE,
    style: {
      color: 'var(--status-done-color)',
      background: 'var(--status-done-bg)',
    },
  },
}

export default function StatusBadge({ status }) {
  const cfg = CONFIG[status] || CONFIG.TODO
  return (
    <span className="badge" style={cfg.style}>
      <span className="badge-dot" />
      {cfg.label}
    </span>
  )
}
