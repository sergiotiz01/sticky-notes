import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { mockBoardRects } from './test/renderBoard'

describe('App', () => {
  beforeEach(() => {
    mockBoardRects()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the board chrome', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Sticky Notes' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'New note' })).toBeInTheDocument()
    expect(screen.getByLabelText('Trash zone')).toBeInTheDocument()
  })
})
