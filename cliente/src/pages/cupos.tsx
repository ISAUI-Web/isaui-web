"use client"
import { ProtectedRoute } from "../components/protected-route"
import { getUserRole } from "../lib/auth"
import { RolUsuario } from "../lib/types"
import { useState, useEffect } from "react"
import { Card } from "../components/ui/card"
import { Progress } from "../components/ui/progress"
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
  TrendingUp,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

// Asegúrate de que las rutas sean correctas según tu estructura de archivos
import logo from "../assets/logo.png"
import logo2 from "../assets/logo2.png"

type MenuItem = {
  icon: React.ElementType;
  label: string;
  id: string;
  submenu?: { id: string; label: string }[];
};

const menuItems: MenuItem[] = [
  { icon: Home, label: "INICIO", id: "inicio" },
  {
    icon: Users,
    label: "ASPIRANTES",
    id: "aspirantes",
    submenu: [
      { id: "aspirantes-preinscripcion", label: "Preinscripción" },
      { id: "aspirantes-matriculacion", label: "Matriculación" },
    ],
  },
  { icon: BarChart3, label: "CUPOS", id: "cupos" },
  { icon: FolderOpen, label: "LEGAJO DIGITAL", id: "legajo" },
  { icon: FileText, label: "REPORTES", id: "reportes" },
  { icon: Settings, label: "MANTENIMIENTO", id: "mantenimiento" },
]

export default function Cupos() {

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("cupos")
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null)
  const [cupos, setCupos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // Cargar datos de cupos desde la API real
  useEffect(() => {
    const fetchCuposData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("http://localhost:3000/carrera")
        if (!response.ok) throw new Error("Error al cargar los datos de cupos")
        const data = await response.json()
        // Asegura que los campos sean números
        setCupos(
          data.map((c: any) => ({
            ...c,
            cupoMaximo: Number(c.cupo_maximo) || 0,
            cupoActual: Number(c.cupo_actual) || 0,
          }))
        )
      } catch (error) {
        console.error("Error al cargar cupos:", error)
        setCupos([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchCuposData()
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

  // Calcular estadísticas generales
  const totalCupoMaximo = cupos.reduce((sum, carrera) => sum + (Number(carrera.cupoMaximo) || 0), 0)
  const totalCupoActual = cupos.reduce((sum, carrera) => sum + (Number(carrera.cupoActual) || 0), 0)
  const totalOcupado = totalCupoMaximo - totalCupoActual
  const porcentajeOcupacion = totalCupoMaximo > 0 ? (totalOcupado / totalCupoMaximo) * 100 : 0

  const getStatusColor = (ocupado: number, maximo: number) => {
    const porcentaje = (ocupado / maximo) * 100
    if (porcentaje >= 100) return "text-red-600 bg-red-50"
    if (porcentaje >= 80) return "text-orange-600 bg-orange-50"
    if (porcentaje >= 60) return "text-yellow-600 bg-yellow-50"
    return "text-green-600 bg-green-50"
  }

  const getProgressColor = (ocupado: number, maximo: number) => {
    const porcentaje = (ocupado / maximo) * 100
    if (porcentaje >= 100) return "bg-red-500"
    if (porcentaje >= 80) return "bg-orange-500"
    if (porcentaje >= 60) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <ProtectedRoute allowedRoles={[RolUsuario.ADMIN_GENERAL, RolUsuario.GESTOR_ACADEMICO]}>
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
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-8 text-center">
            <h2 className="text-white text-3xl font-bold mb-4">Gestión de Cupos por Carrera</h2>
            <p className="text-white/80 text-lg">Control de ocupación y disponibilidad de cupos</p>
          </div>

          {/* Estadísticas Generales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white shadow-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Cupos</p>
                  <p className="text-3xl font-bold text-gray-900">{totalCupoMaximo}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="bg-white shadow-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Cupos Ocupados</p>
                  <p className="text-3xl font-bold text-orange-600">{totalOcupado}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </Card>

            <Card className="bg-white shadow-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Cupos Disponibles</p>
                  <p className="text-3xl font-bold text-green-600">{totalCupoActual}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Barra de Progreso General */}
          <Card className="bg-white shadow-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Ocupación General</h3>
              <span className="text-2xl font-bold text-gray-900">{porcentajeOcupacion.toFixed(1)}%</span>
            </div>
            <Progress value={porcentajeOcupacion} className="h-4 mb-2" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{totalOcupado} ocupados</span>
              <span>{totalCupoActual} disponibles</span>
            </div>
          </Card>

          {/* Lista de Carreras */}
          <Card className="bg-white shadow-xl overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Cupos por Carrera</h3>

              <div className="space-y-6">
                {cupos.map((carrera) => {
                  const porcentajeCarrera = carrera.cupoMaximo > 0 ? (carrera.cupoMaximo - carrera.cupoActual) / carrera.cupoMaximo * 100 : 0

                  return (
                    <div key={carrera.id} className="border border-gray-200 rounded-lg p-6">
                      {/* Header de la carrera */}
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold text-gray-900">{carrera.nombre}</h4>
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            carrera.cupoActual,
                            carrera.cupoMaximo,
                          )}`}
                        >
                          {porcentajeCarrera >= 100
                            ? "COMPLETO"
                            : porcentajeCarrera >= 80
                              ? "CASI LLENO"
                              : "DISPONIBLE"}
                        </div>
                      </div>

                      {/* Estadísticas de la carrera */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{carrera.cupoMaximo}</p>
                          <p className="text-sm text-gray-600">Cupo Total</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-600">{carrera.cupoMaximo - carrera.cupo_actual}</p>
                          <p className="text-sm text-gray-600">Ocupados</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{carrera.cupo_actual}</p>
                          <p className="text-sm text-gray-600">Disponibles</p>
                        </div>
                      </div>

                      {/* Barra de progreso */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Ocupación</span>
                          <span className="text-sm font-bold text-gray-900">{porcentajeCarrera.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(
                              carrera.cupoOcupado,
                              carrera.cupoMaximo,
                            )}`}
                            style={{ width: `${Math.min(porcentajeCarrera, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Alertas */}
                      {porcentajeCarrera >= 100 && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <XCircle className="w-5 h-5 text-red-600" />
                          <span className="text-red-800 text-sm font-medium">
                            Cupo completo 
                          </span>
                        </div>
                      )}

                      {porcentajeCarrera >= 80 && porcentajeCarrera < 100 && (
                        <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-orange-600" />
                          <span className="text-orange-800 text-sm font-medium">
                            Cupo casi completo - Quedan {carrera.cupo_actual} lugares disponibles
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
    </ProtectedRoute>
  )
}