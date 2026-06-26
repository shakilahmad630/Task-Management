'use client'

import { formatDistanceToNow } from 'date-fns'

const ACTION_ICONS = {
  created:        { emoji: '✨', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  updated:        { emoji: '✏️', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  status_changed: { emoji: '🔄', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  deleted:        { emoji: '🗑️', color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
  file_uploaded:  { emoji: '📎', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
}

function ActionBadge({ action }) {
  const cfg = ACTION_ICONS[action] || ACTION_ICONS.updated
  return (
    <span style={{
      display:        'inline-flex',
      alignItems:     'center',
      justifyContent: 'center',
      width:          28,
      height:         28,
      borderRadius:   '50%',
      background:     cfg.bg,
      fontSize:       13,
      flexShrink:     0,
    }}>
      {cfg.emoji}
    </span>
  )
}

function ChangeDetail({ changes = [] }) {
  if (!changes || changes.length === 0) return null
  return (
    <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {changes.map((c, i) => (
        <div key={i} style={{
          fontSize:        '0.75rem',
          padding:         '3px 8px',
          borderRadius:    4,
          background:      'var(--bg-body)',
          border:          '1px solid var(--border)',
          display:         'flex',
          alignItems:      'center',
          gap:             6,
          flexWrap:        'wrap',
          color:           'var(--text-secondary)',
        }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.label}:</span>
          <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>{c.oldValue}</span>
          <span style={{ color: 'var(--text-muted)' }}>→</span>
          <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{c.newValue}</span>
        </div>
      ))}
    </div>
  )
}

export default function ActivityLog({ activities = [], loading = false }) {
  return (
    <div style={{
      marginTop:  24,
      paddingTop: 20,
      borderTop:  '1px solid var(--border)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 14 }}>📋</span>
        <h3 style={{
          fontSize:   '0.95rem',
          fontWeight: 600,
          color:      'var(--text-primary)',
          margin:     0,
        }}>
          Activity History
        </h3>
        {activities.length > 0 && (
          <span style={{
            fontSize:   '0.7rem',
            fontWeight: 600,
            background: 'var(--primary-muted)',
            color:      'var(--primary)',
            padding:    '1px 7px',
            borderRadius: 999,
          }}>
            {activities.length}
          </span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{
              height:       52,
              borderRadius: 8,
              background:   'var(--bg-surface-2)',
              animation:    'pulse 1.5s ease-in-out infinite',
              opacity:      0.6,
            }} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && activities.length === 0 && (
        <div style={{
          textAlign:    'center',
          padding:      '24px 0',
          color:        'var(--text-muted)',
          fontSize:     '0.85rem',
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🕐</div>
          No activity recorded yet.
          <br />
          Changes to this task will appear here.
        </div>
      )}

      {/* Timeline */}
      {!loading && activities.length > 0 && (
        <div style={{ position: 'relative' }}>
          {/* Vertical line */}
          <div style={{
            position:   'absolute',
            left:       13,
            top:        14,
            bottom:     0,
            width:      1,
            background: 'var(--border)',
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {activities.map((activity, idx) => (
              <div
                key={activity.id || idx}
                style={{
                  display:       'flex',
                  gap:           12,
                  alignItems:    'flex-start',
                  paddingBottom: 16,
                  position:      'relative',
                }}
              >
                {/* Icon circle */}
                <div style={{ flexShrink: 0, zIndex: 1 }}>
                  <ActionBadge action={activity.action} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, paddingTop: 4, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
                    {/* User initials pill */}
                    <span style={{
                      background:   'var(--primary-muted)',
                      color:        'var(--primary)',
                      borderRadius: 4,
                      padding:      '1px 6px',
                      fontSize:     '0.7rem',
                      fontWeight:   700,
                      flexShrink:   0,
                    }}>
                      {activity.userInitials || 'A'}
                    </span>

                    {/* Description */}
                    <p style={{
                      margin:     0,
                      fontSize:   '0.85rem',
                      color:      'var(--text-primary)',
                      lineHeight: 1.5,
                    }}>
                      {activity.description}
                    </p>
                  </div>

                  {/* Change details */}
                  <ChangeDetail changes={activity.changes} />

                  {/* Timestamp */}
                  <span style={{
                    fontSize:   '0.72rem',
                    color:      'var(--text-muted)',
                    marginTop:  4,
                    display:    'block',
                  }}>
                    {activity.createdAt
                      ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })
                      : 'Just now'}
                    {activity.userName && ` · ${activity.userName}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
