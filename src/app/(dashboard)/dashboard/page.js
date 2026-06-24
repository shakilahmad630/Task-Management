'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { tasksApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import TaskCard from '@/components/TaskCard'
import LoadingSkeleton, { StatCardSkeleton } from '@/components/LoadingSkeleton'
import EmptyState from '@/components/EmptyState'
import TaskModal from '@/components/TaskModal'
import ConfirmModal from '@/components/ConfirmModal'
import { IconPlus } from '@/components/Icons'
import { getErrorMessage } from '@/lib/utils'
import toast from 'react-hot-toast'

function StatCard({ label, value, colorClass, icon, loading }) {
  if (loading) return <StatCardSkeleton />
  return (
    <div className="stat-card">
      <div className={`stat-icon ${colorClass}`} aria-hidden="true">{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()

  const [stats,   setStats]   = useState({ total: 0, todo: 0, inProgress: 0, done: 0 })
  const [recent,  setRecent]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  // Modal state
  const [modalOpen,   setModalOpen]   = useState(false)
  const [editTask,    setEditTask]    = useState(null)
  const [saving,      setSaving]      = useState(false)
  const [deleteOpen,  setDeleteOpen]  = useState(false)
  const [deleteTask,  setDeleteTask]  = useState(null)
  const [deleting,    setDeleting]    = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [allRes, todoRes, progressRes, doneRes] = await Promise.all([
        tasksApi.getAll({ page: 0, size: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
        tasksApi.getAll({ page: 0, size: 1, status: 'TODO' }),
        tasksApi.getAll({ page: 0, size: 1, status: 'IN_PROGRESS' }),
        tasksApi.getAll({ page: 0, size: 1, status: 'DONE' }),
      ])

      // Handle both Spring Page and simple array responses
      const extract = (res) => {
        const d = res.data.data || res.data
        if (d?.content) return { items: d.content, total: d.totalElements }
        if (Array.isArray(d)) return { items: d, total: d.length }
        return { items: [], total: 0 }
      }

      const all      = extract(allRes)
      const todo     = extract(todoRes)
      const progress = extract(progressRes)
      const done     = extract(doneRes)

      setStats({
        total:      all.total,
        todo:       todo.total,
        inProgress: progress.total,
        done:       done.total,
      })
      setRecent(all.items.slice(0, 5))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleEdit = (task) => { setEditTask(task); setModalOpen(true) }
  const handleNew  = ()     => { setEditTask(null);  setModalOpen(true) }

  const handleSave = async (data) => {
    setSaving(true)
    try {
      if (editTask) {
        await tasksApi.update(editTask.id, data)
        toast.success('Task updated!')
      } else {
        await tasksApi.create(data)
        toast.success('Task created!')
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClick = (task) => { setDeleteTask(task); setDeleteOpen(true) }

  const handleDeleteConfirm = async () => {
    setDeleting(true)
    try {
      await tasksApi.delete(deleteTask.id)
      toast.success('Task deleted.')
      setDeleteOpen(false)
      fetchData()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleStatus = async (task) => {
    const next = task.status === 'DONE' ? 'TODO' : 'DONE'
    // Optimistic UI
    setRecent((prev) => prev.map((t) => t.id === task.id ? { ...t, status: next } : t))
    try {
      await tasksApi.update(task.id, { status: next })
      fetchData()
    } catch (err) {
      toast.error(getErrorMessage(err))
      setRecent((prev) => prev.map((t) => t.id === task.id ? { ...t, status: task.status } : t))
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Greeting */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
            Hey, {user?.username || 'there'} 👋
          </h2>
          <p className="text-muted text-sm">Here&apos;s your task overview for today.</p>
        </div>
        <button id="dashboard-new-task" className="btn btn-primary btn-sm" onClick={handleNew}>
          <IconPlus size={15} /> New Task
        </button>
      </div>

      {/* Stats */}
      {error ? (
        <div style={{ color: 'var(--priority-high-color)', marginBottom: 16 }}>{error}</div>
      ) : (
        <div className="stats-grid">
          <StatCard label="Total Tasks"  value={stats.total}      colorClass="purple" loading={loading}
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
          />
          <StatCard label="To Do"       value={stats.todo}       colorClass="blue"   loading={loading}
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
          />
          <StatCard label="In Progress" value={stats.inProgress} colorClass="amber"  loading={loading}
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>}
          />
          <StatCard label="Completed"   value={stats.done}       colorClass="green"  loading={loading}
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
          />
        </div>
      )}

      {/* Recent Tasks */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold" style={{ fontSize: 15 }}>Recent Tasks</h2>
        <Link href="/tasks" id="dashboard-view-all" style={{ fontSize: 13, color: 'var(--primary)' }}>
          View all →
        </Link>
      </div>

      {loading ? (
        <LoadingSkeleton count={4} />
      ) : recent.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Create your first task to get started."
          action={
            <button id="dashboard-empty-new" className="btn btn-primary btn-sm" onClick={handleNew}>
              <IconPlus size={15} /> Create Task
            </button>
          }
        />
      ) : (
        <div className="task-list">
          {recent.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <TaskModal
        isOpen={modalOpen}
        task={editTask}
        onSubmit={handleSave}
        onClose={() => setModalOpen(false)}
        loading={saving}
      />
      <ConfirmModal
        isOpen={deleteOpen}
        title="Delete Task"
        message={`Delete "${deleteTask?.title}"? This cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteOpen(false)}
        loading={deleting}
      />
    </>
  )
}
