'use client'

import { useEffect, useState } from 'react'
import TaskForm from './TaskForm'
import ActivityLog from './ActivityLog'
import AttachmentList from './AttachmentList'
import { IconX } from './Icons'
import { activitiesApi, usersApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

export default function TaskModal({ isOpen, task, onSubmit, onClose, loading }) {
  const { user: currentUser } = useAuth()
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'ROLE_ADMIN'

  const [activities, setActivities] = useState([])
  const [loadingActivities, setLoadingActivities] = useState(false)
  
  const [usersList, setUsersList] = useState([])

  const refreshActivities = () => {
    if (task?.id) {
      activitiesApi.getForTask(task.id)
        .then(res => {
          let all = res.data?.data || []
          all = all.map(a => {
            if (typeof a.changesJson === 'string') {
              try { a.changes = JSON.parse(a.changesJson) } catch (e) { a.changes = [] }
            } else if (!a.changes) {
              a.changes = []
            }
            return a
          })
          setActivities(all)
        })
    }
  }

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  // Load activities from backend when modal opens for an existing task
  useEffect(() => {
    if (isOpen) {
      if (isAdmin && usersList.length === 0) {
        usersApi.getAll().then(res => setUsersList(res.data?.data || []))
      }
      
      if (task?.id) {
        setLoadingActivities(true)
        activitiesApi.getForTask(task.id)
          .then(res => {
            let all = res.data?.data || []
            all = all.map(a => {
              if (typeof a.changesJson === 'string') {
                try { a.changes = JSON.parse(a.changesJson) } catch (e) { a.changes = [] }
              } else if (!a.changes) {
                a.changes = []
              }
              return a
            })
            setActivities(all)
          })
          .catch(err => console.error('Failed to load activities', err))
          .finally(() => setLoadingActivities(false))
      } else {
        setActivities([])
      }
    }
  }, [isOpen, task?.id, isAdmin])

  // Wrap onSubmit: log is written by the parent, then we refresh the list here
  const handleSubmit = async (...args) => {
    await onSubmit(...args)
    // Small delay so the log entry has been written before we re-read it
    setTimeout(refreshActivities, 100)
  }

  if (!isOpen) return null

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal-box">
        <div className="modal-header">
          <h2 id="task-modal-title" className="modal-title">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            id="task-modal-close"
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            aria-label="Close modal"
          >
            <IconX size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <TaskForm
            initialData={task}
            onSubmit={handleSubmit}
            onCancel={onClose}
            loading={loading}
            isAdmin={isAdmin}
            usersList={usersList}
            currentUser={currentUser}
          />
          
          {task && (
            <>
              <AttachmentList 
                attachments={task.attachments || []} 
              />
              <ActivityLog 
                activities={activities} 
                loading={loadingActivities} 
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
