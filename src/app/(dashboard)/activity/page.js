'use client'

import { useState, useEffect, useMemo } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import { useAuth } from '@/context/AuthContext'
import { IconActivity, IconSearch } from '@/components/Icons'

import { activitiesApi } from '@/lib/api'

// ─── Static config ────────────────────────────────────────────────────────
const ACTION_CONFIG = {
  created:        { label: 'Created',        emoji: '✨', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  updated:        { label: 'Updated',        emoji: '✏️', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  status_changed: { label: 'Status Changed', emoji: '🔄', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  deleted:        { label: 'Deleted',        emoji: '🗑️', color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
  file_uploaded:  { label: 'File Uploaded',  emoji: '📎', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
}
const ALL_ACTIONS = ['All', 'created', 'updated', 'status_changed', 'deleted']

// ─── Shared sub-components ────────────────────────────────────────────────
function ActivityBadge({ action }) {
  const cfg = ACTION_CONFIG[action] || ACTION_CONFIG.updated
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px',
      borderRadius: 999, background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap',
    }}>
      {cfg.emoji} {cfg.label}
    </span>
  )
}

function UserAvatar({ initials, size = 28 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)',
      color: '#fff', fontSize: size * 0.35, fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {initials || '?'}
    </div>
  )
}

function ChangeDetail({ changes }) {
  if (!changes || changes.length === 0) return null
  return (
    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {changes.map((c, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
          fontSize: '0.78rem', padding: '4px 10px', borderRadius: 6,
          border: '1px solid var(--border)', background: 'var(--bg-body)',
        }}>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{c.label}:</span>
          <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>{c.oldValue}</span>
          <span style={{ color: 'var(--text-muted)' }}>→</span>
          <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{c.newValue}</span>
        </div>
      ))}
    </div>
  )
}

function ActivityRow({ activity, isLast, isAdmin }) {
  const cfg = ACTION_CONFIG[activity.action] || ACTION_CONFIG.updated
  const date = activity.createdAt ? new Date(activity.createdAt) : null

  return (
    <div style={{ display: 'flex', gap: 16, paddingBottom: isLast ? 0 : 20, position: 'relative' }}>
      {/* Timeline dot + line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: cfg.bg, border: `2px solid ${cfg.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, zIndex: 1, boxShadow: '0 0 0 4px var(--bg-surface)',
        }}>
          {cfg.emoji}
        </div>
        {!isLast && <div style={{ flex: 1, width: 2, background: 'var(--border)', minHeight: 20, marginTop: 4 }} />}
      </div>

      {/* Card */}
      <div
        style={{
          flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '12px 16px', marginBottom: isLast ? 0 : 4, transition: 'box-shadow 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flex: 1 }}>
            <UserAvatar initials={activity.userInitials} size={26} />
            {/* Show username to admin */}
            {isAdmin && (
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary)' }}>
                {activity.userName || 'Unknown'}
              </span>
            )}
            <ActivityBadge action={activity.action} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', flex: 1 }}>
              {activity.description}
            </span>
          </div>

          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              {date ? formatDistanceToNow(date, { addSuffix: true }) : 'Just now'}
            </div>
            {date && (
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 1 }}>
                {format(date, 'MMM d, yyyy · HH:mm')}
              </div>
            )}
          </div>
        </div>
        <ChangeDetail changes={activity.changes} />
      </div>
    </div>
  )
}

