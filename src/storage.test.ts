import { describe, expect, it, vi } from 'vitest'
import { loadNotes, saveNotes } from './storage'
import { makeNote } from './test/fixtures'

const STORAGE_KEY = 'sticky-notes:v1'

describe('saveNotes / loadNotes', () => {
  it('returns null when nothing is stored', () => {
    expect(loadNotes()).toBeNull()
  })

  it('round-trips valid notes', () => {
    const notes = [makeNote({ id: 'a', text: 'keep me', zIndex: 3 })]
    saveNotes(notes)
    expect(loadNotes()).toEqual(notes)
  })

  it('returns null for corrupt JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not-json')
    expect(loadNotes()).toBeNull()
  })

  it('returns null when the stored value is not an array', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: 'nope' }))
    expect(loadNotes()).toBeNull()
  })

  it('drops entries that are not notes', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        makeNote({ id: 'good' }),
        { id: 12 },
        null,
        { ...makeNote({ id: 'bad-x' }), x: Number.NaN },
      ]),
    )
    expect(loadNotes()?.map((note) => note.id)).toEqual(['good'])
  })

  it('falls back to the default colour when a note colour is unknown', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([makeNote({ color: '#not-a-note' })]),
    )
    expect(loadNotes()?.[0]?.color).toBe('#f6e27a')
  })

  it('does not throw when localStorage write fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    expect(() => saveNotes([makeNote()])).not.toThrow()
  })
})
