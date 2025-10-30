"use client"

import { useState, useEffect } from "react"
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
  XIcon,
  Search,
  Filter,
  Plus,
  Trash2
} from "lucide-react";
import { RotateCcwKey } from "lucide-react";
import { useNavigate } from "react-router-dom" 
import logo from "../assets/logo.png"
import logo2 from "../assets/logo2.png"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs"
import { GraduationCap, BookOpen } from "lucide-react"
import { Badge } from "../components/ui/badge"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "../components/ui/dialog"

import { Label } from "../components/ui/label"
import { Input as UiInput } from "../components/ui/input"
import { Button as UiButton } from "../components/ui/button"

interface EstudianteItem {
  id: number; // ID del Estudiante
  aspirante_id: number; // ID del Aspirante
  nombre: string;
  apellido: string;
  dni: string;
  carrera: string;
}

 interface Profesor {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
    legajoCompleto: boolean;
    tipo: "profesor";
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

export default function AdminMatriculacion() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("legajo"); // para que el menú marque la sub-sección correcta
  const [searchTerm, setSearchTerm] = useState("");
  const [estudiantes, setEstudiantes] = useState<EstudianteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [loadingProfesores, setLoadingProfesores] = useState(true);
  const [errorProfesores, setErrorProfesores] = useState<string | null>(null);

  // State for Tabs
  const [activeTab, setActiveTab] = useState<"alumnos" | "profesores">("alumnos");


  // Handler for viewing legajo
  const handleVerLegajo = (tipo: "alumno" | "profesor", id: number) => {
    if (tipo === "alumno") {
      // Navegamos usando el ID del aspirante para que la página de detalle funcione
      navigate(`/detLegajo/${id}`); 
    } else {
      navigate(`/detLegajoProfesor/${id}`);
    }
  };
  const [filterCarrera, setFilterCarrera] = useState("");

  useEffect(() => {
    // Usamos la variable de entorno para la URL base de la API
    fetch(`${import.meta.env.VITE_API_BASE_URL}/estudiante`)
      .then(res => {
        if (!res.ok) throw new Error("Error al traer los legajos de estudiantes");
        return res.json();
        })
        .then(data => {
        setEstudiantes(data);
        setLoading(false);
        })
        .catch(err => {
        console.error(err);
        setError("No se pudo cargar la lista de legajos");
        setLoading(false);
        });
    }, []);

    useEffect(() => {
  // Usamos la variable de entorno para la URL base de la API
  fetch(`${import.meta.env.VITE_API_BASE_URL}/docente`)
    .then(res => {
      if (!res.ok) throw new Error("Error al traer los profesores");
      return res.json();
    })
    .then(data => {
      setProfesores(data);
      setLoadingProfesores(false);
    })
    .catch(err => {
      console.error(err);
      setErrorProfesores("No se pudo cargar la lista de profesores");
      setLoadingProfesores(false);
    });
}, []);

  const carrerasUnicas = Array.from(new Set(estudiantes.map(e => e.carrera)));

  const alumnosFiltrados = estudiantes
    .filter(m => 
      `${m.nombre} ${m.apellido} ${m.dni} ${m.carrera}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .filter(m => filterCarrera ? m.carrera === filterCarrera : true);

    const profesoresFiltrados = profesores.filter(p =>
  `${p.nombre} ${p.apellido} ${p.dni}`
    .toLowerCase()
    .includes(searchTerm.toLowerCase())
);
  
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
};
  const handleVer = (id: number) => {
    navigate(`/detAspirante/${id}`, { state: { from: "/matriculacion" } });
  }

  const handleDeleteEstudiante = async (id: number, nombre: string, apellido: string) => {
     if (!confirm(`¿Está seguro de que desea desactivar el legajo de ${nombre} ${apellido}?`)) return;

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/estudiante/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: false }), 
    });

    if (!response.ok) throw new Error("Error al desactivar el legajo");

     setEstudiantes(prev => prev.filter(e => e.id !== id));

    alert("Legajo desactivado correctamente");
  } catch (error) {
    console.error("Error:", error);
    alert("Error al desactivar el legajo del estudiante");
  }
  }
  
  const handleDeleteDocente = async (id: number, nombre: string, apellido: string) => {
  if (!confirm(`¿Está seguro de que desea desactivar el legajo de ${nombre} ${apellido}?`)) return;

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/docente/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: false }),
    });

    if (!response.ok) throw new Error("Error al desactivar el legajo");

    // Actualizamos el estado para removerlo del listado en el frontend
    setProfesores(prev => prev.filter(d => d.id !== id));

    alert("Legajo desactivado correctamente");
  } catch (error) {
    console.error("Error:", error);
    alert("Error al desactivar el legajo del docente");
  }
};


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
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        className={`w-full flex items-center px-6 py-4 text-white hover:bg-[#31546D] transition-colors ${
                          activeSection === item.id ? "bg-[#31546D]" : ""
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <IconComponent className="w-5 h-5 mr-4" />
                        <span className="text-sm font-medium tracking-wide">{item.label}</span>
                      </button>
                    </DialogTrigger>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const newPassword = (form.elements.namedItem('newPassword') as HTMLInputElement).value;
                      const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value;
                      if (!newPassword) { alert('La nueva contraseña es requerida'); return; }
                      if (newPassword !== confirmPassword) { alert('Las contraseñas no coinciden'); return; }
                      alert('Contraseña cambiada (simulado)');
                    }}>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Cambio de contraseña</DialogTitle>
                          <DialogDescription>
                            Ingresa la nueva contraseña.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4">
                          <div className="grid gap-3">
                            <Label htmlFor="new-password">Nueva contraseña</Label>
                            <UiInput id="new-password" name="newPassword" type="password" />
                          </div>
                          <div className="grid gap-3">
                            <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>
                            <UiInput id="confirm-password" name="confirmPassword" type="password" />
                          </div>
                        </div>

                        <DialogFooter>
                          <DialogClose asChild>
                            <UiButton variant="outline">Cancelar</UiButton>
                          </DialogClose>
                          <UiButton type="submit">Cambiar</UiButton>
                        </DialogFooter>
                      </DialogContent>
                    </form>
                  </Dialog>
                </div>
              )
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
  <Card className="bg-white shadow-xl overflow-hidden">
    <Tabs
    value={activeTab}
    onValueChange={(val) => setActiveTab(val as "alumnos" | "profesores")}
    className="w-full"
  >
    <div className="border-b border-gray-200 px-6 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">LEGAJO DIGITAL</h2>
      </div>
      {/* Search Bar */}
          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Input
                type="text"
                placeholder="¿A quien estás buscando?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-12 py-3 rounded-full bg-white border-2 focus:ring-2 focus:ring-blue-500 text-gray-600 text-xl font-sans"
              />
            </div>
  {/* Filtro por Carrera */}
  <select
    value={filterCarrera}
    onChange={(e) => setFilterCarrera(e.target.value)}
    className="w-full h-9 max-w-xs pl-4 pr-12 rounded-full bg-white border-2 focus:ring-2 focus:ring-blue-500 text-gray-600 text-sm font-sans"
  >
    <option value="">Todas las carreras</option>
    {carrerasUnicas.map((c) => (
      <option key={c} value={c}>{c}</option>
    ))}
  </select>
  <div className="flex-1 flex justify-end">
    <Button
      className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
      onClick={() => {
        if (activeTab === "alumnos") {
          navigate("/crearAlumno");
        } else {
          navigate("/crearProfesor");
        }
      }}
    >
      <Plus className="w-4 h-4" />
      Agregar Legajo
    </Button>
  </div>
