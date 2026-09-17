import { render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Board } from './Board'
import { NotesProvider } from '../store/NotesContext'
import { DEFAULT_NOTE_HEIGHT, DEFAULT_NOTE_WIDTH } from '../types'
import { makeDomRect } from '../test/fixtures'
import { pointerDrag } from '../test/pointer'

vi.mock('../storage', () => ({
  loadNotes: () => null,
  saveNotes: () => {},
}))

const BOARD = { x: 0, y: 0, width: 1200, height: 800 }
const TRASH = { x: 490, y: 730, width: 220, height: 48 }

function renderBoard() {
  return render(
    <NotesProvider>
      <Board />
    </NotesProvider>,
  )
}

function noteTranslate(el: HTMLElement) {
  const match = el.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/)
  if (!match) {
    throw new Error(`expected translate() on ${el.style.transform}`)
  }
  return { x: Number(match[1]), y: Number(match[2]) }
}

describe('Board interactions', () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      if (this.classList.contains('board')) {
        return makeDomRect(BOARD.x, BOARD.y, BOARD.width, BOARD.height)
      }
      if (this.classList.contains('trash-slot')) {
        return makeDomRect(TRASH.x, TRASH.y, TRASH.width, TRASH.height)
      }
      return makeDomRect(0, 0, 0, 0)
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates a default-size note from the toolbar button', async () => {
    renderBoard()
    expect(screen.queryByRole('article', { name: 'Sticky note' })).not.toBeInTheDocument()

    screen.getByRole('button', { name: 'New note' }).click()

    const note = await screen.findByRole('article', { name: 'Sticky note' })
    expect(note).toHaveStyle({
      width: `${DEFAULT_NOTE_WIDTH}px`,
      height: `${DEFAULT_NOTE_HEIGHT}px`,
    })
  })

  it('creates a note by dragging on the empty board', async () => {
    renderBoard()
    const board = document.querySelector('.board')
    if (!board) throw new Error('board missing')

    pointerDrag(board, { x: 80, y: 90 }, { x: 280, y: 260 })

    const note = await screen.findByRole('article', { name: 'Sticky note' })
    expect(noteTranslate(note)).toEqual({ x: 80, y: 90 })
    expect(note).toHaveStyle({ width: '200px', height: '170px' })
  })

  it('does not create a note from a tiny click-drag', () => {
    renderBoard()
    const board = document.querySelector('.board')
    if (!board) throw new Error('board missing')

    pointerDrag(board, { x: 40, y: 40 }, { x: 44, y: 43 })

    expect(screen.queryByRole('article', { name: 'Sticky note' })).not.toBeInTheDocument()
  })

  it('moves a note by dragging its header', async () => {
    renderBoard()
    screen.getByRole('button', { name: 'New note' }).click()
    const note = await screen.findByRole('article', { name: 'Sticky note' })
    const origin = noteTranslate(note)

    const header = within(note).getByTitle('Drag to move')
    pointerDrag(header, { x: origin.x + 20, y: origin.y + 10 }, { x: origin.x + 100, y: origin.y + 70 })

    expect(noteTranslate(note)).toEqual({ x: origin.x + 80, y: origin.y + 60 })
  })

  it('resizes a note from the south-east handle', async () => {
    renderBoard()
    screen.getByRole('button', { name: 'New note' }).click()
    const note = await screen.findByRole('article', { name: 'Sticky note' })
    const handle = note.querySelector('.note__handle--se')
    if (!handle) throw new Error('resize handle missing')

    pointerDrag(handle, { x: 250, y: 230 }, { x: 330, y: 280 })

    expect(note).toHaveStyle({
      width: `${DEFAULT_NOTE_WIDTH + 80}px`,
      height: `${DEFAULT_NOTE_HEIGHT + 50}px`,
    })
  })

  it('deletes a note dropped on the trash zone', async () => {
    renderBoard()
    screen.getByRole('button', { name: 'New note' }).click()
    const note = await screen.findByRole('article', { name: 'Sticky note' })
    const header = within(note).getByTitle('Drag to move')

    pointerDrag(header, { x: 60, y: 50 }, { x: 600, y: 700 })

    expect(screen.queryByRole('article', { name: 'Sticky note' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('Trash zone')).toHaveTextContent('Drop here to delete')
  })
})
