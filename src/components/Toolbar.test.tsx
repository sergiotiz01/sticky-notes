import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Toolbar } from './Toolbar'
import { NotesProvider } from '../store/NotesContext'
import { makeNote } from '../test/fixtures'
import { NOTE_COLORS } from '../types'
import { saveNotes } from '../storage'

describe('Toolbar', () => {
  it('shows a plural count on an empty board', () => {
    render(
      <NotesProvider>
        <Toolbar onNewNote={() => {}} />
      </NotesProvider>,
    )
    expect(screen.getByText(/0 notes$/)).toBeInTheDocument()
  })

  it('shows a singular note count', () => {
    saveNotes([makeNote()])
    render(
      <NotesProvider>
        <Toolbar onNewNote={() => {}} />
      </NotesProvider>,
    )
    expect(screen.getByText(/1 note$/)).toBeInTheDocument()
  })

  it('selects a colour and requests a new note', async () => {
    const user = userEvent.setup()
    const onNewNote = vi.fn()
    render(
      <NotesProvider>
        <Toolbar onNewNote={onNewNote} />
      </NotesProvider>,
    )
    const pink = screen.getByRole('radio', { name: `Choose ${NOTE_COLORS[1]}` })
    await user.click(pink)
    expect(pink).toHaveAttribute('aria-checked', 'true')
    await user.click(screen.getByRole('button', { name: 'New note' }))
    expect(onNewNote).toHaveBeenCalledTimes(1)
  })
})