</div>
      <TabsList className="grid w-full grid-cols-2 max-w-md">
        <TabsTrigger value="alumnos" className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4" />
          Alumnos ({alumnosFiltrados.length})
        </TabsTrigger>
        <TabsTrigger value="profesores" className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Profesores ({profesoresFiltrados.length}) 
        </TabsTrigger>
      </TabsList>
    </div>
    <TabsContent value="alumnos" className="p-6">
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
            {alumnosFiltrados.map((estudiante, index) => (
              <tr key={estudiante.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                <td className="py-2 px-3 font-bold text-gray-900">{estudiante.nombre}</td>
                <td className="py-2 px-3 text-gray-600">{estudiante.apellido}</td>
                <td className="py-2 px-3 text-gray-600">{estudiante.carrera}</td>
                <td className="py-2 px-3 text-gray-600">{estudiante.dni}</td>
   
                <td className="py-2 px-3">
                  <div className="flex justify-center gap-2">
                    <Button
                      onClick={() => handleVerLegajo("alumno", estudiante.aspirante_id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Ver legajo
                    </Button>
                    <Button
                      onClick={() =>
                       handleDeleteEstudiante(estudiante.id, estudiante.nombre, estudiante.apellido)
                      }
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                      >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                      </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TabsContent>
    <TabsContent value="profesores" className="p-6">
  {loadingProfesores ? (
    <p className="text-gray-700">Cargando profesores...</p>
  ) : errorProfesores ? (
    <p className="text-red-500">{errorProfesores}</p>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-3 font-semibold text-gray-700">NOMBRE</th>
            <th className="text-left py-2 px-3 font-semibold text-gray-700">APELLIDO</th>
            {/* <th className="text-left py-2 px-3 font-semibold text-gray-700">ESPECIALIDAD</th> */}
            <th className="text-left py-2 px-3 font-semibold text-gray-700">DNI</th>
            <th className="text-center py-2 px-3 font-semibold text-gray-700">ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {profesoresFiltrados.map((profesor, index) => (
            <tr key={profesor.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
              <td className="py-2 px-3 font-bold text-gray-900">{profesor.nombre}</td>
              <td className="py-2 px-3 text-gray-600">{profesor.apellido}</td>
              {/* <td className="py-2 px-3 text-gray-600">{profesor.especialidad}</td> */}
              <td className="py-2 px-3 text-gray-600">{profesor.dni}</td>
              <td className="py-2 px-3">
                <div className="flex justify-center gap-2">
                  <Button
                    onClick={() => handleVerLegajo("profesor", profesor.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Ver legajo
                  </Button>
                  <Button
                    onClick={() =>
                       handleDeleteDocente(profesor.id, profesor.nombre, profesor.apellido)
                      }
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</TabsContent>
  </Tabs>
</Card>
    </main>
  </div>
  )
}
