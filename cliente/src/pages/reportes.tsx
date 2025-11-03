"use client"
import { ProtectedRoute } from "../components/protected-route"
import { getUserRole } from "../lib/auth"
import { RolUsuario } from "../lib/types"
import { useState, useEffect } from "react"
import { Card } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Label } from "../components/ui/label"
import {
  Menu,
  X,
  Home,
  Users,
  BarChart3,
  Clock,
  ThumbsUp,
  FolderOpen,
  FileText,
  LogOut,
  Settings,
  Download,
  Calendar,
  Filter,
  PieChart,
  UserCheck,
  UserPlus,
  AlertCircle,
  GraduationCap,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import logo from "../assets/logo.png"
import logo2 from "../assets/logo2.png"

const menuItems = [
  { icon: Home, label: "INICIO", id: "inicio" },
  {
    icon: Users,
    label: "ASPIRANTES",
    id: "aspirantes",
    submenu: [
      { label: "Preinscripción", id: "aspirantes-preinscripcion" },
      { label: "Matriculación", id: "aspirantes-matriculacion" },
    ],
  },
  { icon: BarChart3, label: "CUPOS", id: "cupos" },
  { icon: FolderOpen, label: "LEGAJO DIGITAL", id: "legajo" },
  { icon: FileText, label: "REPORTES", id: "reportes" },
  { icon: Settings, label: "MANTENIMIENTO", id: "mantenimiento" },
]

const tiposReporte = [
  {
    id: "cupos",
    nombre: "Reporte de Cupos",
    descripcion: "Estado de ocupación por carrera",
    icon: PieChart,
    color: "bg-blue-500",
  },
  {
    id: "matriculados",
    nombre: "Aspirantes Matriculados",
    descripcion: "Lista de estudiantes matriculados",
    icon: UserCheck,
    color: "bg-green-500",
  },
  {
    id: "preinscriptos",
    nombre: "Aspirantes Preinscriptos",
    descripcion: "Lista de aspirantes preinscriptos",
    icon: UserPlus,
    color: "bg-orange-500",
  },
]

const estadosTramite = [
  { id: "pendiente", nombre: "Pendiente" },
  { id: "en espera", nombre: "En Espera" },
  { id: "confirmado", nombre: "Confirmado" },
  { id: "rechazado", nombre: "Rechazado" },
];

interface Carrera {
  id: number
  nombre: string
}

export default function Reportes() {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("reportes")
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null)

  // Estados para reportes
  const [carreras, setCarreras] = useState<Carrera[]>([])
  const [tipoReporteSeleccionado, setTipoReporteSeleccionado] = useState<string>("")
  const [carreraSeleccionada, setCarreraSeleccionada] = useState<string>("todas")
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<string>("todos")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar carreras disponibles
  useEffect(() => {
    const fetchCarreras = async () => {
      try {
        const response = await fetch("http://localhost:3000/carrera")
        if (!response.ok) throw new Error("Error al cargar carreras")

        const data = await response.json()
        setCarreras(data.map((c: any) => ({ id: c.id, nombre: c.nombre })))
      } catch (error) {
        console.error("Error al cargar carreras:", error)
        setCarreras([])
      }
    }

    fetchCarreras()
  }, [])

  const toggleMenu = () => {
      setIsMenuOpen(!isMenuOpen)
    }
  
    const handleLogout = () => {
      localStorage.removeItem("adminRemember")
      localStorage.removeItem("adminUser")
      alert("¡Sesión cerrada exitosamente!")
      navigate("/login")
    }
  

  const handleMenuItemClick = (itemId: string) => {
    setActiveSection(itemId);
  
    // Handle submenu toggle for "aspirantes"
    if (itemId === "aspirantes") {
      setExpandedSubmenu(expandedSubmenu === "aspirantes" ? null : "aspirantes");
      return;
    }
  
    // Handle navigation for submenu items
    if (itemId === "aspirantes-preinscripcion") {
      navigate("/aspirantes");
    } else if (itemId === "aspirantes-matriculacion") {
      navigate("/matriculacion");
    } else {
      switch (itemId) {
        case "inicio":
          navigate("/admin");
          break;
        case "cupos":
          navigate("/cupos");
          break;
        case "legajo":
          navigate("/legajo");
          break;
        case "reportes":
          navigate("/reportes");
          break;
        case "mantenimiento":
          navigate("/mantenimiento");
          break;
        default:
          navigate("/admin");
      }
    }
  
    setIsMenuOpen(false);
  }

  const handleGenerarReporte = async () => {
    if (!tipoReporteSeleccionado) {
      setError("Por favor, selecciona un tipo de reporte.");
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      let url = "";
      let filename = "reporte.pdf";
      const params = new URLSearchParams();

      if (carreraSeleccionada !== "todas") {
        params.append('carreraId', carreraSeleccionada);
      }

      switch (tipoReporteSeleccionado) {
        case "cupos":
          url = "http://localhost:3000/carrera/reportes/cupos";
          filename = "reporte-cupos.pdf";
          break;
        case "preinscriptos":
          url = "http://localhost:3000/aspirante/reportes/preinscriptos"; // Endpoint a crear
          filename = "reporte-preinscriptos.pdf";
          if (estadoSeleccionado !== "todos") {
            params.append('estado', estadoSeleccionado);
          }
          break;
        case "matriculados":
          url = "http://localhost:3000/aspirante/reportes/matriculados"; // Endpoint a crear
          filename = "reporte-matriculados.pdf";
          if (estadoSeleccionado !== "todos") {
            params.append('estado', estadoSeleccionado);
          }
          break;
        default:
          // Este caso previene que se intente generar un reporte no implementado
          throw new Error("Este tipo de reporte aún no está implementado.");
      }

      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        let errorMessage = "Error al generar el reporte.";
        try { const errorData = await response.json(); errorMessage = errorData.message || errorMessage; } catch (e) { /* no-op */ }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    
  <ProtectedRoute allowedRoles={[RolUsuario.ADMIN_GENERAL, RolUsuario.GESTOR_ACADEMICO]}
  roleRedirects={{
    [RolUsuario.PROFESOR]: "/admin"
  }}>
    <div className="min-h-screen bg-[#1F6680] from-teal-600 to-teal-800 relative">
      {/* Header */}
      <header className="bg-slate-800 h-16 flex items-center px-4 relative z-50">
        <button onClick={toggleMenu} className="text-white hover:text-gray-300 transition-colors">
          <Menu className="w-6 h-6" />
        </button>

        <div className="ml-6">
          <img src={logo2} alt="Logo" className="mx-auto h-8" />
        </div>
      </header>

      {/* Burger Menu Overlay */}
      {isMenuOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsMenuOpen(false)} />}

      {/* Burger Menu */}
      <div
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255, 255, 255, 0.3) transparent",
        }}
        className={`fixed left-0 top-0 h-full w-80 bg-[#1F6680] transform transition-transform duration-300 ease-in-out z-50 flex flex-col overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/30 hover:scrollbar-thumb-white/50 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Menu Header */}
        <div className="bg-[#B49658] p-6 text-center flex-shrink-0">
          <button onClick={toggleMenu} className="absolute top-4 right-4 text-white hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>

          <img src={logo} alt="Logo" className="mx-auto h-20" />
          <div className="mt-3">
            <p className="text-white text-sm font-medium">ADMINISTRADOR</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1">
          {menuItems.map((item) => {
            const userRole = getUserRole();

            if (item.id === "mantenimiento" && userRole !== RolUsuario.ADMIN_GENERAL) {
              return null;
            }
            const IconComponent = item.icon;
            return (
              <div key={item.id}>
                <button
                  onClick={() => handleMenuItemClick(item.id)}
                  className={`w-full flex items-center px-6 py-4 text-white hover:bg-[#31546D] transition-colors ${
                    activeSection === item.id ? "bg-[#31546D]" : ""
                  }`}
                >
                  <IconComponent className="w-5 h-5 mr-4" />
                  <span className="text-sm font-medium tracking-wide">{item.label}</span>
                  {item.submenu && (
                    <span className="ml-auto">
                      {expandedSubmenu === item.id ? <ChevronDown /> : <ChevronRight />}
                    </span>
                  )}
                </button>
                {/* Submenu - Submenu items */}
                {item.submenu && expandedSubmenu === item.id && (
                  <div className="bg-[#1A5A75] ml-4">
                    {item.submenu.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => handleMenuItemClick(subItem.id)}
                        className={`w-full flex items-center px-6 py-3 text-white hover:bg-[#2A7A9A] transition-colors text-sm ${
                          activeSection === subItem.id ? "bg-[#2A7A9A]" : ""
                        }`}
                      >
                        <span className="ml-6">• {subItem.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Logout Button */}
        <div className="p-4 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-6 py-3 bg-[#D45A5C] hover:bg-[#C94A4E] text-white rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-2" />
            <span className="font-medium">CERRAR SESIÓN</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="mb-8 text-center">
            <h2 className="text-white text-3xl font-bold mb-4">Centro de Reportes</h2>
            <p className="text-white/80 text-lg">Genere reportes detallados en formato PDF</p>
          </div>

          {/* Panel de Configuración Centrado */}
          <div className="flex justify-center mb-8">
            <Card className="bg-white shadow-xl p-8 w-full max-w-2xl">
              <div className="flex items-center gap-3 mb-8 justify-center">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <Filter className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Configuración de Reportes</h3>
              </div>

              <div className="space-y-8">
                {/* Tipo de Reporte */}
                <div>
                  <Label className="text-base font-semibold text-gray-700 mb-3 block">Tipo de Reporte *</Label>
                  <Select value={tipoReporteSeleccionado} onValueChange={setTipoReporteSeleccionado}>
                    <SelectTrigger className="w-full h-12 text-base">
                      <SelectValue placeholder="Seleccionar tipo de reporte" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposReporte.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id}>
                          <div className="flex items-center gap-3 py-2">
                            <div className={`w-8 h-8 ${tipo.color} rounded-full flex items-center justify-center`}>
                              <tipo.icon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium">{tipo.nombre}</div>
                              <div className="text-sm text-gray-500">{tipo.descripcion}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por Carrera */}
                <div>
                  <Label className="text-base font-semibold text-gray-700 mb-3 block">Filtrar por Carrera</Label>
                  <Select value={carreraSeleccionada} onValueChange={setCarreraSeleccionada}>
                    <SelectTrigger className="w-full h-12 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-teal-600" />
                          <span className="font-medium">Todas las carreras</span>
                        </div>
                      </SelectItem>
                      {carreras.map((carrera) => (
                        <SelectItem key={carrera.id} value={carrera.id.toString()}>
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-gray-600" />
                            <span>{carrera.nombre}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por Estado (condicional) */}
                {(tipoReporteSeleccionado === "preinscriptos" || tipoReporteSeleccionado === "matriculados") && (
                  <div>
                    <Label className="text-base font-semibold text-gray-700 mb-3 block">Filtrar por Estado del Trámite</Label>
                    <Select value={estadoSeleccionado} onValueChange={setEstadoSeleccionado}>
                      <SelectTrigger className="w-full h-12 text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">
                          <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-600" />
                            <span className="font-medium">Todos los Estados</span>
                          </div>
                        </SelectItem>
                        {estadosTramite.map((estado) => (
                          <SelectItem key={estado.id} value={estado.id}>
                            <span className="capitalize">{estado.nombre}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {/* Información adicional */}
                <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-6 h-6 text-blue-600 mt-1" />
                    <div>
                      <p className="text-blue-800 font-semibold mb-1">Fecha de generación</p>
                      <p className="text-blue-700">
                        {new Date().toLocaleDateString("es-AR", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                        <p className="text-blue-600 text-sm mt-1">
                        Hora: {new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false })}
                        </p>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-6 bg-red-50 rounded-xl border border-red-200">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-red-600 mt-1" />
                      <div>
                        <p className="text-red-800 font-semibold mb-1">Error</p>
                        <p className="text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botón Generar */}
                <Button
                  onClick={handleGenerarReporte}
                  disabled={!tipoReporteSeleccionado || isGenerating}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 text-xl font-semibold rounded-xl transition-all transform hover:scale-105 disabled:transform-none"
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Generando PDF...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Download className="w-6 h-6 mr-3" />
                      Generar Reporte PDF
                    </div>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Información sobre los reportes */}
          <Card className="bg-white shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Información sobre los Reportes</h3>
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                Características de los reportes:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>
                      <strong>Reporte de Cupos:</strong> Estado de ocupación, cupos disponibles y estadísticas
                      detalladas por carrera.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>
                      <strong>Aspirantes Matriculados:</strong> Lista completa de estudiantes que completaron su proceso
                      de matriculación.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>
                      <strong>Aspirantes Preinscriptos:</strong> Lista detallada de aspirantes que realizaron la
                      preinscripción.
                    </span>
                  </li>
                </ul>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Filtros avanzados por carrera individual o todas las carreras.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Estadísticas automáticas y resúmenes por estado de aspirante.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Formato PDF profesional con header institucional y numeración.</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
    </ProtectedRoute>
  )
}
