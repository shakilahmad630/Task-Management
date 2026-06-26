import { IconChevronLeft, IconChevronRight } from './Icons'

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  // Build page number list (show at most 5 pages with ellipsis)
  const getPages = () => {
    const pages = []
    const delta = 2
    const left  = currentPage - delta
    const right = currentPage + delta + 1

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i < right)) {
        pages.push(i)
      }
    }

    const result = []
    let prev = null
    for (const page of pages) {
      if (prev && page - prev > 1) result.push('...')
      result.push(page)
      prev = page
    }
    return result
  }

  const pages = getPages()

  return (
    <div className="pagination" role="navigation" aria-label="Pagination">
      {/* Previous */}
      <button
        id="pagination-prev"
        className="page-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <IconChevronLeft size={14} />
      </button>

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} style={{ color: 'var(--text-muted)', padding: '0 4px' }}>…</span>
        ) : (
          <button
            key={p}
            id={`pagination-page-${p}`}
            className={`page-btn${currentPage === p ? ' active' : ''}`}
            onClick={() => onPageChange(p)}
            aria-label={`Page ${p}`}
            aria-current={currentPage === p ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        id="pagination-next"
        className="page-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <IconChevronRight size={14} />
      </button>
    </div>
  )
}
