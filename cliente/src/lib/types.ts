// Tipos compartidos para la aplicación

export enum RolUsuario {
  ADMIN_GENERAL = "ADMIN_GENERAL",
  GESTOR_ACADEMICO = "GESTOR_ACADEMICO",
  PROFESOR = "PROFESOR",
}

export interface Usuario {
  id: number
  nombre_usuario: string
  rol: RolUsuario
  dni: string | null;
  // Agregar más campos según tu backend
}

export interface AuthData {
  token: string
  usuario: Usuario
}