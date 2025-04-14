import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Buses from './pages/Buses'
import Subidas from './pages/Subidas'
import Bajadas from './pages/Bajadas'
import Inicios from './pages/Inicios'
import Destinos from './pages/Destinos'
import Rutas from './pages/Rutas'

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/buses" element={<Buses />} />
        <Route path="/subidas" element={<Subidas />} />
        <Route path="/bajadas" element={<Bajadas />} />
        <Route path="/inicios" element={<Inicios />} />
        <Route path="/destinos" element={<Destinos />} />
        <Route path="/rutas" element={<Rutas />} />
      </Routes>
    </Router>
  )
}

export default App
