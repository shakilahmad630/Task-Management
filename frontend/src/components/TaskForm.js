'use client'

import { useState, useEffect } from 'react'
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '@/lib/utils'

const EMPTY = {
  title:       '',
  description: '',
  status:      'TODO',
  priority:    'MEDIUM',
  dueDate:     '',
  attachments: [],
  assignedToEmail: '',
}

function validate(values) {
  const errors = {}
  if (!values.title.trim())         errors.title    = 'Title is required.'
  if (values.title.length > 255)    errors.title    = 'Title must be ≤ 255 characters.'
  if (!values.description.trim())   errors.description = 'Description is required.'
  if (!values.status)               errors.status   = 'Status is required.'
  if (!values.priority)             errors.priority = 'Priority is required.'
  if (!values.dueDate)              errors.dueDate  = 'Due Date is required.'
  return errors
}

export default function TaskForm({ initialData, onSubmit, onCancel, loading, isAdmin, usersList, currentUser }) {
  const [values, setValues]   = useState(EMPTY)
  const [errors, setErrors]   = useState({})
  const [touched, setTouched] = useState({})

  useEffect(() => {
    if (initialData) {
      setValues({
        title:       initialData.title       || '',
        description: initialData.description || '',
        status:      initialData.status      || 'TODO',
        priority:    initialData.priority    || 'MEDIUM',
        dueDate:     initialData.dueDate
          ? initialData.dueDate.substring(0, 10) // normalize to YYYY-MM-DD
          : '',
        attachments: [], // New attachments added during this edit
        assignedToEmail: initialData.user?.email || currentUser?.email || '',
      })
    } else {
      setValues({ ...EMPTY, assignedToEmail: currentUser?.email || '' })
    }
    setErrors({})
    setTouched({})
  }, [initialData, currentUser])

  const set = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }))
    setTouched((t) => ({ ...t, [field]: true }))
    // clear error on change
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }))
  }

  const blur = (field) => () => {
    setTouched((t) => ({ ...t, [field]: true }))
    const errs = validate({ ...values })
    if (errs[field]) setErrors((er) => ({ ...er, [field]: errs[field] }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate(values)
    if (Object.keys(errs).length) {
      setErrors(errs)
      setTouched({ title: true, description: true, status: true, priority: true, dueDate: true })
      return
    }
    const payload = { ...values }
    if (!payload.dueDate) delete payload.dueDate
    
    // Pass attachments separately or as part of payload based on parent logic
    onSubmit(payload)
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      setValues((v) => ({ ...v, attachments: [...v.attachments, ...files] }))
    }
  }

  const removeAttachment = (index) => {
    setValues((v) => {
      const newAttachments = [...v.attachments]
      newAttachments.splice(index, 1)
      return { ...v, attachments: newAttachments }
    })
  }

  const fieldClass = (name) =>
    `form-input${touched[name] && errors[name] ? ' error' : ''}`

  return (
    <form id="task-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-form">
        {/* Title */}
        <div className="form-group">
          <label className="form-label" htmlFor="task-title">
            Title <span style={{ color: 'var(--priority-high-color)' }}>*</span>
          </label>
          <input
            id="task-title"
            className={fieldClass('title')}
            type="text"
            placeholder="e.g. Fix login bug"
            value={values.title}
            onChange={set('title')}
            onBlur={blur('title')}
            maxLength={255}
            disabled={loading}
          />
          {touched.title && errors.title && (
            <span className="form-error">{errors.title}</span>
          )}
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label" htmlFor="task-desc">
            Description <span style={{ color: 'var(--priority-high-color)' }}>*</span>
          </label>
          <textarea
            id="task-desc"
            className={fieldClass('description')}
            placeholder="Add more details about this task…"
            value={values.description}
            onChange={set('description')}
            onBlur={blur('description')}
            disabled={loading}
            rows={3}
          />
          {touched.description && errors.description && (
            <span className="form-error">{errors.description}</span>
          )}
        </div>

        {/* Status + Priority */}
        {isAdmin && usersList?.length > 0 && (
          <div className="form-group">
            <label className="form-label" htmlFor="task-assignee">
              Assign To
            </label>
            <select
              id="task-assignee"
              className={fieldClass('assignedToEmail')}
              value={values.assignedToEmail}
              onChange={set('assignedToEmail')}
              disabled={loading}
            >
              {usersList.map((u) => (
                <option key={u.email} value={u.email}>
                  {u.name || u.username || u.email}
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="task-status">Status</label>
            <select
              id="task-status"
              className="form-select"
              value={values.status}
              onChange={set('status')}
              disabled={loading}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-priority">Priority</label>
            <select
              id="task-priority"
              className="form-select"
              value={values.priority}
              onChange={set('priority')}
              disabled={loading}
            >
              {PRIORITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Due Date */}
        <div className="form-group">
          <label className="form-label" htmlFor="task-due">
            Due Date <span style={{ color: 'var(--priority-high-color)' }}>*</span>
          </label>
          <input
            id="task-due"
            className={fieldClass('dueDate')}
            type="date"
            value={values.dueDate}
            onChange={set('dueDate')}
            onBlur={blur('dueDate')}
            disabled={loading}
          />
          {touched.dueDate && errors.dueDate && (
            <span className="form-error">{errors.dueDate}</span>
          )}
        </div>

        {/* Attachments */}
        <div className="form-group">
          <label className="form-label" htmlFor="task-attachments">Attachments</label>
          <input
            id="task-attachments"
            className="form-input"
            type="file"
            multiple
            onChange={handleFileChange}
            disabled={loading}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          />
          {values.attachments && values.attachments.length > 0 && (
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {values.attachments.map((file, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', background: 'var(--surface-hover)', borderRadius: 4 }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{file.name}</span>
                  <button type="button" onClick={() => removeAttachment(idx)} style={{ background: 'none', border: 'none', color: 'var(--danger-color, #ef4444)', cursor: 'pointer', fontSize: '0.8rem' }}>Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
          <button
            id="task-form-cancel"
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            id="task-form-submit"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving…' : initialData ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>
    </form>
  )
}
