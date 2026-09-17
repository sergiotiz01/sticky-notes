import { memo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { applyResize, clampRectToBoard, rectsOverlap } from '../geometry'
import { usePointerSession } from '../hooks/usePointerSession'
import { useNotes } from '../store/NotesContext'
import { NOTE_COLORS, type Note as NoteModel, type Rect, type ResizeHandle } from '../types'

const HANDLES: ResizeHandle[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']

type NoteProps = {
  note: NoteModel
  boardSize: { width: number; height: number }
  getTrashRect: () => Rect | null
  onOverTrashChange: (noteId: string | null) => void
}

export const Note = memo(function Note({
  note,
  boardSize,
  getTrashRect,
  onOverTrashChange,
}: NoteProps) {
  const { dispatch } = useNotes()
  const startPointer = usePointerSession()
  const startRectRef = useRef<Rect>(note)
  const [draft, setDraft] = useState<Rect | null>(null)
  const [overTrash, setOverTrash] = useState(false)
  const textRef = useRef<HTMLTextAreaElement>(null)

  const geometry = draft ?? note

  function hitTestTrash(rect: Rect): boolean {
    const trash = getTrashRect()
    return trash ? rectsOverlap(rect, trash) : false
  }

  function updateDraft(next: Rect, checkTrash: boolean) {
    setDraft(next)
    if (!checkTrash) return
    const hovering = hitTestTrash(next)
    setOverTrash(hovering)
    onOverTrashChange(hovering ? note.id : null)
  }

  function commitGeometry(next: Rect, droppedOnTrash: boolean) {
    setDraft(null)
    setOverTrash(false)
    onOverTrashChange(null)
    if (droppedOnTrash) {
      dispatch({ type: 'remove', id: note.id })
      return
    }
    dispatch({
      type: 'patch',
      id: note.id,
      patch: clampRectToBoard(next, boardSize.width, boardSize.height),
    })
  }

  function onHeaderPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return
    dispatch({ type: 'bringToFront', id: note.id })
    startRectRef.current = { x: note.x, y: note.y, width: note.width, height: note.height }
    startPointer(event, {
      onMove: (delta) => {
        const next = clampRectToBoard(
          {
            ...startRectRef.current,
            x: startRectRef.current.x + delta.x,
            y: startRectRef.current.y + delta.y,
          },
          boardSize.width,
          boardSize.height,
        )
        updateDraft(next, true)
      },
      onEnd: (delta) => {
        const next = clampRectToBoard(
          {
            ...startRectRef.current,
            x: startRectRef.current.x + delta.x,
            y: startRectRef.current.y + delta.y,
          },
          boardSize.width,
          boardSize.height,
        )
        commitGeometry(next, hitTestTrash(next))
      },
    })
  }

  function onResizePointerDown(
    event: ReactPointerEvent<HTMLSpanElement>,
    handle: ResizeHandle,
  ) {
    if (event.button !== 0) return
    dispatch({ type: 'bringToFront', id: note.id })
    startRectRef.current = { x: note.x, y: note.y, width: note.width, height: note.height }
    startPointer(event, {
      onMove: (delta) => {
        updateDraft(
          applyResize(
            startRectRef.current,
            delta.x,
            delta.y,
            handle,
            boardSize.width,
            boardSize.height,
          ),
          false,
        )
      },
      onEnd: (delta) => {
        commitGeometry(
          applyResize(
            startRectRef.current,
            delta.x,
            delta.y,
            handle,
            boardSize.width,
            boardSize.height,
          ),
          false,
        )
      },
    })
  }

  function onBodyPointerDown() {
    dispatch({ type: 'bringToFront', id: note.id })
    queueMicrotask(() => textRef.current?.focus())
  }

  return (
    <article
      className={overTrash ? 'note is-over-trash' : 'note'}
      style={{
        width: geometry.width,
        height: geometry.height,
        transform: overTrash
          ? `translate(${geometry.x}px, ${geometry.y}px) scale(0.96)`
          : `translate(${geometry.x}px, ${geometry.y}px)`,
        zIndex: note.zIndex,
        backgroundColor: note.color,
      }}
      aria-label="Sticky note"
      onPointerDown={() => dispatch({ type: 'bringToFront', id: note.id })}
    >
      <div
        className="note__header"
        onPointerDown={onHeaderPointerDown}
        title="Drag to move"
      >
        <div className="color-row color-row--compact" role="radiogroup" aria-label="Note colour">
          {NOTE_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              role="radio"
              aria-checked={note.color === color}
              aria-label={`Set colour ${color}`}
              className={note.color === color ? 'swatch swatch--tiny is-selected' : 'swatch swatch--tiny'}
              style={{ backgroundColor: color }}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => dispatch({ type: 'patch', id: note.id, patch: { color } })}
            />
          ))}
        </div>
      </div>

      <div className="note__body" onPointerDown={onBodyPointerDown}>
        <textarea
          ref={textRef}
          className="note__text"
          value={note.text}
          placeholder="Write something…"
          aria-label="Note text"
          onChange={(event) =>
            dispatch({ type: 'patch', id: note.id, patch: { text: event.target.value } })
          }
          onKeyDown={(event) => {
            if (event.key === 'Escape') event.currentTarget.blur()
          }}
          onPointerDown={(event) => {
            event.stopPropagation()
            dispatch({ type: 'bringToFront', id: note.id })
          }}
        />
      </div>

      {HANDLES.map((handle) => (
        <span
          key={handle}
          className={`note__handle note__handle--${handle}`}
          onPointerDown={(event) => onResizePointerDown(event, handle)}
        />
      ))}
    </article>
  )
})
