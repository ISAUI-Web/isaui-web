import { getAuthHeaders } from "./auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

// Función helper para hacer peticiones autenticadas
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  })

  if (response.status === 401) {
    // Token expirado o inválido
    window.location.href = "/login"
    throw new Error("No autorizado")
  }

  return response
}

// Ejemplo de uso para obtener usuarios (solo ADMIN)
export async function getUsuarios() {
  const response = await fetchWithAuth("/usuario")
  if (!response.ok) {
    throw new Error("Error al obtener usuarios")
  }
  return response.json()
}
