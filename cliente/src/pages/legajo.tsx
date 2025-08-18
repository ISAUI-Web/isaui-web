"use client"

import { useState } from "react"
import { Card } from "../components/ui/card"
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
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Settings,
  Construction,
  AlertTriangle,
} from "lucide-react"
import logo from "../assets/logo.png"
import logo2 from "../assets/logo2.png"
import { useNavigate } from "react-router-dom"


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

export default function Legajo() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [activeSection, setActiveSection] = useState("inicio")
  const navigate = useNavigate()
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleLogout = () => {
    localStorage.removeItem("adminRemember")
    localStorage.removeItem("adminUser")
    alert("¡Sesión cerrada exitosamente!")
    navigate("/login")
  }


const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null);

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
                {/* Submenu */}
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
            <h2 className="text-white text-3xl font-bold mb-4">Gestión de Legajos</h2>
          </div>

          {/* Under Construction Card */}
          <Card className="bg-white shadow-xl overflow-hidden">
            <div className="p-12 text-center">
              {/* Construction Icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Construction className="w-24 h-24 text-orange-500" />
                  <div className="absolute -top-2 -right-2">
                    <AlertTriangle className="w-8 h-8 text-yellow-500" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-3xl font-bold text-gray-800 mb-4">Vista en Desarrollo</h3>

              {/* Description */}
              <div className="max-w-2xl mx-auto mb-8">
                <p className="text-gray-600 text-lg mb-4">
                  La sección de <strong>Legajo</strong> está actualmente en proceso de desarrollo.
                </p>
                <p className="text-gray-500 text-base">
                  Nuestro equipo está trabajando para implementar todas las funcionalidades necesarias para la gestión
                  de legajos.
                </p>
              </div>

            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