// ─── Admin-only: user stats summary cards ────────────────────────────────
function UserStatsGrid({ activities, selectedUser, onSelectUser }) {
  const userMap = useMemo(() => {
    const map = {}
    activities.forEach((a) => {
      const key = a.userName || 'Unknown'
      if (!map[key]) map[key] = { name: key, initials: a.userInitials || '?', count: 0, lastAction: null }
      map[key].count++
      if (!map[key].lastAction || new Date(a.createdAt) > new Date(map[key].lastAction)) {
        map[key].lastAction = a.createdAt
      }
    })
    return Object.values(map).sort((a, b) => b.count - a.count)
  }, [activities])

  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Users ({userMap.length})
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {/* "All users" chip */}
        <button
          id="activity-user-all"
          onClick={() => onSelectUser('All')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: 999,
            border: `1px solid ${selectedUser === 'All' ? 'var(--primary)' : 'var(--border)'}`,
            background: selectedUser === 'All' ? 'var(--primary-muted)' : 'var(--bg-surface)',
            color: selectedUser === 'All' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: selectedUser === 'All' ? 600 : 400,
            fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          👥 All users
          <span style={{
            background: selectedUser === 'All' ? 'var(--primary)' : 'var(--bg-body)',
            color: selectedUser === 'All' ? '#fff' : 'var(--text-muted)',
            borderRadius: 999, padding: '1px 7px', fontSize: '0.7rem', fontWeight: 700,
          }}>
            {activities.length}
          </span>
        </button>

        {userMap.map((u) => {
          const active = selectedUser === u.name
          return (
            <button
              key={u.name}
              id={`activity-user-${u.name}`}
              onClick={() => onSelectUser(u.name)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 14px', borderRadius: 999,
                border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                background: active ? 'var(--primary-muted)' : 'var(--bg-surface)',
                color: active ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: active ? 600 : 400,
                fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <UserAvatar initials={u.initials} size={22} />
              {u.name}
              <span style={{
                background: active ? 'var(--primary)' : 'var(--bg-body)',
                color: active ? '#fff' : 'var(--text-muted)',
                borderRadius: 999, padding: '1px 7px', fontSize: '0.7rem', fontWeight: 700,
              }}>
                {u.count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Admin stats overview row ─────────────────────────────────────────────
function AdminStatsBanner({ activities }) {
  const stats = useMemo(() => {
    const users = new Set(activities.map(a => a.userName)).size
    const byAction = {}
    activities.forEach(a => { byAction[a.action] = (byAction[a.action] || 0) + 1 })
    return { total: activities.length, users, byAction }
  }, [activities])

  const statItems = [
    { label: 'Total Events', value: stats.total, emoji: '📋', color: 'var(--primary)', bg: 'var(--primary-muted)' },
    { label: 'Active Users', value: stats.users, emoji: '👥', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    { label: 'Tasks Created', value: stats.byAction.created || 0, emoji: '✨', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    { label: 'Tasks Updated', value: stats.byAction.updated || 0, emoji: '✏️', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
    { label: 'Status Changes', value: stats.byAction.status_changed || 0, emoji: '🔄', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    { label: 'Deleted', value: stats.byAction.deleted || 0, emoji: '🗑️', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  ]

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: 10, marginBottom: 24,
    }}>
      {statItems.map((s) => (
        <div key={s.label} style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, background: s.bg,
            color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, flexShrink: 0,
          }}>
            {s.emoji}
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {s.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function ActivityPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN'

  const [allActivities,    setAllActivities]    = useState([])
  const [search,           setSearch]           = useState('')
  const [filterAction,     setFilterAction]     = useState('All')
  const [filterUser,       setFilterUser]       = useState('All')
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  useEffect(() => {
    activitiesApi.getAll().then(res => {
      let all = res.data?.data || []
      // Parse changesJson if string
      all = all.map(a => {
        if (typeof a.changesJson === 'string') {
          try { a.changes = JSON.parse(a.changesJson) } catch (e) { a.changes = [] }
        } else if (!a.changes) {
          a.changes = []
        }
        return a
      })
      setAllActivities(all)
    }).catch(err => console.error('Failed to load activities', err))
  }, [])

  const filtered = useMemo(() => {
    return allActivities.filter((a) => {
      const matchesAction = filterAction === 'All' || a.action === filterAction
      const matchesUser   = !isAdmin || filterUser === 'All' || a.userName === filterUser
      const matchesSearch =
        !search ||
        a.description?.toLowerCase().includes(search.toLowerCase()) ||
        a.userName?.toLowerCase().includes(search.toLowerCase())
      return matchesAction && matchesUser && matchesSearch
    })
  }, [allActivities, filterAction, filterUser, filterUser, search, isAdmin])

  const handleClearAll = async () => {
    try {
      await activitiesApi.clearAll()
      setAllActivities([])
      setShowClearConfirm(false)
    } catch (err) {
      console.error('Failed to clear activities', err)
    }
  }

  return (
    <div style={{ maxWidth: isAdmin ? 900 : 760, margin: '0 auto' }}>

      {/* Page header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, background: 'var(--primary-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)',
          }}>
            <IconActivity size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Activity Log
              {isAdmin && (
                <span style={{
                  marginLeft: 10, fontSize: '0.7rem', fontWeight: 700,
                  background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
                  color: '#fff', padding: '2px 10px', borderRadius: 999, verticalAlign: 'middle',
                }}>
                  ADMIN
                </span>
              )}
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, marginTop: 2 }}>
              {isAdmin ? "All users' activity across the system" : 'Your personal task activity history'}
            </p>
          </div>
        </div>

        {isAdmin && allActivities.length > 0 && (
          <button
            id="activity-clear-all"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowClearConfirm(true)}
            style={{ color: 'var(--priority-high-color)' }}
          >
            🗑️ Clear All
          </button>
        )}
      </div>

      {/* Admin stats banner */}
      {isAdmin && allActivities.length > 0 && <AdminStatsBanner activities={allActivities} />}

      {/* Clear confirm */}
      {showClearConfirm && (
        <div style={{
          background: 'var(--priority-high-bg)', border: '1px solid var(--priority-high-color)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        }}>
          <span style={{ flex: 1, fontSize: '0.85rem', color: 'var(--priority-high-color)', fontWeight: 500 }}>
            This will permanently clear ALL users' activity history. Are you sure?
          </span>
          <button className="btn btn-sm btn-danger" onClick={handleClearAll}>Yes, clear all</button>
          <button className="btn btn-sm btn-secondary" onClick={() => setShowClearConfirm(false)}>Cancel</button>
        </div>
      )}

      {/* Admin: user filter chips */}
      {isAdmin && allActivities.length > 0 && (
        <UserStatsGrid
          activities={allActivities}
          selectedUser={filterUser}
          onSelectUser={setFilterUser}
        />
      )}

      {/* Search + action filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none',
          }}>
            <IconSearch size={14} />
          </span>
          <input
            id="activity-search"
            type="search"
            className="search-input"
            placeholder={isAdmin ? 'Search by action or user…' : 'Search activity…'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {ALL_ACTIONS.map((action) => {
            const cfg = action === 'All' ? null : ACTION_CONFIG[action]
            const isActive = filterAction === action
            return (
              <button
                key={action}
                id={`activity-filter-${action}`}
                onClick={() => setFilterAction(action)}
                style={{
                  padding: '5px 12px', borderRadius: 999,
                  border: `1px solid ${isActive ? (cfg?.color || 'var(--primary)') : 'var(--border)'}`,
                  background: isActive ? (cfg?.bg || 'var(--primary-muted)') : 'var(--bg-surface)',
                  color: isActive ? (cfg?.color || 'var(--primary)') : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                {cfg?.emoji || '📋'} {action === 'All' ? 'All' : ACTION_CONFIG[action].label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Results count */}
      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>
        {filtered.length} event{filtered.length !== 1 ? 's' : ''}
        {filterUser !== 'All' && ` · ${filterUser}`}
        {filterAction !== 'All' && ` · ${ACTION_CONFIG[filterAction]?.label}`}
      </p>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '60px 24px',
          background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16,
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🕐</div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
            {search || filterAction !== 'All' || filterUser !== 'All' ? 'No matching activity' : 'No activity yet'}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {search || filterAction !== 'All' || filterUser !== 'All'
              ? 'Try adjusting your filters.'
              : isAdmin
                ? 'Activity from all users will appear here as tasks are managed.'
                : 'Activity will appear here as you create, update, and manage tasks.'}
          </p>
        </div>
      )}

      {/* Timeline */}
      {filtered.length > 0 && (
        <div>
          {filtered.map((activity, idx) => (
            <ActivityRow
              key={activity.id || idx}
              activity={activity}
              isLast={idx === filtered.length - 1}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  )
}
