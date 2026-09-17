import { describe, expect, it } from 'vitest'
import {
  applyResize,
  clamp,
  clampRectToBoard,
  nextCascadeOrigin,
  normalizeRect,
  rectsOverlap,
} from './geometry'
import { MIN_NOTE_HEIGHT, MIN_NOTE_WIDTH } from './types'

describe('clamp', () => {
  it('returns the value when it is inside the range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })

  it('clamps to the lower and upper bounds', () => {
    expect(clamp(-2, 0, 10)).toBe(0)
    expect(clamp(99, 0, 10)).toBe(10)
  })
})

describe('normalizeRect', () => {
  it('keeps a top-left to bottom-right drag unchanged', () => {
    expect(normalizeRect(10, 20, 110, 80)).toEqual({
      x: 10,
      y: 20,
      width: 100,
      height: 60,
    })
  })

  it('normalizes a drag toward the top-left', () => {
    expect(normalizeRect(110, 80, 10, 20)).toEqual({
      x: 10,
      y: 20,
      width: 100,
      height: 60,
    })
  })
})

describe('rectsOverlap', () => {
  const box = { x: 0, y: 0, width: 100, height: 80 }

  it('detects overlapping rectangles', () => {
    expect(rectsOverlap(box, { x: 50, y: 40, width: 20, height: 20 })).toBe(true)
  })

  it('returns false when rectangles only touch an edge', () => {
    expect(rectsOverlap(box, { x: 100, y: 0, width: 40, height: 40 })).toBe(false)
  })

  it('treats identical and nested rectangles as overlapping', () => {
    expect(rectsOverlap(box, box)).toBe(true)
    expect(rectsOverlap(box, { x: 10, y: 10, width: 10, height: 10 })).toBe(true)
  })

  it('returns false when rectangles are separate', () => {
    expect(rectsOverlap(box, { x: 200, y: 200, width: 10, height: 10 })).toBe(false)
  })
})

describe('clampRectToBoard', () => {
  it('keeps a note that already fits', () => {
    expect(
      clampRectToBoard({ x: 20, y: 30, width: 200, height: 160 }, 800, 600),
    ).toEqual({ x: 20, y: 30, width: 200, height: 160 })
  })

  it('enforces the minimum size', () => {
    const next = clampRectToBoard({ x: 0, y: 0, width: 40, height: 40 }, 800, 600)
    expect(next.width).toBe(MIN_NOTE_WIDTH)
    expect(next.height).toBe(MIN_NOTE_HEIGHT)
  })

  it('pulls a note that sits past the right or bottom edge back onto the board', () => {
    expect(
      clampRectToBoard({ x: 900, y: 700, width: 200, height: 160 }, 800, 600),
    ).toEqual({ x: 600, y: 440, width: 200, height: 160 })
  })

  it('clamps negative origins to the top-left', () => {
    expect(
      clampRectToBoard({ x: -80, y: -40, width: 200, height: 160 }, 800, 600),
    ).toEqual({ x: 0, y: 0, width: 200, height: 160 })
  })
})

describe('applyResize', () => {
  const start = { x: 100, y: 80, width: 200, height: 160 }
  const board = { width: 800, height: 600 }

  it('grows only width from the east handle', () => {
    expect(applyResize(start, 50, 80, 'e', board.width, board.height)).toEqual({
      x: 100,
      y: 80,
      width: 250,
      height: 160,
    })
  })

  it('moves the top edge from the north handle', () => {
    expect(applyResize(start, 0, -20, 'n', board.width, board.height)).toEqual({
      x: 100,
      y: 60,
      width: 200,
      height: 180,
    })
  })

  it('keeps the right edge fixed when shrinking from the west past the minimum', () => {
    const next = applyResize(start, 180, 0, 'w', board.width, board.height)
    expect(next.width).toBe(MIN_NOTE_WIDTH)
    expect(next.x + next.width).toBe(start.x + start.width)
  })

  it('moves the origin when resizing from the north-west handle', () => {
    expect(applyResize(start, -20, -10, 'nw', board.width, board.height)).toEqual({
      x: 80,
      y: 70,
      width: 220,
      height: 170,
    })
  })

  it('does not shrink below the minimum size', () => {
    const next = applyResize(start, -400, -400, 'se', board.width, board.height)
    expect(next.width).toBe(MIN_NOTE_WIDTH)
    expect(next.height).toBe(MIN_NOTE_HEIGHT)
    expect(next.x).toBe(start.x)
    expect(next.y).toBe(start.y)
  })

  it('keeps the resized note inside the board', () => {
    const next = applyResize(start, 2000, 2000, 'se', board.width, board.height)
    expect(next.x + next.width).toBeLessThanOrEqual(board.width)
    expect(next.y + next.height).toBeLessThanOrEqual(board.height)
  })
})

describe('nextCascadeOrigin', () => {
  it('offsets each new note and wraps after twelve', () => {
    expect(nextCascadeOrigin(0)).toEqual({ x: 48, y: 36 })
    expect(nextCascadeOrigin(1)).toEqual({ x: 76, y: 64 })
    expect(nextCascadeOrigin(12)).toEqual(nextCascadeOrigin(0))
  })
})
