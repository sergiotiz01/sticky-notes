import { describe, expect, it } from 'vitest'
import { makeNote } from '../test/fixtures'
import { maxZIndex, notesReducer } from './notesReducer'

describe('maxZIndex', () => {
  it('returns 0 for an empty board', () => {
    expect(maxZIndex([])).toBe(0)
  })

  it('returns the highest z-index among notes', () => {
    expect(maxZIndex([makeNote({ zIndex: 1 }), makeNote({ id: 'b', zIndex: 4 })])).toBe(4)
  })
})

describe('notesReducer', () => {
  const first = makeNote({ id: 'a', zIndex: 1 })
  const second = makeNote({ id: 'b', x: 80, zIndex: 2 })

  it('replaces state on hydrate', () => {
    expect(notesReducer([first], { type: 'hydrate', notes: [second] })).toEqual([second])
  })

  it('appends a note on add', () => {
    expect(notesReducer([first], { type: 'add', note: second })).toEqual([
      first,
      { ...second, zIndex: 2 },
    ])
  })

  it('assigns a z-index above the current top when adding', () => {
    const incoming = makeNote({ id: 'c', zIndex: 1 })
    const next = notesReducer([first, second], { type: 'add', note: incoming })
    expect(next[2]).toMatchObject({ id: 'c', zIndex: 3 })
  })

  it('patches only the matching note', () => {
    const next = notesReducer([first, second], {
      type: 'patch',
      id: 'a',
      patch: { text: 'hello', x: 12 },
    })
    expect(next[0]).toMatchObject({ id: 'a', text: 'hello', x: 12 })
    expect(next[1]).toEqual(second)
  })

  it('removes a note by id', () => {
    expect(notesReducer([first, second], { type: 'remove', id: 'a' })).toEqual([second])
  })

  it('leaves state unchanged when removing a missing id', () => {
    const state = [first]
    expect(notesReducer(state, { type: 'remove', id: 'missing' })).toEqual(state)
  })

  it('raises a note above the current top', () => {
    const next = notesReducer([first, second], { type: 'bringToFront', id: 'a' })
    expect(next.find((note) => note.id === 'a')?.zIndex).toBe(3)
    expect(next.find((note) => note.id === 'b')?.zIndex).toBe(2)
  })

  it('is a no-op when the note is already on top', () => {
    const state = [first, second]
    expect(notesReducer(state, { type: 'bringToFront', id: 'b' })).toBe(state)
  })

  it('is a no-op when the note does not exist', () => {
    const state = [first]
    expect(notesReducer(state, { type: 'bringToFront', id: 'missing' })).toBe(state)
  })

  it('does not mutate the previous state array', () => {
    const state = [first]
    const next = notesReducer(state, { type: 'patch', id: 'a', patch: { text: 'x' } })
    expect(next).not.toBe(state)
    expect(state[0].text).toBe('')
  })

  it('leaves state unchanged when patching a missing id', () => {
    const state = [first]
    const next = notesReducer(state, { type: 'patch', id: 'missing', patch: { text: 'nope' } })
    expect(next).toEqual(state)
    expect(next[0]).toBe(first)
  })

  it('replaces state with an empty list on hydrate', () => {
    expect(notesReducer([first, second], { type: 'hydrate', notes: [] })).toEqual([])
  })
})
