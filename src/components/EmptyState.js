import { IconClipboard } from './Icons'

export default function EmptyState({ title = 'No tasks yet', description = 'Create your first task to get started.', action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <IconClipboard size={32} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {action}
    </div>
  )
}
