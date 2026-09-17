import { fireEvent } from '@testing-library/react'

type Point = { x: number; y: number }

export function pointerDrag(
  target: Element,
  from: Point,
  to: Point,
  pointerId = 1,
) {
  pointerDown(target, from, pointerId)
  pointerMove(to, pointerId)
  pointerUp(to, pointerId)
}

export function pointerDown(target: Element, point: Point, pointerId = 1, button = 0) {
  fireEvent.pointerDown(target, {
    pointerId,
    button,
    clientX: point.x,
    clientY: point.y,
    bubbles: true,
  })
}

export function pointerMove(point: Point, pointerId = 1) {
  fireEvent.pointerMove(window, {
    pointerId,
    clientX: point.x,
    clientY: point.y,
    bubbles: true,
  })
}

export function pointerUp(point: Point, pointerId = 1) {
  fireEvent.pointerUp(window, {
    pointerId,
    clientX: point.x,
    clientY: point.y,
    bubbles: true,
  })
}

export function pointerCancel(point: Point, pointerId = 1) {
  fireEvent.pointerCancel(window, {
    pointerId,
    clientX: point.x,
    clientY: point.y,
    bubbles: true,
  })
}
