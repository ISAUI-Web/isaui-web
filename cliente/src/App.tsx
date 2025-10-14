import { Routes, Route } from 'react-router-dom'
import FormPreinscripcion from './pages/formPreinscripcion'
import Principal from './pages/principal'
import Login from './pages/login'
import AdminMain from './pages/adminMain'
import Aspirantes from './pages/aspirantesMain'
import DetalleAspirante from './pages/detalleAspirante'
import Mantenimiento from './pages/mantenimiento'
import AspirantesMatriculacion from './pages/aspirantesMatriculacion'
import Cupos from './pages/cupos'
import Legajo from './pages/legajo'
import Reportes from './pages/reportes'
import FormMatriculacion from './pages/formMatriculacion'
import LoginDni from './pages/loginDNI'
import DetalleLegajo from './pages/detalleLegajo'
import DetalleLegajoProfesor from './pages/detalleLegajoProfesor'
import CrearLegajoAlumno from './pages/crearAlumno'
import CrearLegajoProfesor from './pages/crearProfesor'


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Principal />} />
      <Route path="/preinscripcion" element={<FormPreinscripcion />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<AdminMain />} />
      <Route path="/aspirantes" element={<Aspirantes />} />
      <Route path="/detAspirante/:id" element={<DetalleAspirante />} />
      <Route path="/mantenimiento" element={<Mantenimiento />} />
      <Route path="/matriculacion" element={<AspirantesMatriculacion />} />
      <Route path="/cupos" element={<Cupos />} />
      <Route path="/legajo" element={<Legajo />} />
      <Route path="/reportes" element={<Reportes />} />
      <Route path="/formMatriculacion/:id" element={<FormMatriculacion />} />
      <Route path="/loginDNI" element={<LoginDni />} />
      <Route path="/detLegajo/:id" element={<DetalleLegajo />} />
      <Route path="/detLegajoProfesor/:id" element={<DetalleLegajoProfesor />} />
      <Route path="/crearAlumno" element={<CrearLegajoAlumno />} />
      <Route path="/crearProfesor" element={<CrearLegajoProfesor />} />

      {/* Podés agregar más rutas aquí */}
      {/* Podés agregar más rutas como <Route path="/" element={<Inicio />} /> */}
    </Routes>
  )
}