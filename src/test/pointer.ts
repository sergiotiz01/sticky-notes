import { fireEvent } from '@testing-library/react'

export function pointerDrag(
  target: Element,
  from: { x: number; y: number },
  to: { x: number; y: number },
  pointerId = 1,
) {
  fireEvent.pointerDown(target, {
    pointerId,
    button: 0,
    clientX: from.x,
    clientY: from.y,
    bubbles: true,
  })
  fireEvent.pointerMove(window, {
    pointerId,
    clientX: to.x,
    clientY: to.y,
    bubbles: true,
  })
  fireEvent.pointerUp(window, {
    pointerId,
    clientX: to.x,
    clientY: to.y,
    bubbles: true,
  })
}
