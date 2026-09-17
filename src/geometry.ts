import {
  MIN_NOTE_HEIGHT,
  MIN_NOTE_WIDTH,
  type Rect,
  type ResizeHandle,
} from './types'

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function normalizeRect(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): Rect {
  const x = Math.min(x1, x2)
  const y = Math.min(y1, y2)
  return { x, y, width: Math.abs(x2 - x1), height: Math.abs(y2 - y1) }
}

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  )
}

export function clampRectToBoard(rect: Rect, boardWidth: number, boardHeight: number): Rect {
  const width = clamp(rect.width, MIN_NOTE_WIDTH, Math.max(MIN_NOTE_WIDTH, boardWidth))
  const height = clamp(rect.height, MIN_NOTE_HEIGHT, Math.max(MIN_NOTE_HEIGHT, boardHeight))
  return {
    x: clamp(rect.x, 0, Math.max(0, boardWidth - width)),
    y: clamp(rect.y, 0, Math.max(0, boardHeight - height)),
    width,
    height,
  }
}

export function applyResize(
  start: Rect,
  dx: number,
  dy: number,
  handle: ResizeHandle,
  boardWidth: number,
  boardHeight: number,
): Rect {
  let left = start.x
  let top = start.y
  let right = start.x + start.width
  let bottom = start.y + start.height

  if (handle.includes('e')) right = start.x + start.width + dx
  if (handle.includes('w')) left = start.x + dx
  if (handle.includes('s')) bottom = start.y + start.height + dy
  if (handle.includes('n')) top = start.y + dy

  if (right - left < MIN_NOTE_WIDTH) {
    if (handle.includes('w')) left = right - MIN_NOTE_WIDTH
    else right = left + MIN_NOTE_WIDTH
  }
  if (bottom - top < MIN_NOTE_HEIGHT) {
    if (handle.includes('n')) top = bottom - MIN_NOTE_HEIGHT
    else bottom = top + MIN_NOTE_HEIGHT
  }

  left = clamp(left, 0, boardWidth)
  top = clamp(top, 0, boardHeight)
  right = clamp(right, 0, boardWidth)
  bottom = clamp(bottom, 0, boardHeight)

  if (right - left < MIN_NOTE_WIDTH) {
    if (handle.includes('w')) left = clamp(right - MIN_NOTE_WIDTH, 0, boardWidth)
    else right = clamp(left + MIN_NOTE_WIDTH, 0, boardWidth)
  }
  if (bottom - top < MIN_NOTE_HEIGHT) {
    if (handle.includes('n')) top = clamp(bottom - MIN_NOTE_HEIGHT, 0, boardHeight)
    else bottom = clamp(top + MIN_NOTE_HEIGHT, 0, boardHeight)
  }

  return {
    x: left,
    y: top,
    width: Math.max(MIN_NOTE_WIDTH, right - left),
    height: Math.max(MIN_NOTE_HEIGHT, bottom - top),
  }
}

export function nextCascadeOrigin(count: number): { x: number; y: number } {
  const step = count % 12
  return { x: 48 + step * 28, y: 36 + step * 28 }
}
