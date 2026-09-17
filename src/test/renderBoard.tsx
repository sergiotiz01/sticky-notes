import { render } from '@testing-library/react'
import { vi } from 'vitest'
import { Board } from '../components/Board'
import { NotesProvider } from '../store/NotesContext'
import { makeDomRect } from './fixtures'

export const BOARD_BOX = { x: 0, y: 0, width: 1200, height: 800 }
export const TRASH_BOX = { x: 490, y: 730, width: 220, height: 48 }

export function mockBoardRects() {
  return vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    if (this.classList.contains('board')) {
      return makeDomRect(BOARD_BOX.x, BOARD_BOX.y, BOARD_BOX.width, BOARD_BOX.height)
    }
    if (this.classList.contains('trash-slot')) {
      return makeDomRect(TRASH_BOX.x, TRASH_BOX.y, TRASH_BOX.width, TRASH_BOX.height)
    }
    return makeDomRect(0, 0, 0, 0)
  })
}

export function renderBoard() {
  return render(
    <NotesProvider>
      <Board />
    </NotesProvider>,
  )
}

export function noteTranslate(el: HTMLElement) {
  const match = el.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/)
  if (!match) {
    throw new Error(`expected translate() on ${el.style.transform}`)
  }
  return { x: Number(match[1]), y: Number(match[2]) }
}
