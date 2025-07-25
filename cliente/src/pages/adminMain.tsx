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
} from "lucide-react"
import logo from "../assets/logo.png"
import logo2 from "../assets/logo2.png"
import carrusel1 from "../assets/carrusel1.jpg"
import carrusel2 from "../assets/carrusel2.jpg"
import carrusel3 from "../assets/carrusel3.jpg"
import carrusel4 from "../assets/carrusel4.jpg"
import carrusel5 from "../assets/carrusel5.jpg"
import { useNavigate } from "react-router-dom"

const carouselImages = [
  carrusel1,
  carrusel2,
  carrusel3,
  carrusel4,
  carrusel5,
  //las fotos agregarlas acá
]

const menuItems = [
  { icon: Home, label: "INICIO", id: "inicio" },
  { icon: Users, label: "ASPIRANTES", id: "aspirantes" },
  { icon: BarChart3, label: "CUPOS", id: "cupos" },
  { icon: Clock, label: "EN ESPERA", id: "espera" },
  { icon: ThumbsUp, label: "CONFIRMADOS", id: "confirmados" },
  { icon: FolderOpen, label: "LEGAJO DIGITAL", id: "legajo" },
  { icon: FileText, label: "REPORTES", id: "reportes" },
]

export default function AdminMain() {
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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length)
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
      default:
        navigate("/admin")
  }
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
        className={`fixed left-0 top-0 h-full w-80 bg-[#1F6680] transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
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
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-white text-3xl font-bold mb-4">Bienvenido al Panel de Administración</h2>
          </div>

          {/* Carousel Container */}
          <Card className="bg-white/10 backdrop-blur-sm border-none shadow-2xl overflow-hidden">
            <div className="relative">
              {/* Carousel */}
              <div className="relative h-96 md:h-[500px] overflow-hidden">
                <img
                  src={carouselImages[currentImageIndex] || "carrusel2.jpg"}
                  alt={`Imagen ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover transition-opacity duration-500"
                />

                {/* Navigation Arrows */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-3 transition-colors shadow-lg"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-3 transition-colors shadow-lg"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Carousel Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentImageIndex ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
