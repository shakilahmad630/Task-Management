import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import TaskCard from '../src/components/TaskCard'

const mockTask = {
  id: 1,
  title: 'Fix login bug',
  description: 'The login page shows a 500 error on submit.',
  status: 'IN_PROGRESS',
  priority: 'HIGH',
  dueDate: '2099-12-31',
}

const noop = jest.fn()

describe('TaskCard', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders the task title', () => {
    render(<TaskCard task={mockTask} onEdit={noop} onDelete={noop} onToggleStatus={noop} />)
    expect(screen.getByText('Fix login bug')).toBeInTheDocument()
  })

  it('renders the task description', () => {
    render(<TaskCard task={mockTask} onEdit={noop} onDelete={noop} onToggleStatus={noop} />)
    expect(screen.getByText(/500 error/)).toBeInTheDocument()
  })

  it('calls onToggleStatus when checkbox is clicked', () => {
    const toggle = jest.fn()
    render(<TaskCard task={mockTask} onEdit={noop} onDelete={noop} onToggleStatus={toggle} />)
    fireEvent.click(screen.getByRole('button', { name: /mark as complete/i }))
    expect(toggle).toHaveBeenCalledWith(mockTask)
  })

  it('calls onEdit when edit button is clicked', () => {
    const edit = jest.fn()
    render(<TaskCard task={mockTask} onEdit={edit} onDelete={noop} onToggleStatus={noop} />)
    fireEvent.click(screen.getByTitle('Edit task'))
    expect(edit).toHaveBeenCalledWith(mockTask)
  })

  it('calls onDelete when delete button is clicked', () => {
    const del = jest.fn()
    render(<TaskCard task={mockTask} onEdit={noop} onDelete={del} onToggleStatus={noop} />)
    fireEvent.click(screen.getByTitle('Delete task'))
    expect(del).toHaveBeenCalledWith(mockTask)
  })

  it('shows done styling when status is DONE', () => {
    const doneTask = { ...mockTask, status: 'DONE' }
    render(<TaskCard task={doneTask} onEdit={noop} onDelete={noop} onToggleStatus={noop} />)
    const title = screen.getByText('Fix login bug')
    expect(title).toHaveClass('done')
  })
})
