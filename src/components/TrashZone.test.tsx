import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TrashZone } from './TrashZone'

describe('TrashZone', () => {
  it('shows the idle prompt', () => {
    render(<TrashZone active={false} />)
    const zone = screen.getByLabelText('Trash zone')
    expect(zone).toHaveTextContent('Drop here to delete')
    expect(zone).not.toHaveClass('is-active')
  })

  it('highlights when a note is over it', () => {
    render(<TrashZone active />)
    const zone = screen.getByLabelText('Trash zone')
    expect(zone).toHaveTextContent('Release to delete')
    expect(zone).toHaveClass('is-active')
  })
})
