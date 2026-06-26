import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import StatusBadge from '../src/components/StatusBadge'
import PriorityBadge from '../src/components/PriorityBadge'

describe('StatusBadge', () => {
  it('renders "To Do" for TODO status', () => {
    render(<StatusBadge status="TODO" />)
    expect(screen.getByText('To Do')).toBeInTheDocument()
  })

  it('renders "In Progress" for IN_PROGRESS status', () => {
    render(<StatusBadge status="IN_PROGRESS" />)
    expect(screen.getByText('In Progress')).toBeInTheDocument()
  })

  it('renders "Done" for DONE status', () => {
    render(<StatusBadge status="DONE" />)
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('defaults to "To Do" for unknown status', () => {
    render(<StatusBadge status="UNKNOWN" />)
    expect(screen.getByText('To Do')).toBeInTheDocument()
  })
})

describe('PriorityBadge', () => {
  it('renders "Low" for LOW priority', () => {
    render(<PriorityBadge priority="LOW" />)
    expect(screen.getByText(/Low/)).toBeInTheDocument()
  })

  it('renders "Medium" for MEDIUM priority', () => {
    render(<PriorityBadge priority="MEDIUM" />)
    expect(screen.getByText(/Medium/)).toBeInTheDocument()
  })

  it('renders "High" for HIGH priority', () => {
    render(<PriorityBadge priority="HIGH" />)
    expect(screen.getByText(/High/)).toBeInTheDocument()
  })
})
