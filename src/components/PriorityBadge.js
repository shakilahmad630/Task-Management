import { PRIORITY_LABELS } from '@/lib/utils'

const CONFIG = {
  LOW: {
    label: PRIORITY_LABELS.LOW,
    style: {
      color: 'var(--priority-low-color)',
      background: 'var(--priority-low-bg)',
    },
  },
  MEDIUM: {
    label: PRIORITY_LABELS.MEDIUM,
    style: {
      color: 'var(--priority-medium-color)',
      background: 'var(--priority-medium-bg)',
    },
  },
  HIGH: {
    label: PRIORITY_LABELS.HIGH,
    style: {
      color: 'var(--priority-high-color)',
      background: 'var(--priority-high-bg)',
    },
  },
}

export default function PriorityBadge({ priority }) {
  const cfg = CONFIG[priority] || CONFIG.MEDIUM
  return (
    <span className="badge" style={cfg.style}>
      {priority === 'HIGH' && '↑ '}
      {priority === 'LOW'  && '↓ '}
      {cfg.label}
    </span>
  )
}
