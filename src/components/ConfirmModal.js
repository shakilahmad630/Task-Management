'use client'

import { useEffect } from 'react'
import { IconAlertTriangle, IconX } from './Icons'

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, loading }) {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div
      className="modal-overlay"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="modal-box" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ color: 'var(--priority-high-color)' }}>
              <IconAlertTriangle size={20} />
            </div>
            <h2 id="confirm-modal-title" className="modal-title">{title || 'Are you sure?'}</h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onCancel} aria-label="Cancel">
            <IconX size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ paddingTop: 8, paddingBottom: 8 }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {message || 'This action cannot be undone.'}
          </p>
        </div>

        <div className="modal-footer">
          <button
            id="confirm-cancel-btn"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            id="confirm-delete-btn"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
