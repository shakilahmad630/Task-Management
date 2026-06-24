'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { usersApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/utils'
import { IconSearch, IconEdit, IconTrash, IconX, IconAlertTriangle } from '@/components/Icons'
import toast from 'react-hot-toast'
import LoadingSkeleton from '@/components/LoadingSkeleton'

export default function UsersPage() {
  const { user: currentUser, loading: authLoading } = useAuth()
  const router = useRouter()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  // Edit User Modal
  const [editOpen, setEditOpen] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'USER' })
  const [saving, setSaving] = useState(false)

  // Delete Confirmation Modal
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteUser, setDeleteUser] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Security Check: Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== 'ADMIN')) {
      router.replace('/dashboard')
    }
  }, [currentUser, authLoading, router])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await usersApi.getAll()
      const data = res.data.data || res.data
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentUser?.role === 'ADMIN' || currentUser?.role === 'ROLE_ADMIN') {
      fetchUsers()
    }
  }, [currentUser, fetchUsers])

  // Filters
  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase()
    return (
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.role && u.role.toLowerCase().includes(term))
    )
  })

  // Edit user handler
  const handleEditClick = (u) => {
    setEditUser(u)
    setEditForm({
      name: u.name || '',
      email: u.email || '',
      role: u.role || 'USER'
    })
    setEditOpen(true)
  }

  const handleEditSave = async (e) => {
    e.preventDefault()
    if (!editForm.name.trim() || !editForm.email.trim()) {
      toast.error('Name and Email are required.')
      return
    }
    setSaving(true)
    try {
      await usersApi.update(editUser.id, editForm)
      toast.success('User updated successfully!')
      setEditOpen(false)
      fetchUsers()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  // Delete user handler
  const handleDeleteClick = (u) => {
    if (u.id === currentUser?.id) {
      toast.error('You cannot delete your own admin account!')
      return
    }
    setDeleteUser(u)
    setDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    setDeleting(true)
    try {
      await usersApi.delete(deleteUser.id)
      toast.success(`User ${deleteUser.name || deleteUser.email} has been deleted. All associated tasks were also removed.`)
      setDeleteOpen(false)
      fetchUsers()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  if (authLoading || (!currentUser || currentUser.role !== 'ADMIN')) {
    return <LoadingSkeleton count={3} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Search Header */}
      <div className="toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <div className="search-wrap" style={{ flex: 1, maxWidth: 360, margin: 0 }}>
          <span className="search-icon"><IconSearch size={15} /></span>
          <input
            id="user-search"
            type="search"
            className="search-input"
            placeholder="Search users by name, email, role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search users"
          />
        </div>
        <div className="text-muted text-sm">
          {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div style={{
          background: 'var(--priority-high-bg)',
          color: 'var(--priority-high-color)',
          padding: '12px 16px',
          borderRadius: 'var(--radius)',
          fontSize: 14,
        }}>
          {error} &mdash;{' '}
          <button style={{ textDecoration: 'underline', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
            onClick={fetchUsers}>
            Retry
          </button>
        </div>
      )}

      {/* Users Table */}
      {loading ? (
        <LoadingSkeleton count={5} />
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">
          <h3>No users found</h3>
          <p className="text-muted text-sm">Try searching for a different keyword.</p>
        </div>
      ) : (
        <div className="table-responsive" style={{
          background: 'var(--card-bg)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border-color)',
          overflowX: 'auto',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px', minWidth: 500 }}>
            <thead>
              <tr style={{
                background: 'var(--bg-hover)',
                borderBottom: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                fontWeight: '600'
              }}>
                <th style={{ padding: '12px 16px' }}>Name</th>
                <th style={{ padding: '12px 16px' }}>Email</th>
                <th style={{ padding: '12px 16px' }}>Role</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const isSelf = u.id === currentUser?.id
                return (
                  <tr key={u.id} style={{
                    borderBottom: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    transition: 'background-color 0.2s',
                  }} className="table-row">
                    <td style={{ padding: '14px 16px', fontWeight: '500' }}>
                      {u.name} {isSelf && <span style={{
                        fontSize: 10,
                        padding: '1px 5px',
                        background: 'var(--primary-bg)',
                        color: 'var(--primary)',
                        borderRadius: 4,
                        marginLeft: 4,
                        fontWeight: 'normal'
                      }}>You</span>}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontSize: 11,
                        fontWeight: '600',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        background: (u.role === 'ADMIN' || u.role === 'ROLE_ADMIN') ? 'rgba(168, 85, 247, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                        color: (u.role === 'ADMIN' || u.role === 'ROLE_ADMIN') ? '#a855f7' : '#3b82f6',
                        border: (u.role === 'ADMIN' || u.role === 'ROLE_ADMIN') ? '1px solid rgba(168, 85, 247, 0.25)' : '1px solid rgba(59, 130, 246, 0.25)'
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          id={`user-edit-${u.id}`}
                          className="btn btn-ghost btn-icon"
                          onClick={() => handleEditClick(u)}
                          title="Edit User"
                          aria-label="Edit User"
                        >
                          <IconEdit size={15} />
                        </button>
                        <button
                          id={`user-delete-${u.id}`}
                          className="btn btn-ghost btn-icon"
                          onClick={() => handleDeleteClick(u)}
                          disabled={isSelf}
                          title={isSelf ? 'Cannot delete yourself' : 'Delete User'}
                          aria-label="Delete User"
                          style={{
                            color: isSelf ? 'var(--text-muted)' : 'var(--priority-high-color)',
                            opacity: isSelf ? 0.4 : 1,
                            cursor: isSelf ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <IconTrash size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit User Modal */}
      {editOpen && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setEditOpen(false) }}
        >
          <div className="modal-box" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h2 className="modal-title">Edit User Details</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setEditOpen(false)} aria-label="Close modal">
                <IconX size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="edit-user-name">Name</label>
                  <input
                    id="edit-user-name"
                    type="text"
                    className="form-input"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    disabled={saving}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="edit-user-email">Email</label>
                  <input
                    id="edit-user-email"
                    type="email"
                    className="form-input"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    disabled={saving}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="edit-user-role">Role</label>
                  <select
                    id="edit-user-role"
                    className="form-select"
                    value={editForm.role}
                    onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                    disabled={saving}
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer" style={{ marginTop: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteOpen && (
        <div
          className="modal-overlay"
          role="alertdialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteOpen(false) }}
        >
          <div className="modal-box" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ color: 'var(--priority-high-color)' }}>
                  <IconAlertTriangle size={20} />
                </div>
                <h2 className="modal-title">Delete User</h2>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setDeleteOpen(false)} aria-label="Close modal">
                <IconX size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 10 }}>
              <p style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: '500' }}>
                Are you sure you want to delete user &ldquo;{deleteUser?.name || deleteUser?.email}&rdquo;?
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                This will delete their user account permanently. <strong>All tasks associated with this user will also be deleted cascade.</strong> This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeleteOpen(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete User & Tasks'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
