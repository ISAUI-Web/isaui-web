// Utilidades de autenticación para el frontend

export enum RolUsuario {
  ADMIN_GENERAL = "ADMIN_GENERAL",
  GESTOR_ACADEMICO = "GESTOR_ACADEMICO",
  PROFESOR = "PROFESOR",
}

export interface Usuario {
  id: number
  nombre_usuario: string
  rol: RolUsuario
}

export interface AuthData {
  token: string
  usuario: Usuario
}

export async function login(email: string, password: string): Promise<AuthData> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

  const response = await fetch(`${API_URL}/usuario/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    throw new Error("Error al iniciar sesión")
  }

  const data: AuthData = await response.json()

  // Guardar en localStorage
  localStorage.setItem("token", data.token)
  localStorage.setItem("usuario", JSON.stringify(data.usuario))

  return data
}

// Obtener datos de autenticación del localStorage
export function getAuthData(): AuthData | null {
  if (typeof window === "undefined") return null

  // Intentar primero con localStorage (recordarme)
  let token = localStorage.getItem("token")
  let usuarioStr = localStorage.getItem("usuario")

  // Si no está en localStorage, intentar con sessionStorage
  if (!token || !usuarioStr) {
    token = sessionStorage.getItem("token")
    usuarioStr = sessionStorage.getItem("usuario")
  }

  if (!token || !usuarioStr) return null

  try {
    const usuario = JSON.parse(usuarioStr)
    return { token, usuario }
  } catch {
    return null
  }
}

export function getUser(): Usuario | null {
  const authData = getAuthData()
  return authData?.usuario || null
}

// Verificar si el usuario está autenticado
export function isAuthenticated(): boolean {
  return getAuthData() !== null
}

// Obtener el rol del usuario actual
export function getUserRole(): RolUsuario | null {
  const authData = getAuthData()
  return authData?.usuario.rol || null
}

// Verificar si el usuario tiene un rol específico
export function hasRole(role: RolUsuario): boolean {
  const userRole = getUserRole()
  return userRole === role
}

// Verificar si el usuario tiene alguno de los roles permitidos
export function hasAnyRole(roles: RolUsuario[]): boolean {
  const userRole = getUserRole()
  return userRole ? roles.includes(userRole) : false
}

// Cerrar sesión
export function logout(): void {
  localStorage.removeItem("token")
  localStorage.removeItem("usuario")
  sessionStorage.removeItem("token")
  sessionStorage.removeItem("usuario")
}

// Obtener el token para las peticiones API
export function getAuthToken(): string | null {
  const authData = getAuthData()
  return authData?.token || null
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken()

  if (!token) {
    return {
      "Content-Type": "application/json",
    }
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
}