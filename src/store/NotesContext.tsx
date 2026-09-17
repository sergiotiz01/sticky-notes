import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
} from 'react'
import { nextCascadeOrigin } from '../geometry'
import { loadNotes, saveNotes } from '../storage'
import {
  DEFAULT_NOTE_HEIGHT,
  DEFAULT_NOTE_WIDTH,
  NOTE_COLORS,
  type Action,
  type Note,
} from '../types'
import { maxZIndex, notesReducer } from './notesReducer'

type NotesContextValue = {
  notes: Note[]
  dispatch: Dispatch<Action>
  nextColor: string
  setNextColor: (color: string) => void
  addDefaultNote: (boardWidth: number, boardHeight: number) => void
}

const NotesContext = createContext<NotesContextValue | null>(null)

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, dispatch] = useReducer(notesReducer, undefined, () => loadNotes() ?? [])
  const [nextColor, setNextColor] = useState<string>(NOTE_COLORS[0])

  useEffect(() => {
    queueMicrotask(() => saveNotes(notes))
  }, [notes])

  const addDefaultNote = useCallback(
    (boardWidth: number, boardHeight: number) => {
      const origin = nextCascadeOrigin(notes.length)
      const width = Math.min(DEFAULT_NOTE_WIDTH, boardWidth)
      const height = Math.min(DEFAULT_NOTE_HEIGHT, boardHeight)
      const note: Note = {
        id: crypto.randomUUID(),
        x: Math.min(origin.x, Math.max(0, boardWidth - width)),
        y: Math.min(origin.y, Math.max(0, boardHeight - height)),
        width,
        height,
        text: '',
        color: nextColor,
        zIndex: maxZIndex(notes) + 1,
      }
      dispatch({ type: 'add', note })
    },
    [notes, nextColor],
  )

  const value = useMemo(
    () => ({ notes, dispatch, nextColor, setNextColor, addDefaultNote }),
    [notes, nextColor, addDefaultNote],
  )

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
}

export function useNotes(): NotesContextValue {
  const value = useContext(NotesContext)
  if (!value) {
    throw new Error('useNotes must be used within NotesProvider')
  }
  return value
}
