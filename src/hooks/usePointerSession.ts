import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import type { Point } from '../types'

type Handlers = {
  onMove?: (delta: Point, point: Point, event: PointerEvent) => void
  onEnd?: (delta: Point, point: Point, event: PointerEvent) => void
}

type Session = {
  pointerId: number
  origin: Point
  captureEl: Element | null
  onMove?: Handlers['onMove']
  onEnd?: Handlers['onEnd']
}

/**
 * Starts a pointer-capture drag session. Delta is always relative to pointerdown.
 * Window listeners keep Firefox/Chrome behaviour aligned even if the pointer
 * leaves the original target.
 */
export function usePointerSession() {
  const sessionRef = useRef<Session | null>(null)
  const listenersRef = useRef<{
    move: (event: PointerEvent) => void
    up: (event: PointerEvent) => void
  } | null>(null)

  if (!listenersRef.current) {
    const move = (event: PointerEvent) => {
      const session = sessionRef.current
      if (!session || event.pointerId !== session.pointerId) return
      session.onMove?.(
        { x: event.clientX - session.origin.x, y: event.clientY - session.origin.y },
        { x: event.clientX, y: event.clientY },
        event,
      )
    }

    const up = (event: PointerEvent) => {
      const session = sessionRef.current
      if (!session || event.pointerId !== session.pointerId) return

      if (
        session.captureEl instanceof HTMLElement &&
        session.captureEl.hasPointerCapture(session.pointerId)
      ) {
        session.captureEl.releasePointerCapture(session.pointerId)
      }

      session.onEnd?.(
        { x: event.clientX - session.origin.x, y: event.clientY - session.origin.y },
        { x: event.clientX, y: event.clientY },
        event,
      )
      sessionRef.current = null
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }

    listenersRef.current = { move, up }
  }

  useEffect(() => {
    return () => {
      const listeners = listenersRef.current
      if (!listeners) return
      window.removeEventListener('pointermove', listeners.move)
      window.removeEventListener('pointerup', listeners.up)
      window.removeEventListener('pointercancel', listeners.up)
    }
  }, [])

  return useCallback((event: ReactPointerEvent<Element>, handlers: Handlers) => {
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)

    const alreadyActive = sessionRef.current !== null
    sessionRef.current = {
      pointerId: event.pointerId,
      origin: { x: event.clientX, y: event.clientY },
      captureEl: event.currentTarget,
      onMove: handlers.onMove,
      onEnd: handlers.onEnd,
    }

    if (!alreadyActive && listenersRef.current) {
      window.addEventListener('pointermove', listenersRef.current.move)
      window.addEventListener('pointerup', listenersRef.current.up)
      window.addEventListener('pointercancel', listenersRef.current.up)
    }
  }, [])
}
