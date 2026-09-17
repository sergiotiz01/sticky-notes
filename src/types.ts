export const NOTE_COLORS = [
  '#f6e27a',
  '#f7c1c1',
  '#c5e3c8',
  '#c9d9f2',
  '#e6d0f5',
  '#f7d9b0',
] as const

export const MIN_NOTE_WIDTH = 140
export const MIN_NOTE_HEIGHT = 120
export const DEFAULT_NOTE_WIDTH = 220
export const DEFAULT_NOTE_HEIGHT = 200

export type NoteColor = (typeof NOTE_COLORS)[number]

export type Note = {
  id: string
  x: number
  y: number
  width: number
  height: number
  text: string
  color: string
  zIndex: number
}

export type Rect = {
  x: number
  y: number
  width: number
  height: number
}

export type Point = {
  x: number
  y: number
}

export type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

export type Action =
  | { type: 'add'; note: Note }
  | { type: 'patch'; id: string; patch: Partial<Omit<Note, 'id'>> }
  | { type: 'remove'; id: string }
  | { type: 'bringToFront'; id: string }
  | { type: 'hydrate'; notes: Note[] }
