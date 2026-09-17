import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { NotesProvider, useNotes } from './NotesContext'
import { loadNotes, saveNotes } from '../storage'
import { makeNote } from '../test/fixtures'
import { NOTE_COLORS } from '../types'

function NotesProbe() {
  const { notes, nextColor, setNextColor, addDefaultNote, dispatch } = useNotes()
  return (
    <div>
      <p data-testid="count">{notes.length}</p>
      <p data-testid="color">{nextColor}</p>
      <p data-testid="text">{notes[0]?.text ?? ''}</p>
      <p data-testid="note-color">{notes[0]?.color ?? ''}</p>
      <p data-testid="z">{notes[0]?.zIndex ?? ''}</p>
      <button type="button" onClick={() => addDefaultNote(800, 600)}>
        add
      </button>
      <button type="button" onClick={() => setNextColor(NOTE_COLORS[1])}>
        pink
      </button>
      <button
        type="button"
        onClick={() => notes[0] && dispatch({ type: 'patch', id: notes[0].id, patch: { text: 'edited' } })}
      >
        edit
      </button>
    </div>
  )
}

describe('NotesProvider', () => {
  it('throws when useNotes is used outside the provider', () => {
    function Bare() {
      useNotes()
      return null
    }
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Bare />)).toThrow('useNotes must be used within NotesProvider')
    error.mockRestore()
  })

  it('hydrates notes from localStorage', () => {
    saveNotes([makeNote({ id: 'stored', text: 'from disk' })])
    render(
      <NotesProvider>
        <NotesProbe />
      </NotesProvider>,
    )
    expect(screen.getByTestId('text')).toHaveTextContent('from disk')
    expect(screen.getByTestId('count')).toHaveTextContent('1')
  })

  it('saves notes after a change', async () => {
    const user = userEvent.setup()
    render(
      <NotesProvider>
        <NotesProbe />
      </NotesProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'add' }))
    await vi.waitFor(() => {
      expect(loadNotes()).toHaveLength(1)
    })
  })

  it('creates a cascaded note in the selected colour', async () => {
    const user = userEvent.setup()
    render(
      <NotesProvider>
        <NotesProbe />
      </NotesProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'pink' }))
    await user.click(screen.getByRole('button', { name: 'add' }))
    expect(screen.getByTestId('note-color')).toHaveTextContent(NOTE_COLORS[1])
    expect(screen.getByTestId('z')).toHaveTextContent('1')
  })
})
