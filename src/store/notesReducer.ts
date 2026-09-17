import type { Action, Note } from '../types'

export function maxZIndex(notes: Note[]): number {
  return notes.reduce((max, note) => Math.max(max, note.zIndex), 0)
}

export function notesReducer(state: Note[], action: Action): Note[] {
  switch (action.type) {
    case 'hydrate':
      return action.notes
    case 'add':
      return [...state, { ...action.note, zIndex: maxZIndex(state) + 1 }]
    case 'patch':
      return state.map((note) =>
        note.id === action.id ? { ...note, ...action.patch } : note,
      )
    case 'remove':
      return state.filter((note) => note.id !== action.id)
    case 'bringToFront': {
      const top = maxZIndex(state)
      const current = state.find((note) => note.id === action.id)
      if (!current || current.zIndex === top) return state
      return state.map((note) =>
        note.id === action.id ? { ...note, zIndex: top + 1 } : note,
      )
    }
    default:
      return state
  }
}
