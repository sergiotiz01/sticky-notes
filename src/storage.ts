import type { Note } from './types'
import { NOTE_COLORS } from './types'

const STORAGE_KEY = 'sticky-notes:v1'

function isNote(value: unknown): value is Note {
  if (typeof value !== 'object' || value === null) return false
  const note = value as Record<string, unknown>
  return (
    typeof note.id === 'string' &&
    typeof note.x === 'number' &&
    Number.isFinite(note.x) &&
    typeof note.y === 'number' &&
    Number.isFinite(note.y) &&
    typeof note.width === 'number' &&
    Number.isFinite(note.width) &&
    typeof note.height === 'number' &&
    Number.isFinite(note.height) &&
    typeof note.text === 'string' &&
    typeof note.color === 'string' &&
    typeof note.zIndex === 'number' &&
    Number.isFinite(note.zIndex)
  )
}

export function loadNotes(): Note[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    const notes = parsed.filter(isNote)
    return notes.map((note) => ({
      ...note,
      color: (NOTE_COLORS as readonly string[]).includes(note.color)
        ? note.color
        : NOTE_COLORS[0],
    }))
  } catch {
    return null
  }
}

export function saveNotes(notes: Note[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  } catch {
    // Quota or private-mode restrictions should not crash the board.
  }
}
