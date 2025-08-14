"use client"

import { useState, useEffect } from "react"
import { Card } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
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
  Search,
  Filter,
  Check,
  XIcon,
  Edit,
  Eye,
  Settings,
} from "lucide-react"
import { useNavigate } from "react-router-dom" 
import logo from "../assets/logo.png"
import logo2 from "../assets/logo2.png"

interface AspiranteItem {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  carrera: string;
  estado_preinscripcion: string;
}


// Datos de ejemplo de aspirantes


const menuItems = [
  { icon: Home, label: "INICIO", id: "inicio" },
  { icon: Users, label: "ASPIRANTES", id: "aspirantes" },
  { icon: BarChart3, label: "CUPOS", id: "cupos" },
  { icon: Clock, label: "EN ESPERA", id: "espera" },
  { icon: ThumbsUp, label: "CONFIRMADOS", id: "confirmados" },
  { icon: FolderOpen, label: "LEGAJO DIGITAL", id: "legajo" },
  { icon: FileText, label: "REPORTES", id: "reportes" },
  { icon: Settings, label: "MANTENIMIENTO", id: "mantenimiento" },
]

export default function AdminAspirantes() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("aspirantes")
  const [searchTerm, setSearchTerm] = useState("")
  const [aspirantes, setAspirantes] = useState<AspiranteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()


  useEffect(() => {
    fetch("http://localhost:3000/aspirante")
      .then((res) => {
        if (!res.ok) throw new Error("Error al traer los aspirantes");
        return res.json();
      })
      .then((data) => {
        setAspirantes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setError("No se pudo cargar la lista de aspirantes");
        setLoading(false);
      });
  }, []);
  
  const filteredAspirantes = aspirantes.filter((asp) =>
    `${asp.nombre} ${asp.apellido} ${asp.dni} ${asp.carrera}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )
  
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
    setActiveSection(itemId)
    setIsMenuOpen(false)

    switch (itemId) {
      case "inicio":
        navigate("/admin")
        break
      case "aspirantes":
        navigate("/aspirantes")
        break
      case "cupos":
        navigate("/cupos")
        break
      case "espera":
        navigate("/espera")
        break
      case "confirmados":
        navigate("/confirmados")
        break
      case "legajo":
        navigate("/legajo")
        break
      case "reportes":
        navigate("/reportes")
        break
      case "mantenimiento":
        navigate("/mantenimiento")
        break
      default:
        navigate("/admin")
  }
 }

 const handleEstado = async (id: number, nuevoEstado: "en espera" | "confirmado" | "rechazado") => {
  try {
    const res = await fetch(`http://localhost:3000/aspirante/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ estado_preinscripcion: nuevoEstado })
    });

    if (!res.ok) throw new Error(`Error al cambiar estado a ${nuevoEstado}`);

    setAspirantes((prev) =>
      prev.map((asp) =>
        asp.id === id ? { ...asp, estado_preinscripcion: nuevoEstado } : asp
      )
    );
  } catch (error) {
    console.error(error);
    alert(`No se pudo cambiar el estado a ${nuevoEstado}`);
  }
};
  // const handleConfirmar = (id: number) => {
  //   setAspirantes((prev) => prev.map((asp) => (asp.id === id ? { ...asp, estado: "confirmado" } : asp)))
  // }

  // const handleRechazar = (id: number) => {
  //   setAspirantes((prev) => prev.map((asp) => (asp.id === id ? { ...asp, estado: "rechazado" } : asp)))
  // }

  const handleVer = (id: number) => {
    navigate(`/detAspirante/${id}`)
  }
  // const handleWaiting = (id: number) => {
  //   setAspirantes((prev) => prev.map((asp) => (asp.id === id ? { ...asp, estado: "pendiente" } : asp)))
  // }


  if (loading) return <p className="text-white">Cargando aspirantes...</p>
  if (error) return <p className="text-red-400">{error}</p>

  return (
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
            const IconComponent = item.icon
            return (
              <button
                key={item.id}
                onClick={() => handleMenuItemClick(item.id)}
                className={`w-full flex items-center px-6 py-4 text-white hover:bg-[#31546D] transition-colors ${
                  activeSection === item.id ? "bg-[#31546D]" : ""
                }`}
              >
                <IconComponent className="w-5 h-5 mr-4" />
                <span className="text-sm font-medium tracking-wide">{item.label}</span>
              </button>
            )
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
          {/* Search Bar */}
          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Input
                type="text"
                placeholder="¿A quien estás buscando?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-12 py-3 rounded-full bg-white border-0 focus:ring-2 focus:ring-blue-500"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Aspirantes Table */}
          <Card className="bg-white shadow-xl overflow-hidden">
            <div className="p-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">LISTA DE ASPIRANTES</h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-semibold text-gray-700">
                        NOMBRE <span className="text-blue-500">↓</span>
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700">
                        APELLIDO <span className="text-blue-500">↓</span>
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700">
                        CARRERA <span className="text-blue-500">↓</span>
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700">
                        DNI <span className="text-blue-500">↓</span>
                      </th>
                      <th className="text-center py-2 px-3 font-semibold text-gray-700">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAspirantes.map((aspirante, index) => (
                      <tr key={`${aspirante.id}-${aspirante.dni}`} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                        <td className="py-2 px-3 font-bold text-gray-900">{aspirante.nombre}</td>
                        <td className="py-2 px-3 text-gray-600">{aspirante.apellido}</td>
                        <td className="py-2 px-3 text-gray-600">{aspirante.carrera}</td>
                        <td className="py-2 px-3 text-gray-600">{aspirante.dni}</td>
                        <td className="py-2 px-3">
                          <div className="flex justify-center gap-1">
                            <Button
                              onClick={() => handleEstado(aspirante.id, "en espera")}
                              className="bg-yellow-500 hover:bg-yellow-600 text-white p-1.5 rounded-lg"
                              disabled={aspirante.estado_preinscripcion === "en espera"}
                            >
                              <Clock className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleEstado(aspirante.id, "confirmado")}
                              className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded-lg"
                              disabled={aspirante.estado_preinscripcion === "confirmado"}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleEstado(aspirante.id, "rechazado")}
                              className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg"
                              disabled={aspirante.estado_preinscripcion === "rechazado"}
                            >
                              <XIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleVer(aspirante.id)}
                              className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-lg"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
