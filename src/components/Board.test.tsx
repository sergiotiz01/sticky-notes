import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_NOTE_HEIGHT, DEFAULT_NOTE_WIDTH, MIN_NOTE_HEIGHT, MIN_NOTE_WIDTH, NOTE_COLORS } from '../types'
import { mockBoardRects, noteTranslate, renderBoard } from '../test/renderBoard'
import { pointerDown, pointerDrag, pointerMove, pointerUp } from '../test/pointer'

vi.mock('../storage', () => ({
  loadNotes: () => null,
  saveNotes: () => {},
}))

describe('Board interactions', () => {
  beforeEach(() => {
    mockBoardRects()
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
    expect(screen.getByText(/1 note$/)).toBeInTheDocument()
  })

  it('creates a note in the colour selected on the toolbar', async () => {
    const user = userEvent.setup()
    renderBoard()
    await user.click(screen.getByRole('radio', { name: `Choose ${NOTE_COLORS[2]}` }))
    await user.click(screen.getByRole('button', { name: 'New note' }))

    const note = await screen.findByRole('article', { name: 'Sticky note' })
    expect(note).toHaveStyle({ backgroundColor: 'rgb(197, 227, 200)' })
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

  it('snaps a small drag-create up to the minimum note size', async () => {
    renderBoard()
    const board = document.querySelector('.board')
    if (!board) throw new Error('board missing')

    pointerDrag(board, { x: 50, y: 50 }, { x: 80, y: 85 })

    const note = await screen.findByRole('article', { name: 'Sticky note' })
    expect(note).toHaveStyle({
      width: `${MIN_NOTE_WIDTH}px`,
      height: `${MIN_NOTE_HEIGHT}px`,
    })
  })

  it('does not create a note from a tiny click-drag', () => {
    renderBoard()
    const board = document.querySelector('.board')
    if (!board) throw new Error('board missing')

    pointerDrag(board, { x: 40, y: 40 }, { x: 44, y: 43 })

    expect(screen.queryByRole('article', { name: 'Sticky note' })).not.toBeInTheDocument()
  })

  it('does not create a note with the right mouse button', () => {
    renderBoard()
    const board = document.querySelector('.board')
    if (!board) throw new Error('board missing')

    pointerDown(board, { x: 80, y: 80 }, 1, 2)
    pointerMove({ x: 240, y: 240 })
    pointerUp({ x: 240, y: 240 })

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

  it('keeps a moved note on the board', async () => {
    renderBoard()
    screen.getByRole('button', { name: 'New note' }).click()
    const note = await screen.findByRole('article', { name: 'Sticky note' })
    const header = within(note).getByTitle('Drag to move')

    pointerDrag(header, { x: 60, y: 50 }, { x: -400, y: -400 })

    expect(noteTranslate(note)).toEqual({ x: 0, y: 0 })
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

  it('resizes a note from the east handle without changing height', async () => {
    renderBoard()
    screen.getByRole('button', { name: 'New note' }).click()
    const note = await screen.findByRole('article', { name: 'Sticky note' })
    const handle = note.querySelector('.note__handle--e')
    if (!handle) throw new Error('resize handle missing')

    pointerDrag(handle, { x: 250, y: 100 }, { x: 310, y: 140 })

    expect(note).toHaveStyle({
      width: `${DEFAULT_NOTE_WIDTH + 60}px`,
      height: `${DEFAULT_NOTE_HEIGHT}px`,
    })
  })

  it('highlights the trash while a note overlaps it, then deletes on drop', async () => {
    renderBoard()
    screen.getByRole('button', { name: 'New note' }).click()
    const note = await screen.findByRole('article', { name: 'Sticky note' })
    const header = within(note).getByTitle('Drag to move')

    pointerDown(header, { x: 60, y: 50 })
    pointerMove({ x: 600, y: 700 })

    expect(note).toHaveClass('is-over-trash')
    expect(screen.getByLabelText('Trash zone')).toHaveTextContent('Release to delete')

    pointerUp({ x: 600, y: 700 })

    expect(screen.queryByRole('article', { name: 'Sticky note' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('Trash zone')).toHaveTextContent('Drop here to delete')
  })

  it('does not delete a note dropped away from the trash', async () => {
    renderBoard()
    screen.getByRole('button', { name: 'New note' }).click()
    const note = await screen.findByRole('article', { name: 'Sticky note' })
    const header = within(note).getByTitle('Drag to move')

    pointerDrag(header, { x: 60, y: 50 }, { x: 180, y: 120 })

    expect(screen.getByRole('article', { name: 'Sticky note' })).toBeInTheDocument()
  })

  it('edits note text and blurs on Escape', async () => {
    const user = userEvent.setup()
    renderBoard()
    screen.getByRole('button', { name: 'New note' }).click()
    const textarea = await screen.findByLabelText('Note text')

    await user.type(textarea, 'buy milk')
    expect(textarea).toHaveValue('buy milk')

    await user.keyboard('{Escape}')
    expect(textarea).not.toHaveFocus()
  })

  it('changes an existing note colour', async () => {
    const user = userEvent.setup()
    renderBoard()
    screen.getByRole('button', { name: 'New note' }).click()
    const note = await screen.findByRole('article', { name: 'Sticky note' })

    await user.click(within(note).getByRole('radio', { name: `Set colour ${NOTE_COLORS[3]}` }))
    expect(note).toHaveStyle({ backgroundColor: 'rgb(201, 217, 242)' })
  })

  it('brings a covered note to the front', async () => {
    renderBoard()
    screen.getByRole('button', { name: 'New note' }).click()
    screen.getByRole('button', { name: 'New note' }).click()

    const notes = await screen.findAllByRole('article', { name: 'Sticky note' })
    expect(notes).toHaveLength(2)
    expect(notes[0].style.zIndex).toBe('1')
    expect(notes[1].style.zIndex).toBe('2')

    fireEvent.pointerDown(notes[0])
    expect(notes[0].style.zIndex).toBe('3')
  })
})
