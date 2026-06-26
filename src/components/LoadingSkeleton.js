export function TaskCardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton" style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="skeleton" style={{ height: 16, width: '60%' }} />
        <div className="skeleton" style={{ height: 12, width: '85%' }} />
        <div className="skeleton" style={{ height: 12, width: '40%' }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <div className="skeleton" style={{ height: 22, width: 72, borderRadius: 99 }} />
          <div className="skeleton" style={{ height: 22, width: 60, borderRadius: 99 }} />
        </div>
      </div>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card">
      <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: 28, width: '50%', marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 13, width: '70%' }} />
      </div>
    </div>
  )
}

export default function LoadingSkeleton({ count = 5, type = 'task' }) {
  if (type === 'stat') {
    return (
      <div className="stats-grid">
        {Array.from({ length: count }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    )
  }
  return (
    <div className="task-list">
      {Array.from({ length: count }).map((_, i) => (
        <TaskCardSkeleton key={i} />
      ))}
    </div>
  )
}
