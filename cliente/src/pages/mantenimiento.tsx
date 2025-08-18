"use client"

<<<<<<< Updated upstream
import { useState } from "react"
=======
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
>>>>>>> Stashed changes
import { Card } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
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
  Plus,
  Save,
  Edit,
  Trash2,
  UserPlus,
  GraduationCap,
} from "lucide-react"
import logo from "../assets/logo.png"
import logo2 from "../assets/logo2.png"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"

// Datos de ejemplo para carreras
const carrerasData = [
  { id: 1, nombre: "DESARROLLO DE SOFTWARE", cupoMaximo: 30 },
  { id: 2, nombre: "ADMINISTRACIÓN", cupoMaximo: 25 },
  { id: 3, nombre: "ENFERMERÍA", cupoMaximo: 20 },
  { id: 4, nombre: "CONTABILIDAD", cupoMaximo: 15 },
]

// Datos de ejemplo para usuarios
const usuariosData = [
  { id: 1, usuario: "admin", email: "admin@isau.edu.ar", rol: "administrador", activo: true },
  { id: 2, usuario: "secretaria1", email: "secretaria1@isau.edu.ar", rol: "secretaria", activo: true },
  { id: 3, usuario: "coordinador1", email: "coord1@isau.edu.ar", rol: "coordinador", activo: true },
]

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
]

const roles = [
  { value: "administrador", label: "Administrador" },
  { value: "secretaria", label: "Secretaria" },
  { value: "coordinador", label: "Coordinador" },
]

