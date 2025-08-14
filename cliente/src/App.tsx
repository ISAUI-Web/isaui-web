import { Routes, Route } from 'react-router-dom'
import FormPreinscripcion from './pages/formPreinscripcion'
import Principal from './pages/principal'
import Login from './pages/login'
import AdminMain from './pages/adminMain'
import Aspirantes from './pages/aspirantesMain'
import DetalleAspirante from './pages/detalleAspirante'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Principal />} />
      <Route path="/preinscripcion" element={<FormPreinscripcion />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<AdminMain />} />
      <Route path="/aspirantes" element={<Aspirantes />} />
      <Route path="/detAspirante/:id" element={<DetalleAspirante />} />
      {/* Podés agregar más rutas aquí */}
      {/* Podés agregar más rutas como <Route path="/" element={<Inicio />} /> */}
    </Routes>
  )
}