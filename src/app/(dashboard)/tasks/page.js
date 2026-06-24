'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { tasksApi } from '@/lib/api'
import TaskCard from '@/components/TaskCard'
import TaskModal from '@/components/TaskModal'
import ConfirmModal from '@/components/ConfirmModal'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import EmptyState from '@/components/EmptyState'
import Pagination from '@/components/Pagination'
import { IconPlus, IconSearch, IconSort } from '@/components/Icons'
import { getErrorMessage, SORT_OPTIONS } from '@/lib/utils'
import toast from 'react-hot-toast'
import {
  logTaskCreated,
  logTaskUpdated,
  logStatusChanged,
  logTaskDeleted,
} from '@/lib/activityLog'

const PAGE_SIZE = 10

const STATUS_TABS = [
  { label: 'All',         value: '' },
  { label: 'To Do',       value: 'TODO' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Done',        value: 'DONE' },
]

export default function TasksPage() {
  // Filters
  const [status,    setStatus]    = useState('')
  const [search,    setSearch]    = useState('')
  const [sortBy,    setSortBy]    = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [page,      setPage]      = useState(1)

  // Data
  const [tasks,      setTasks]      = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')

  // Modals
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editTask,   setEditTask]   = useState(null)
  const [saving,     setSaving]     = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTask, setDeleteTask] = useState(null)
  const [deleting,   setDeleting]   = useState(false)

  // Debounce search
  const searchTimer = useRef(null)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 350)
    return () => clearTimeout(searchTimer.current)
  }, [search])

  // Reset page when filters change
  useEffect(() => { setPage(1) }, [status, sortBy, sortOrder])

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page:      page - 1, // Spring Boot is 0-indexed
        size:      PAGE_SIZE,
        sortBy,
        sortOrder,
      }
      if (status)          params.status = status
      if (debouncedSearch) params.search = debouncedSearch

      const res = await tasksApi.getAll(params)
      const d = res.data.data || res.data

      if (d?.content) {
        // Spring Page response
        setTasks(d.content)
        setTotalPages(d.totalPages || 1)
        setTotalItems(d.totalElements || 0)
      } else if (Array.isArray(d)) {
        // Simple array response
        setTasks(d)
        setTotalPages(1)
        setTotalItems(d.length)
      } else {
        setTasks([])
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [page, status, debouncedSearch, sortBy, sortOrder])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleNew    = ()     => { setEditTask(null); setModalOpen(true) }
  const handleEdit   = (task) => { setEditTask(task); setModalOpen(true) }
  const handleDelete = (task) => { setDeleteTask(task); setDeleteOpen(true) }

  const handleSave = async (data) => {
    setSaving(true)
    try {
      const attachments = data.attachments || []
      delete data.attachments

      let taskId = editTask?.id

      if (editTask) {
        // Log the diff before updating
        logTaskUpdated(editTask.id, editTask, data)
        await tasksApi.update(editTask.id, data)
        toast.success('Task updated!')
      } else {
        const res = await tasksApi.create(data)
        taskId = (res.data?.data?.id || res.data?.id)
        // Log creation after we have a real ID
        if (taskId) logTaskCreated({ ...data, id: taskId })
        toast.success('Task created!')
      }

      // Upload attachments if any and if we have a valid taskId
      if (attachments.length > 0 && taskId) {
        const formData = new FormData()
        attachments.forEach((file) => {
          formData.append('files', file)
        })
        try {
          await tasksApi.uploadAttachment(taskId, formData)
          toast.success('Attachments uploaded!')
        } catch (err) {
          toast.error('Failed to upload some attachments')
        }
      }

      setModalOpen(false)
      fetchTasks()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteConfirm = async () => {
    setDeleting(true)
    try {
      logTaskDeleted(deleteTask)
      await tasksApi.delete(deleteTask.id)
      toast.success('Task deleted.')
      setDeleteOpen(false)
      fetchTasks()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleStatus = async (task) => {
    const next = task.status === 'DONE' ? 'TODO' : 'DONE'
    // Optimistic update
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: next } : t))
    try {
      await tasksApi.update(task.id, { status: next })
      logStatusChanged(task.id, task.status, next)
    } catch (err) {
      toast.error(getErrorMessage(err))
      // Rollback
      setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: task.status } : t))
    }
  }

  const toggleSortOrder = () =>
    setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Toolbar: Search + Sort + New */}
      <div className="toolbar">
        {/* Search */}
        <div className="search-wrap">
          <span className="search-icon"><IconSearch size={15} /></span>
          <input
            id="task-search"
            type="search"
            className="search-input"
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search tasks"
          />
        </div>

        {/* Sort by */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select
            id="task-sort-by"
            className="form-select"
            style={{ width: 'auto', minWidth: 140 }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort by"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <button
            id="task-sort-order"
            className="btn btn-secondary btn-icon"
            onClick={toggleSortOrder}
            title={sortOrder === 'asc' ? 'Sort descending' : 'Sort ascending'}
            aria-label="Toggle sort order"
          >
            <IconSort size={15} />
          </button>
        </div>

        {/* New task */}
        <button id="tasks-new-task" className="btn btn-primary" onClick={handleNew}>
          <IconPlus size={16} /> New Task
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="filter-tabs mb-4" role="tablist" aria-label="Filter by status">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            id={`filter-tab-${tab.value || 'all'}`}
            role="tab"
            aria-selected={status === tab.value}
            className={`filter-tab${status === tab.value ? ' active' : ''}`}
            onClick={() => setStatus(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Count */}
      {!loading && !error && (
        <p className="text-sm text-muted mb-4">
          {totalItems === 0
            ? 'No tasks found'
            : `${totalItems} task${totalItems !== 1 ? 's' : ''} found`}
        </p>
      )}

      {/* Error */}
      {error && (
        <div style={{
          background: 'var(--priority-high-bg)',
          color: 'var(--priority-high-color)',
          padding: '12px 16px',
          borderRadius: 'var(--radius)',
          marginBottom: 16,
          fontSize: 14,
        }}>
          {error} &mdash;{' '}
          <button style={{ textDecoration: 'underline', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
            onClick={fetchTasks}>
            Retry
          </button>
        </div>
      )}

      {/* Task list */}
      {loading ? (
        <LoadingSkeleton count={PAGE_SIZE} />
      ) : tasks.length === 0 ? (
        <EmptyState
          title={debouncedSearch ? 'No tasks match your search' : 'No tasks here'}
          description={
            debouncedSearch
              ? `Try a different keyword or clear the search.`
              : `Create your first task to get started.`
          }
          action={
            !debouncedSearch && (
              <button id="tasks-empty-new" className="btn btn-primary btn-sm" onClick={handleNew}>
                <IconPlus size={15} /> New Task
              </button>
            )
          }
        />
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

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
        message={`Are you sure you want to delete "${deleteTask?.title}"? This cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteOpen(false)}
        loading={deleting}
      />
    </>
  )
}
