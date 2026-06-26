'use client'

// Note: I will use custom SVGs since Heroicons is not available.

const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 20, height: 20 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.536 4.536 0 01-6.41-6.41l10.905-10.905a3 3 0 014.243 4.243L9.53 14.25a1.5 1.5 0 01-2.122-2.122L13.3 6.236" />
  </svg>
)

export default function AttachmentList({ attachments = [], onRemove, loading = false }) {
  if (loading) {
    return <p style={{ color: 'var(--text-muted)' }}>Loading attachments...</p>
  }

  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className="attachment-list" style={{ marginTop: 16 }}>
      <h4 style={{ fontSize: '0.95rem', marginBottom: 8, color: 'var(--text-primary)' }}>Attachments</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {attachments.map((file, idx) => (
          <div key={file.id || idx} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '8px 12px',
            backgroundColor: 'var(--bg-body)',
            borderRadius: '6px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
              <span style={{ color: 'var(--text-muted)' }}><FileIcon /></span>
              <a 
                href={file.url || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: 'var(--primary)', 
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: '0.9rem'
                }}
              >
                {file.filename || file.name}
              </a>
            </div>
            {onRemove && (
              <button 
                type="button" 
                onClick={() => onRemove(file)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--danger-color, #ef4444)',
                  cursor: 'pointer',
                  padding: 4
                }}
                title="Remove attachment"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
