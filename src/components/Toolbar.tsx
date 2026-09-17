import { NOTE_COLORS } from '../types'
import { useNotes } from '../store/NotesContext'

type ToolbarProps = {
  onNewNote: () => void
}

export function Toolbar({ onNewNote }: ToolbarProps) {
  const { nextColor, setNextColor, notes } = useNotes()

  return (
    <header className="toolbar">
      <div className="toolbar__brand">
        <span className="toolbar__mark" aria-hidden="true" />
        <h1>Sticky Notes</h1>
      </div>

      <p className="toolbar__hint">
        Drag on the board to draw a note · {notes.length} {notes.length === 1 ? 'note' : 'notes'}
      </p>

      <div className="toolbar__actions">
        <div className="color-row" role="radiogroup" aria-label="Colour for new notes">
          {NOTE_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              role="radio"
              aria-checked={nextColor === color}
              aria-label={`Choose ${color}`}
              className={nextColor === color ? 'swatch is-selected' : 'swatch'}
              style={{ backgroundColor: color }}
              onClick={() => setNextColor(color)}
            />
          ))}
        </div>
        <button type="button" className="toolbar__new" onClick={onNewNote}>
          New note
        </button>
      </div>
    </header>
  )
}
