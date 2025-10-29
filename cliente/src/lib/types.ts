// Tipos compartidos para la aplicación

export enum RolUsuario {
  ADMIN_GENERAL = "ADMIN_GENERAL",
  ADMIN_SUCURSAL = "ADMIN_SUCURSAL",
  EMPLEADO = "EMPLEADO",
}

export interface Usuario {
  id: number
  nombre_usuario: string
  rol: RolUsuario
  // Agregar más campos según tu backend
}

export interface AuthData {
  token: string
  usuario: Usuario
}
