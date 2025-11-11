import './App.css'
import Pages from './pages/index.jsx'          // <- trocado: "@/pages/index.jsx"
import { Toaster } from './components/ui/toaster' // <- trocado: "@/components/ui/toaster"

function App() {
  return (
    <>
      <Pages />
      <Toaster />
    </>
  )
}

export default App