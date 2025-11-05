"use client"
import { logout } from "../lib/auth"
import { ProtectedRoute } from "../components/protected-route"
import { RolUsuario } from "../lib/types"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {CustomDialog} from "../components/ui/customDialog"
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
  RotateCcwKey,
} from "lucide-react"
import logo from "../assets/logo.png"
import logo2 from "../assets/logo2.png"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"

import ChangePasswordDialog from '../components/ChangePasswordDialog';

// URL base para API
const API_BASE_URL_CARRERA = `${import.meta.env.VITE_API_BASE_URL}/carrera`;
const API_BASE_URL_USUARIO = `${import.meta.env.VITE_API_BASE_URL}/usuario`;

type Carrera = {
  id: number;
  nombre: string;
  cupoMaximo: number;
  cupoActual: number;
  activo: boolean;
};

// Función para transformar datos del backend a formato frontend
const mapCarreraFromApi = (c: any): Carrera => ({
  id: c.id,
  nombre: c.nombre,
  cupoMaximo: c.cupo_maximo,
  cupoActual: c.cupo_actual,
  activo: c.activo,
});

// Datos de ejemplo para carreras
const carrerasData = [
  { id: 1, nombre: "DESARROLLO DE SOFTWARE", cupoMaximo: 30 },
  { id: 2, nombre: "ADMINISTRACIÓN", cupoMaximo: 25 },
  { id: 3, nombre: "ENFERMERÍA", cupoMaximo: 20 },
  { id: 4, nombre: "CONTABILIDAD", cupoMaximo: 15 },
]

// Datos de ejemplo para usuarios
const usuariosData = [
  { id: 1, usuario: "admin", rol: "administrador", activo: true },
  { id: 2, usuario: "secretaria1", rol: "secretaria", activo: true },
  { id: 3, usuario: "coordinador1", rol: "coordinador", activo: true },
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
  { icon: RotateCcwKey, label: "GESTIÓN DE CUENTA", id: "cambio-contrasena" },
]

const roles = [
  { value: "ADMIN_GENERAL", label: "Administrador general" },
  { value: "GESTOR_ACADEMICO", label: "Gestor académico" },
  { value: "PROFESOR", label: "Profesor" },
];

// Limites y normalización
const NOMBRE_MAX = 100;
const normalizeName = (s: string) =>
  s
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // saca acentos
    .trim()
    .toLowerCase();