export default function Mantenimiento() {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("mantenimiento")
  const [activeTab, setActiveTab] = useState("carreras")
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null)

  // Estados para carreras
  const [carreras, setCarreras] = useState(carrerasData)
  const [editingCarrera, setEditingCarrera] = useState<number | null>(null)
  const [newCarrera, setNewCarrera] = useState({ nombre: "", cupoMaximo: 0 })
  const [showNewCarreraForm, setShowNewCarreraForm] = useState(false)

  // Estados para usuarios
  const [usuarios, setUsuarios] = useState(usuariosData)
  const [editingUsuario, setEditingUsuario] = useState<number | null>(null)
  const [newUsuario, setNewUsuario] = useState({ usuario: "", email: "", password: "", rol: "" })
  const [showNewUsuarioForm, setShowNewUsuarioForm] = useState(false)

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
  // Funciones para carreras
  const handleCreateCarrera = async () => {
    if (!newCarrera.nombre.trim() || newCarrera.cupoMaximo <= 0) {
      alert("Por favor complete todos los campos correctamente")
      return
    }

    try {
      // Aquí conectarías con tu API de NestJS
      const response = await fetch("/api/carreras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCarrera),
      })

      if (!response.ok) throw new Error("Error al crear carrera")

      const nuevaCarrera = await response.json()
      setCarreras([...carreras, { ...nuevaCarrera, id: Date.now() }])
      setNewCarrera({ nombre: "", cupoMaximo: 0 })
      setShowNewCarreraForm(false)
      alert("Carrera creada correctamente")
    } catch (error) {
      console.error("Error:", error)
      // Simulación local
      const nuevaCarrera = { ...newCarrera, id: Date.now() }
      setCarreras([...carreras, nuevaCarrera])
      setNewCarrera({ nombre: "", cupoMaximo: 0 })
      setShowNewCarreraForm(false)
      alert("Carrera creada correctamente")
    }
  }

  const handleUpdateCarrera = async (id: number, updatedData: any) => {
    try {
      // Aquí conectarías con tu API de NestJS
      const response = await fetch(`/api/carreras/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      })

      if (!response.ok) throw new Error("Error al actualizar carrera")

      setCarreras(carreras.map((c) => (c.id === id ? { ...c, ...updatedData } : c)))
      setEditingCarrera(null)
      alert("Carrera actualizada correctamente")
    } catch (error) {
      console.error("Error:", error)
      // Simulación local
      setCarreras(carreras.map((c) => (c.id === id ? { ...c, ...updatedData } : c)))
      setEditingCarrera(null)
      alert("Carrera actualizada correctamente")
    }
  }

  const handleDeleteCarrera = async (id: number) => {
    if (!confirm("¿Está seguro de que desea eliminar esta carrera?")) return

    try {
      // Aquí conectarías con tu API de NestJS
      const response = await fetch(`/api/carreras/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al eliminar carrera")

      setCarreras(carreras.filter((c) => c.id !== id))
      alert("Carrera eliminada correctamente")
    } catch (error) {
      console.error("Error:", error)
      // Simulación local
      setCarreras(carreras.filter((c) => c.id !== id))
      alert("Carrera eliminada correctamente")
    }
  }

  // Funciones para usuarios
  const handleCreateUsuario = async () => {
    if (!newUsuario.usuario.trim() || !newUsuario.email.trim() || !newUsuario.password.trim() || !newUsuario.rol) {
      alert("Por favor complete todos los campos")
      return
    }

    try {
      // Aquí conectarías con tu API de NestJS
      const response = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUsuario),
      })

      if (!response.ok) throw new Error("Error al crear usuario")

      const nuevoUsuario = await response.json()
      setUsuarios([...usuarios, { ...nuevoUsuario, id: Date.now(), activo: true }])
      setNewUsuario({ usuario: "", email: "", password: "", rol: "" })
      setShowNewUsuarioForm(false)
      alert("Usuario creado correctamente")
    } catch (error) {
      console.error("Error:", error)
      // Simulación local
      const nuevoUsuario = { ...newUsuario, id: Date.now(), activo: true }
      setUsuarios([...usuarios, nuevoUsuario])
      setNewUsuario({ usuario: "", email: "", password: "", rol: "" })
      setShowNewUsuarioForm(false)
      alert("Usuario creado correctamente")
    }
  }

  const handleUpdateUsuario = async (id: number, updatedData: any) => {
    try {
      // Aquí conectarías con tu API de NestJS
      const response = await fetch(`/api/usuarios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      })

      if (!response.ok) throw new Error("Error al actualizar usuario")

      setUsuarios(usuarios.map((u) => (u.id === id ? { ...u, ...updatedData } : u)))
      setEditingUsuario(null)
      alert("Usuario actualizado correctamente")
    } catch (error) {
      console.error("Error:", error)
      // Simulación local
      setUsuarios(usuarios.map((u) => (u.id === id ? { ...u, ...updatedData } : u)))
      setEditingUsuario(null)
      alert("Usuario actualizado correctamente")
    }
  }

  const handleDeleteUsuario = async (id: number) => {
    if (!confirm("¿Está seguro de que desea eliminar este usuario?")) return

    try {
      // Aquí conectarías con tu API de NestJS
      const response = await fetch(`/api/usuarios/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al eliminar usuario")

      setUsuarios(usuarios.filter((u) => u.id !== id))
      alert("Usuario eliminado correctamente")
    } catch (error) {
      console.error("Error:", error)
      // Simulación local
      setUsuarios(usuarios.filter((u) => u.id !== id))
      alert("Usuario eliminado correctamente")
    }
  }

  const renderCarrerasSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Gestión de Carreras</h3>
        <Button
          onClick={() => setShowNewCarreraForm(true)}
          className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Carrera
        </Button>
      </div>

      {/* Formulario nueva carrera */}
      {showNewCarreraForm && (
        <Card className="p-4 border-green-200">
          <h4 className="font-semibold mb-4">Crear Nueva Carrera</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nombre de la Carrera</Label>
              <Input
                value={newCarrera.nombre}
                onChange={(e) => setNewCarrera({ ...newCarrera, nombre: e.target.value })}
                placeholder="Ej: DESARROLLO DE SOFTWARE"
              />
            </div>
            <div>
              <Label>Cupo Máximo</Label>
              <Input
                type="number"
                value={newCarrera.cupoMaximo}
                onChange={(e) => setNewCarrera({ ...newCarrera, cupoMaximo: Number.parseInt(e.target.value) })}
                placeholder="Ej: 30"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleCreateCarrera} className="bg-green-500 hover:bg-green-600 text-white">
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
            <Button onClick={() => setShowNewCarreraForm(false)} variant="outline">
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      {/* Lista de carreras */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Nombre</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Cupo Máximo</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {carreras.map((carrera) => (
                <tr key={carrera.id} className="border-t">
                  <td className="py-3 px-4">
                    {editingCarrera === carrera.id ? (
                      <Input
                        defaultValue={carrera.nombre}
                        onBlur={(e) => handleUpdateCarrera(carrera.id, { ...carrera, nombre: e.target.value })}
                      />
                    ) : (
                      <span className="font-medium">{carrera.nombre}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingCarrera === carrera.id ? (
                      <Input
                        type="number"
                        defaultValue={carrera.cupoMaximo}
                        onBlur={(e) =>
                          handleUpdateCarrera(carrera.id, { ...carrera, cupoMaximo: Number.parseInt(e.target.value) })
                        }
                      />
                    ) : (
                      <span>{carrera.cupoMaximo}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center gap-2">
                      <Button
                        onClick={() => setEditingCarrera(editingCarrera === carrera.id ? null : carrera.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-2"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteCarrera(carrera.id)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )

  const renderUsuariosSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Gestión de Usuarios</h3>
        <Button
          onClick={() => setShowNewUsuarioForm(true)}
          className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Formulario nuevo usuario */}
      {showNewUsuarioForm && (
        <Card className="p-4 border-green-200">
          <h4 className="font-semibold mb-4">Crear Nuevo Usuario</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nombre de Usuario</Label>
              <Input
                value={newUsuario.usuario}
                onChange={(e) => setNewUsuario({ ...newUsuario, usuario: e.target.value })}
                placeholder="Ej: admin"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={newUsuario.email}
                onChange={(e) => setNewUsuario({ ...newUsuario, email: e.target.value })}
                placeholder="Ej: admin@isau.edu.ar"
              />
            </div>
            <div>
              <Label>Contraseña</Label>
              <Input
                type="password"
                value={newUsuario.password}
                onChange={(e) => setNewUsuario({ ...newUsuario, password: e.target.value })}
                placeholder="Contraseña segura"
              />
            </div>
            <div>
              <Label>Rol</Label>
              <Select value={newUsuario.rol} onValueChange={(value) => setNewUsuario({ ...newUsuario, rol: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((rol) => (
                    <SelectItem key={rol.value} value={rol.value}>
                      {rol.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleCreateUsuario} className="bg-green-500 hover:bg-green-600 text-white">
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
            <Button onClick={() => setShowNewUsuarioForm(false)} variant="outline">
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      {/* Lista de usuarios */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Usuario</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Rol</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="border-t">
                  <td className="py-3 px-4">
                    {editingUsuario === usuario.id ? (
                      <Input
                        defaultValue={usuario.usuario}
                        onBlur={(e) => handleUpdateUsuario(usuario.id, { ...usuario, usuario: e.target.value })}
                      />
                    ) : (
                      <span className="font-medium">{usuario.usuario}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingUsuario === usuario.id ? (
                      <Input
                        type="email"
                        defaultValue={usuario.email}
                        onBlur={(e) => handleUpdateUsuario(usuario.id, { ...usuario, email: e.target.value })}
                      />
                    ) : (
                      <span>{usuario.email}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingUsuario === usuario.id ? (
                      <Select
                        defaultValue={usuario.rol}
                        onValueChange={(value) => handleUpdateUsuario(usuario.id, { ...usuario, rol: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((rol) => (
                            <SelectItem key={rol.value} value={rol.value}>
                              {rol.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="capitalize">{usuario.rol}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center gap-2">
                      <Button
                        onClick={() => setEditingUsuario(editingUsuario === usuario.id ? null : usuario.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-2"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteUsuario(usuario.id)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )

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
          {/* Page Title */}
          <div className="mb-8 text-center">
            <h2 className="text-white text-3xl font-bold mb-4">Panel de Mantenimiento</h2>
            <p className="text-white/80 text-lg">Gestión de carreras y usuarios del sistema</p>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="flex space-x-4 justify-center">
              <Button
                onClick={() => setActiveTab("carreras")}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                  activeTab === "carreras" ? "bg-white text-teal-700" : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                <GraduationCap className="w-5 h-5" />
                Carreras
              </Button>
              <Button
                onClick={() => setActiveTab("usuarios")}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                  activeTab === "usuarios" ? "bg-white text-teal-700" : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                <Users className="w-5 h-5" />
                Usuarios
              </Button>
            </div>
          </div>

          {/* Content */}
          <Card className="bg-white shadow-xl p-6">
            {activeTab === "carreras" && renderCarrerasSection()}
            {activeTab === "usuarios" && renderUsuariosSection()}
          </Card>
        </div>
      </main>
    </div>
  )
}
