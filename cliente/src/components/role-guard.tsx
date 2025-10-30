"use client"

import type React from "react"

import { type RolUsuario, hasAnyRole } from "../lib/auth"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: RolUsuario[]
  fallback?: React.ReactNode
}

// Componente para mostrar/ocultar elementos según el rol
export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const hasPermission = hasAnyRole(allowedRoles)

  if (!hasPermission) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
