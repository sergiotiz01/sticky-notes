import { Board } from './components/Board'
import { NotesProvider } from './store/NotesContext'

export default function App() {
  return (
    <NotesProvider>
      <Board />
    </NotesProvider>
  )
}
