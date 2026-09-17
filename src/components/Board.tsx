import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { clampRectToBoard, normalizeRect } from '../geometry'
import { usePointerSession } from '../hooks/usePointerSession'
import { useNotes } from '../store/NotesContext'
import { maxZIndex } from '../store/notesReducer'
import {
  MIN_NOTE_HEIGHT,
  MIN_NOTE_WIDTH,
  type Note as NoteModel,
  type Rect,
} from '../types'
import { Note } from './Note'
import { Toolbar } from './Toolbar'
import { TrashZone } from './TrashZone'

const CREATE_DRAG_THRESHOLD = 12

export function Board() {
  const { notes, dispatch, nextColor, addDefaultNote } = useNotes()
  const startPointer = usePointerSession()
  const boardRef = useRef<HTMLDivElement>(null)
  const trashRef = useRef<HTMLDivElement>(null)
  const originRef = useRef({ x: 0, y: 0 })
  const [boardSize, setBoardSize] = useState({ width: 1024, height: 700 })
  const [draftRect, setDraftRect] = useState<Rect | null>(null)
  const [overTrashId, setOverTrashId] = useState<string | null>(null)

  const measureBoard = useCallback(() => {
    const node = boardRef.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    setBoardSize({ width: rect.width, height: rect.height })
  }, [])

  useEffect(() => {
    measureBoard()
    window.addEventListener('resize', measureBoard)
    return () => window.removeEventListener('resize', measureBoard)
  }, [measureBoard])

  const clientToBoard = useCallback((clientX: number, clientY: number) => {
    const rect = boardRef.current?.getBoundingClientRect()
    if (!rect) return { x: clientX, y: clientY }
    return { x: clientX - rect.left, y: clientY - rect.top }
  }, [])

  const getTrashRect = useCallback((): Rect | null => {
    const board = boardRef.current
    const trash = trashRef.current
    if (!board || !trash) return null
    const boardBox = board.getBoundingClientRect()
    const trashBox = trash.getBoundingClientRect()
    return {
      x: trashBox.left - boardBox.left,
      y: trashBox.top - boardBox.top,
      width: trashBox.width,
      height: trashBox.height,
    }
  }, [])

  function onBoardPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return
    if (event.target !== boardRef.current) return
    const origin = clientToBoard(event.clientX, event.clientY)
    originRef.current = origin
    startPointer(event, {
      onMove: (_delta, point) => {
        const current = clientToBoard(point.x, point.y)
        setDraftRect(normalizeRect(originRef.current.x, originRef.current.y, current.x, current.y))
      },
      onEnd: (_delta, point) => {
        const current = clientToBoard(point.x, point.y)
        const raw = normalizeRect(originRef.current.x, originRef.current.y, current.x, current.y)
        setDraftRect(null)
        if (raw.width < CREATE_DRAG_THRESHOLD && raw.height < CREATE_DRAG_THRESHOLD) return

        const sized = {
          ...raw,
          width: Math.max(raw.width, MIN_NOTE_WIDTH),
          height: Math.max(raw.height, MIN_NOTE_HEIGHT),
        }
        const rect = clampRectToBoard(sized, boardSize.width, boardSize.height)
        const note: NoteModel = {
          id: crypto.randomUUID(),
          ...rect,
          text: '',
          color: nextColor,
          zIndex: maxZIndex(notes) + 1,
        }
        dispatch({ type: 'add', note })
      },
    })
  }

  return (
    <div className="app">
      <Toolbar onNewNote={() => addDefaultNote(boardSize.width, boardSize.height)} />
      <div
        ref={boardRef}
        className="board"
        onPointerDown={onBoardPointerDown}
      >
        {notes.map((note) => (
          <Note
            key={note.id}
            note={note}
            boardSize={boardSize}
            getTrashRect={getTrashRect}
            onOverTrashChange={setOverTrashId}
          />
        ))}

        {draftRect && (
          <div
            className="draft-rect"
            style={{
              transform: `translate(${draftRect.x}px, ${draftRect.y}px)`,
              width: draftRect.width,
              height: draftRect.height,
            }}
          />
        )}

        <div ref={trashRef} className="trash-slot">
          <TrashZone active={overTrashId !== null} />
        </div>
      </div>
    </div>
  )
}
