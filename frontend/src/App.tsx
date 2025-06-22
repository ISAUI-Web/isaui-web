import { Routes, Route } from 'react-router-dom'
import FormPreinscripcion from './pages/formPreinscripcion'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<FormPreinscripcion />} />
      {/* Podés agregar más rutas como <Route path="/" element={<Inicio />} /> */}
    </Routes>
  )
}