export default function Mantenimiento() {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("mantenimiento")
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("carreras")
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const [dialogProps, setDialogProps] = useState<{
    title?: string
    description?: string
    variant?: "info" | "error" | "success" | "confirm"
    onConfirm?: (() => void) | undefined
    onCancel?: (() => void) | undefined
    confirmText?: string
    cancelText?: string
  }>({})

  // Estados para carreras
  const [carreras, setCarreras] = useState<Carrera[]>([])
  const [editingCarrera, setEditingCarrera] = useState<number | null>(null)
  const [newCarrera, setNewCarrera] = useState({ nombre: "", cupoMaximo: 0 })
  const [showNewCarreraForm, setShowNewCarreraForm] = useState(false)
  const [errors, setErrors] = useState<{ nombre?: string; cupoMaximo?: string }>({});

  // Estados para usuarios
  const [usuarios, setUsuarios] = useState(usuariosData)
  const [editingUsuario, setEditingUsuario] = useState<number | null>(null)
  const [newUsuario, setNewUsuario] = useState({ usuario: "", rol: "", dni: "" })
  const [showNewUsuarioForm, setShowNewUsuarioForm] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE_URL_CARRERA}?includeInactive=true`)
      .then((res) => res.json())
      .then((data) => setCarreras(data.map(mapCarreraFromApi)))
      .catch((err) => console.error("Error cargando carreras:", err));
  }, []);

  // Mapper para usuarios del backend -> frontend
  const mapUsuarioFromApi = (u: any) => ({
    id: u.id,
    usuario: u.nombre_usuario,
    email: u.correo,
    rol: u.rol,
    activo: u.activo,
  });

  // Cargar usuarios desde backend
  useEffect(() => {
    fetch(API_BASE_URL_USUARIO)
      .then((res) => res.json())
      .then((data) => setUsuarios(data.map(mapUsuarioFromApi)))
      .catch((err) => console.error("Error cargando usuarios:", err));
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleLogout = () => {
      localStorage.removeItem("adminRemember")
      localStorage.removeItem("adminUser")
      setDialogProps({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente.",
        variant: "success",
        confirmText: "Entendido",
        onConfirm: () => logout()
      })
      setIsLogoutDialogOpen(true)
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
    const nombre = newCarrera.nombre.trim();
    const cupo = Number(newCarrera.cupoMaximo);

    if (!nombre) {
      setDialogProps({
        title: "Error",
        description: "El nombre es obligatorio",
        variant: "error",
        confirmText: "Entendido",
      });
      setIsLogoutDialogOpen(true);
      return;
    }
    if (nombre.length > NOMBRE_MAX) {
      setDialogProps({
        title: "Error",
        description: `El nombre no puede superar ${NOMBRE_MAX} caracteres`,
        variant: "error",
        confirmText: "Entendido",
      });
      setIsLogoutDialogOpen(true);
      return;
    }
    if (!Number.isFinite(cupo) || cupo < 0) {
      setDialogProps({
        title: "Error",
        description: "El cupo máximo debe ser 0 o mayor",
        variant: "error",
        confirmText: "Entendido",
      });
      setIsLogoutDialogOpen(true);
      return;
    }

    // Duplicados (case/acentos-insensible)
    const existe = carreras.some(
      (c) => normalizeName(c.nombre) === normalizeName(nombre)
    );
    if (existe) {
      setDialogProps({
        title: "Error",
        description: "Ya existe una carrera con ese nombre",
        variant: "error",
        confirmText: "Entendido",
      });
      setIsLogoutDialogOpen(true);
      return;
    }

    try {
      const response = await fetch(API_BASE_URL_CARRERA, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: newCarrera.nombre,
          cupo_maximo: newCarrera.cupoMaximo,
          cupo_actual: newCarrera.cupoMaximo,
        }),
      });

      if (!response.ok) {
        let msg = "Error al crear carrera";
        try {
          const err = await response.json();
          msg = (Array.isArray(err.message) ? err.message[0] : err.message) || msg;
        } catch {}
        throw new Error(msg);
      }

      const creada = mapCarreraFromApi(await response.json());
      setCarreras([...carreras, creada]);
      setNewCarrera({ nombre: "", cupoMaximo: 0 });
      setShowNewCarreraForm(false);
      setDialogProps({
        title: "Carrera creada",
        description: "La carrera se ha creado correctamente.",
        variant: "success",
        confirmText: "Entendido",
      });
      setIsLogoutDialogOpen(true);
    } catch (error: any) {
      console.error(error);
      setDialogProps({
        title: "Error",
        description: error?.message || "Error al crear carrera",
        variant: "error",
        confirmText: "Entendido",
      });
      setIsLogoutDialogOpen(true);
    }
  }

  const handleUpdateCarrera = async (id: number, updatedData: any) => {
    const nombre = (updatedData.nombre ?? "").trim();
    const cupo = Number(updatedData.cupoMaximo);

    // nombre obligatorio y longitud
    if (!nombre) {
      setDialogProps({
        title: "Error",
        description: "El nombre es obligatorio",
        variant: "error",
        confirmText: "Entendido",
      });
      setIsLogoutDialogOpen(true);
      return;
    }
    if (nombre.length > NOMBRE_MAX) {
      setDialogProps({
        title: "Error",
        description: `El nombre no puede superar ${NOMBRE_MAX} caracteres`,
        variant: "error",
        confirmText: "Entendido",
      });
      setIsLogoutDialogOpen(true);
      return;
    }

    // cupo no negativo
    if (!Number.isFinite(cupo) || cupo < 0) {
      setDialogProps({
        title: "Error",
        description: "El cupo máximo debe ser 0 o mayor",
        variant: "error",
        confirmText: "Entendido",
      });
      setIsLogoutDialogOpen(true);
      return;
    }

    // duplicados (excluyendo la propia carrera)
    const existe = carreras.some(
      (c) => c.id !== id && normalizeName(c.nombre) === normalizeName(nombre)
    );
    if (existe) {
      setDialogProps({
        title: "Error",
        description: "Ya existe una carrera con ese nombre",
        variant: "error",
        confirmText: "Entendido",
      });
      setIsLogoutDialogOpen(true);
      return;
    }

    try {
  const response = await fetch(`${API_BASE_URL_CARRERA}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: updatedData.nombre,
      cupo_maximo: updatedData.cupoMaximo,
      cupo_actual: updatedData.cupoActual,
    }),
  });

  const data = await response.json(); // la leemos UNA vez

  if (!response.ok) {
    let msg = "Error al actualizar carrera";
    msg = Array.isArray(data.message) ? data.message[0] : data.message || msg;
    throw new Error(msg);
  }

  const actualizadaFromApi = mapCarreraFromApi(data);

  setCarreras(carreras.map((c) =>
    c.id === id
      ? { 
          ...c, // conservamos campos que no se modificaron
          nombre: actualizadaFromApi.nombre,
          cupoMaximo: actualizadaFromApi.cupoMaximo,
          cupoActual: actualizadaFromApi.cupoActual
        }
      : c
  ));

  setEditingCarrera(null);
  setDialogProps({
    title: "Carrera actualizada",
    description: "La carrera se ha actualizado correctamente.",
    variant: "success",
    confirmText: "Entendido",
  });
  setIsLogoutDialogOpen(true);
} catch (error: any) {
  console.error(error);
  setDialogProps({
    title: "Error",
    description: error?.message || "Error al actualizar carrera",
    variant: "error",
    confirmText: "Entendido",
  });
  setIsLogoutDialogOpen(true);
}
  }

  const handleToggleCarrera = async (id: number, activo: boolean) => {
  try {
    const response = await fetch(`${API_BASE_URL_CARRERA}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !activo }),
    });

    if (!response.ok) throw new Error("Error al cambiar estado de la carrera");

    const actualizada = mapCarreraFromApi(await response.json());
    setCarreras(carreras.map((c) => (c.id === id ? actualizada : c)));

    setDialogProps({
      title: "Éxito",
      description: `Carrera ${!activo ? "activada" : "desactivada"} correctamente`,
      variant: "success",
      confirmText: "Entendido",
    });
    setIsLogoutDialogOpen(true);
  } catch (error) {
    console.error("Error:", error);
    setDialogProps({
      title: "Error",
      description: "Error al cambiar estado de la carrera",
      variant: "error",
      confirmText: "Entendido",
    });
    setIsLogoutDialogOpen(true);
  }
};

  // Funciones para usuarios
  const handleCreateUsuario = async () => {
    if (!newUsuario.usuario.trim() || !newUsuario.rol) {
      setDialogProps({
        title: "Error",
        description: "Por favor complete todos los campos",
        variant: "error",
        confirmText: "Entendido",
      });
      setIsLogoutDialogOpen(true);
      return;
    }

    // Validación duplicados (case-insensitive para evitar "Admin" vs "admin")
    const existe = usuarios.some(
      (u) => u.usuario.toLowerCase() === newUsuario.usuario.trim().toLowerCase()
    );

    if (existe) {
      setDialogProps({
        title: "Error",
        description: "Ya existe un usuario con ese nombre",
        variant: "error",
        confirmText: "Entendido",
      });
      setIsLogoutDialogOpen(true);
      return;
    }

    try {
      const response = await fetch(API_BASE_URL_USUARIO, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_usuario: newUsuario.usuario,
          rol: newUsuario.rol,
          dni: newUsuario.rol === 'PROFESOR' ? newUsuario.dni : undefined,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error("Error al crear usuario: " + text);
      }

      const creado = await response.json();
      setUsuarios([...usuarios, mapUsuarioFromApi(creado)]);
      setNewUsuario({ usuario: "", rol: "", dni: "" });
      setShowNewUsuarioForm(false);
      setDialogProps({
        title: "Éxito",
        description: "Usuario creado correctamente (contraseña por defecto: 1234)",
        variant: "success",
        confirmText: "Entendido",
      });
      setIsLogoutDialogOpen(true);
    } catch (error) {
      console.error("Error:", error);
      // fallback local (si querés seguir con simulación)
      const nuevoUsuario = { ...newUsuario, id: Date.now(), activo: true };
      setUsuarios([...usuarios, mapUsuarioFromApi(nuevoUsuario)]); // Usar el mapper
      setNewUsuario({ usuario: "", rol: "", dni: "" });
      setShowNewUsuarioForm(false);
      alert("Usuario creado correctamente (simulado)");
    }
  }

  const handleUpdateUsuario = async (id: number, updatedData: any) => {
    // Validación duplicados (case-insensitive)
    if (updatedData.usuario) {
      const existe = usuarios.some(
        (u) =>
          u.id !== id && // no comparar con el mismo usuario
          u.usuario.toLowerCase() === updatedData.usuario.trim().toLowerCase()
      );

      if (existe) {
        setDialogProps({
          title: "Error",
          description: "Ya existe un usuario con ese nombre",
          variant: "error",
          confirmText: "Entendido",
        });
        setIsLogoutDialogOpen(true);
        return;
      }
    }

    try {
      // Construyo el payload sólo con las llaves backend
      const payload: any = {};
      if (updatedData.usuario !== undefined) payload.nombre_usuario = updatedData.usuario;
      if (updatedData.rol !== undefined) payload.rol = updatedData.rol;

      const response = await fetch(`${API_BASE_URL_USUARIO}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Error al actualizar usuario");

      const actualizado = await response.json(); // backend user
      setUsuarios(usuarios.map((u) => (u.id === id ? mapUsuarioFromApi(actualizado) : u)));
      setEditingUsuario(null);
      setDialogProps({
        title: "Éxito",
        description: "Usuario actualizado correctamente",
        variant: "success",
        confirmText: "Entendido",
      });
      setIsLogoutDialogOpen(true);
    } catch (error) {
      console.error("Error:", error);
      // fallback local
      setUsuarios(usuarios.map((u) => (u.id === id ? { ...u, ...updatedData } : u)));
      setEditingUsuario(null);
      setDialogProps({
        title: "Éxito",
        description: "Usuario actualizado correctamente (simulado)",
        variant: "success",
        confirmText: "Entendido",
      });
      setIsLogoutDialogOpen(true);
    }
  }

  const handleToggleUsuario = async (id: number, activo: boolean) => {
  try {
    const response = await fetch(`${API_BASE_URL_USUARIO}/${id}/activo`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !activo }),
    });

    if (!response.ok) throw new Error("Error al cambiar estado del usuario");

    const actualizada = mapUsuarioFromApi(await response.json());
    setUsuarios(usuarios.map((u) => (u.id === id ? actualizada : u)));

    setDialogProps({
      title: "Éxito",
      description: `Usuario ${!activo ? "activado" : "desactivado"} correctamente`,
      variant: "success",
      confirmText: "Entendido",
    });
    setIsLogoutDialogOpen(true);
  } catch (error) {
    console.error(error);
    setDialogProps({
      title: "Error",
      description: "Error al cambiar estado del usuario",
      variant: "error",
      confirmText: "Entendido",
    });
    setIsLogoutDialogOpen(true);
  }
};

  const handleResetPassword = async (id: number) => {
    setDialogProps({
      title: "Confirmar reinicio de contraseña",
      description: "¿Está seguro que desea resetear la contraseña de este usuario?",
      variant: "confirm",
      confirmText: "Sí, resetear",
      cancelText: "Cancelar",
      onConfirm: async () => {
        // Cerrar el dialogo de confirmación antes de ejecutar la petición
        setIsLogoutDialogOpen(false);
        try {
          const response = await fetch(`${API_BASE_URL_USUARIO}/${id}/reset-password`, { method: "PUT" });
          if (!response.ok) {
            let msg = "Error al resetear contraseña";
            try {
              const err = await response.json();
              msg = (Array.isArray(err.message) ? err.message[0] : err.message) || msg;
            } catch {}
            throw new Error(msg);
          }
          setDialogProps({
            title: "Éxito",
            description: "Contraseña reiniciada a '1234'",
            variant: "success",
            confirmText: "Entendido",
          });
          setIsLogoutDialogOpen(true);
        } catch (error: any) {
          console.error(error);
          setDialogProps({
            title: "Error",
            description: error?.message || "Error al resetear contraseña",
            variant: "error",
            confirmText: "Entendido",
          });
          setIsLogoutDialogOpen(true);
        }
      },
      onCancel: () => setIsLogoutDialogOpen(false),
    });
    setIsLogoutDialogOpen(true);
    return;

    try {
      const response = await fetch(`${API_BASE_URL_USUARIO}/${id}/reset-password`, { method: "PUT" });
      if (!response.ok) throw new Error("Error al resetear contraseña");

      setDialogProps({
        title: "Éxito",
        description: "Contraseña reiniciada a '1234'",
        variant: "success",
        confirmText: "Entendido",
      });
      setIsLogoutDialogOpen(true);
    } catch (error) {
      console.error("Error:", error);
      setDialogProps({
        title: "Error",
        description: "Error al resetear contraseña",
        variant: "error",
        confirmText: "Entendido",
      });
      setIsLogoutDialogOpen(true);
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
                maxLength={NOMBRE_MAX}
              />
            </div>
            <div>
              <Label>Cupo Máximo</Label>
              <Input
                type="number"
                value={newCarrera.cupoMaximo}
                onChange={(e) => setNewCarrera({ ...newCarrera, cupoMaximo: Number.parseInt(e.target.value) })}
                placeholder="Ej: 30"
                min={0}                       
                step={1}
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
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Estado</th>
              </tr>
            </thead>
            <tbody>
              {carreras.map((carrera) => (
                <tr key={carrera.id} className="border-t">
                  <td className="py-3 px-4">
                    {editingCarrera === carrera.id ? (
                      <Input
                        value={newCarrera.nombre}
                        onChange={(e) => setNewCarrera({ ...newCarrera, nombre: e.target.value })}
                        maxLength={NOMBRE_MAX}
                      />
                    ) : (
                      <span className="font-medium">{carrera.nombre}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingCarrera === carrera.id ? (
                      <Input
                        type="number"
                        value={newCarrera.cupoMaximo}
                        onChange={(e) => setNewCarrera({ ...newCarrera, cupoMaximo: Number.parseInt(e.target.value) })}
                        min={0}
                        step={1}
                      />
                    ) : (
                      <span>{carrera.cupoMaximo}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center gap-2">
                      {editingCarrera === carrera.id ? (
                        <>
                          <Button
                            onClick={() => {
                              handleUpdateCarrera(carrera.id, newCarrera);
                            }}
                            className="bg-green-500 hover:bg-green-600 text-white p-2"
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingCarrera(null);
                              setNewCarrera({ nombre: carrera.nombre, cupoMaximo: carrera.cupoMaximo });
                            }}
                            className="bg-gray-400 hover:bg-gray-500 text-white p-2"
                          >
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => {
                              setEditingCarrera(carrera.id);
                              setNewCarrera({ nombre: carrera.nombre, cupoMaximo: carrera.cupoMaximo });
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleToggleCarrera(carrera.id, carrera.activo)}
                            className={`w-24 h-10 flex items-center justify-center rounded-lg ${carrera.activo ? 'bg-red-500' : 'bg-green-500'}`}
                          >
                            {carrera.activo ? "Desactivar" : "Activar"}
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                                      <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded ${carrera.activo ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
                        {carrera.activo ? "Activa" : "Inactiva"}
                      </span>
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
            {/* Campo DNI condicional */}
            <div className={`transition-opacity duration-300 ${newUsuario.rol === 'PROFESOR' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <Label>DNI del Profesor</Label>
              <Input
                value={newUsuario.dni}
                onChange={(e) => setNewUsuario({ ...newUsuario, dni: e.target.value.replace(/\D/g, '') })}
                placeholder="DNI (solo números)"
                disabled={newUsuario.rol !== 'PROFESOR'}
              />
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
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Rol</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Acciones</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Estado</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="border-t">
                  <td className="py-3 px-4">
                    {editingUsuario === usuario.id ? (
                      <Input
                        value={newUsuario.usuario}
                        onChange={(e) => setNewUsuario({ ...newUsuario, usuario: e.target.value })}
                      />
                    ) : (
                      <span className="font-medium">{usuario.usuario}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingUsuario === usuario.id ? (
                      <Select
                        value={newUsuario.rol}
                        onValueChange={(value) => setNewUsuario({ ...newUsuario, rol: value })}
                      >
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
                    ) : (
                      <span className="capitalize">{usuario.rol}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center gap-2">
                      {editingUsuario === usuario.id ? (
                        <>
                          <Button
                            onClick={() => handleUpdateUsuario(usuario.id, newUsuario)}
                            className="bg-green-500 hover:bg-green-600 text-white p-2"
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingUsuario(null);
                              setNewUsuario({ usuario: usuario.usuario, rol: usuario.rol, dni: "" });
                            }}
                            className="bg-gray-400 hover:bg-gray-500 text-white p-2"
                          >
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => {
                              setEditingUsuario(usuario.id);
                              setNewUsuario({ usuario: usuario.usuario, rol: usuario.rol, dni: "" });
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleToggleUsuario(usuario.id, usuario.activo)}
                            className={`w-24 h-10 flex items-center justify-center rounded-lg ${
                              usuario.activo ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                            } text-white`}
                          >
                            {usuario.activo ? 'Desactivar' : 'Activar'}
                          </Button>
                          <Button
                            onClick={() => handleResetPassword(usuario.id)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white p-2"
                            title="Resetear contraseña a 1234"
                          >
                            RESET
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded ${
                        usuario.activo ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                      }`}
                    >
                      {usuario.activo ? "Activo" : "Inactivo"}
                    </span>
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
    <ProtectedRoute 
  allowedRoles={[RolUsuario.ADMIN_GENERAL]}
  roleRedirects={{
    [RolUsuario.GESTOR_ACADEMICO]: "/admin",
    [RolUsuario.PROFESOR]: "/admin"
  }}
>
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
            if (item.id === 'cambio-contrasena') {
              return (
                <div key={item.id}>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setDialogOpen(true);
                    }}
                    className={`w-full flex items-center px-6 py-4 text-white hover:bg-[#31546D] transition-colors ${
                      activeSection === item.id ? 'bg-[#31546D]' : ''
                    }`}
                  >
                    <IconComponent className="w-5 h-5 mr-4" />
                    <span className="text-sm font-medium tracking-wide">{item.label}</span>
                  </button>

                  <ChangePasswordDialog
                    open={dialogOpen}
                    onOpenChange={(open) => {
                      setDialogOpen(open);
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
    </ProtectedRoute>
  )
}
