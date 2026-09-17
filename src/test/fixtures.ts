import type { Note } from '../types'

export function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 'note-1',
    x: 40,
    y: 40,
    width: 200,
    height: 160,
    text: '',
    color: '#f6e27a',
    zIndex: 1,
    ...overrides,
  }
}

export function makeDomRect(x: number, y: number, width: number, height: number): DOMRect {
  return {
    x,
    y,
    width,
    height,
    top: y,
    left: x,
    right: x + width,
    bottom: y + height,
    toJSON: () => ({}),
  } as DOMRect
}
