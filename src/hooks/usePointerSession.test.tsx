import { render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { usePointerSession } from './usePointerSession'
import { pointerCancel, pointerDown, pointerMove, pointerUp } from '../test/pointer'

function Probe() {
  const start = usePointerSession()
  const [log, setLog] = useState<string[]>([])

  return (
    <div
      data-testid="pad"
      onPointerDown={(event) =>
        start(event, {
          onMove: (delta) => setLog((items) => [...items, `move:${delta.x},${delta.y}`]),
          onEnd: (delta) => setLog((items) => [...items, `end:${delta.x},${delta.y}`]),
        })
      }
    >
      {log.join('|')}
    </div>
  )
}

describe('usePointerSession', () => {
  it('reports move and end deltas from the original pointerdown', () => {
    render(<Probe />)
    const pad = screen.getByTestId('pad')

    pointerDown(pad, { x: 10, y: 20 })
    pointerMove({ x: 40, y: 50 })
    pointerUp({ x: 55, y: 80 })

    expect(pad).toHaveTextContent('move:30,30|end:45,60')
  })

  it('ignores events from a different pointer', () => {
    render(<Probe />)
    const pad = screen.getByTestId('pad')

    pointerDown(pad, { x: 0, y: 0 }, 1)
    pointerMove({ x: 10, y: 10 }, 2)
    pointerUp({ x: 10, y: 10 }, 1)

    expect(pad).toHaveTextContent('end:10,10')
    expect(pad).not.toHaveTextContent('move:')
  })

  it('ends the session on pointercancel', () => {
    render(<Probe />)
    const pad = screen.getByTestId('pad')

    pointerDown(pad, { x: 5, y: 5 })
    pointerCancel({ x: 8, y: 9 })

    expect(pad).toHaveTextContent('end:3,4')
  })

  it('does not deliver moves after the host unmounts', () => {
    const onMove = vi.fn()

    function Host() {
      const start = usePointerSession()
      return (
        <div
          data-testid="pad"
          onPointerDown={(event) => start(event, { onMove })}
        />
      )
    }

    const { unmount } = render(<Host />)
    pointerDown(screen.getByTestId('pad'), { x: 0, y: 0 })
    unmount()
    pointerMove({ x: 40, y: 12 })
    expect(onMove).not.toHaveBeenCalled()
  })
})
