"use client"

import { useState, useEffect } from "react"
import {CustomDialog} from "../components/ui/customDialog"
import { Card } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select"
import {
  Menu,
  X,
  Home,
  Users,
  BarChart3,
  FolderOpen,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Settings,
  Check,
  Eye,
  Clock,
  XIcon
} from "lucide-react";
import { RotateCcwKey } from "lucide-react";
import { useNavigate } from "react-router-dom" 
import logo from "../assets/logo.png"
import logo2 from "../assets/logo2.png"
import ChangePasswordDialog from '../components/ChangePasswordDialog';

interface AspiranteItem {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  carrera: string;
  estado_preinscripcion: string;
}


type MenuItem = {
  icon: React.ElementType;
  label: string;
  id: string;
  submenu?: { id: string; label: string }[];
};

const menuItems = [
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
  { icon: RotateCcwKey, label: "GESTIÓN DE CUENTA", id: "cambio-contrasena" },
]

export default function AdminAspirantes() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("aspirantes")
  // Separate modal states to avoid collisions
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [aspirantes, setAspirantes] = useState<AspiranteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const [filterCarrera, setFilterCarrera] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [dialogProps, setDialogProps] = useState<{
    title?: string
    description?: string
    variant?: "info" | "error" | "success" | "confirm"
    onConfirm?: (() => void) | undefined
    onCancel?: (() => void) | undefined
    confirmText?: string
    cancelText?: string
  }>({})

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/aspirante`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al traer los aspirantes");
        return res.json();
      })
      .then((data) => {
        setAspirantes(data);
        console.log("👉 Aspirantes:", data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setError("No se pudo cargar la lista de aspirantes");
        setLoading(false);
      });
  }, []);

  const carrerasUnicas = Array.from(new Set(aspirantes.map(a => a.carrera)));
  const estadosUnicos = Array.from(
  new Set(aspirantes.map(a => a.estado_preinscripcion))
);
  
  const filteredAspirantes = aspirantes.filter((asp) =>
    `${asp.nombre} ${asp.apellido} ${asp.dni} ${asp.carrera}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )
  .filter((asp) => (filterCarrera ? asp.carrera === filterCarrera : true))
  .filter((asp) => (filterEstado ? asp.estado_preinscripcion === filterEstado : true));
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleLogout = () => {
    localStorage.removeItem("adminRemember")
    localStorage.removeItem("adminUser")
    // Close change password dialog if open, then show logout dialog
    setIsChangePasswordOpen(false)
    setDialogProps({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente.",
      variant: "success",
      confirmText: "Entendido",
      onConfirm: () => navigate("/login")
    })
    setIsLogoutDialogOpen(true)
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
};

// Move handleEstado outside handleMenuItemClick and keep only one definition
const handleEstado = async (id: number, nuevoEstado: "en espera" | "confirmado" | "rechazado") => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/aspirante/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ estado_preinscripcion: nuevoEstado })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: `Error al cambiar estado a ${nuevoEstado}` }));
      throw new Error(errorData.message);
    }

    const updatedAspirante: AspiranteItem = await res.json();
    setAspirantes((prev) =>
      prev.map((asp) =>
        asp.id === id ? { ...asp, ...updatedAspirante } : asp
      )
    );
    setDialogProps({
      title: "Estado actualizado",
      description: "El estado del aspirante se ha actualizado correctamente.",
      variant: "success",
      confirmText: "Entendido",
    });
    setIsLogoutDialogOpen(true);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : `No se pudo cambiar el estado a ${nuevoEstado}`;
    console.error(errorMessage);
    alert(errorMessage);
  }
};
  // const handleConfirmar = (id: number) => {
  //   setAspirantes((prev) => prev.map((asp) => (asp.id === id ? { ...asp, estado: "confirmado" } : asp)))
  // }

  // const handleRechazar = (id: number) => {
  //   setAspirantes((prev) => prev.map((asp) => (asp.id === id ? { ...asp, estado: "rechazado" } : asp)))
  // }

  const handleVer = (id: number) => {
    navigate(`/detAspirante/${id}`, { state: { from: "/aspirantes" } });
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
            const IconComponent = item.icon;
            if (item.id === 'cambio-contrasena') {
              return (
                <div key={item.id}>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      // Open change password dialog exclusively
                      setIsLogoutDialogOpen(false);
                      setIsChangePasswordOpen(true);
                    }}
                    className={`w-full flex items-center px-6 py-4 text-white hover:bg-[#31546D] transition-colors ${
                      activeSection === item.id ? 'bg-[#31546D]' : ''
                    }`}
                  >
                    <IconComponent className="w-5 h-5 mr-4" />
                    <span className="text-sm font-medium tracking-wide">{item.label}</span>
                  </button>

                  <ChangePasswordDialog
                    open={isChangePasswordOpen}
                    onOpenChange={(open) => {
                      setIsChangePasswordOpen(open);
                      if (!open) setActiveSection('');
                    }}
                  />
                </div>
              );
            }

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
        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Input
                type="text"
                placeholder="¿A quien estás buscando?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-12 py-3 rounded-full bg-white border-0 focus:ring-2 focus:ring-blue-500 text-gray-600 text-xl font-sans"
              />
            </div>
            {/* Filtro por Carrera */}
            <select
              value={filterCarrera}
              onChange={(e) => setFilterCarrera(e.target.value)}
              className="w-full h-9 max-w-xs pl-4 pr-12 rounded-full bg-white border-0 focus:ring-2 focus:ring-blue-500 text-gray-600 text-sm font-sans"
            >
              <option value="">Todas las carreras</option>
              {carrerasUnicas.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {/* Filtro por Estado */}
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="w-full h-9 max-w-xs pl-4 pr-12 rounded-full bg-white border-0 focus:ring-2 focus:ring-blue-500 text-gray-600 text-sm font-sans"
            >
              <option value="">Todos los estados</option>
              {estadosUnicos.map((estado) => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
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
      <CustomDialog
    open={isLogoutDialogOpen}
    onClose={() => setIsLogoutDialogOpen(false)}
    title={dialogProps.title ?? ""}
    description={dialogProps.description ?? ""}
    confirmLabel={dialogProps.confirmText ?? "Entendido"}
    cancelLabel={dialogProps.cancelText}
    onConfirm={dialogProps.onConfirm}
    showCancel={!!dialogProps.onCancel}
/>
    </div>
  
  )
}
