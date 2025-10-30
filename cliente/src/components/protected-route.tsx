"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { type RolUsuario, hasAnyRole, isAuthenticated, getUserRole } from "../lib/auth"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: RolUsuario[]
  redirectTo?: string
  roleRedirects?: Partial<Record<RolUsuario, string>>
}

export function ProtectedRoute({ children, allowedRoles, redirectTo = "/login", roleRedirects }: ProtectedRouteProps) {
  const navigate = useNavigate()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar autenticación
    if (!isAuthenticated()) {
      navigate(redirectTo)
      return
    }

    // Si se especificaron roles, verificar autorización
    if (allowedRoles && allowedRoles.length > 0) {
      if (!hasAnyRole(allowedRoles)) {
        if (roleRedirects) {
          const userRole = getUserRole()
          if (userRole && roleRedirects[userRole]) {
            navigate(roleRedirects[userRole]!)
            return
          }
        }
        // Si no hay redirección específica, ir a unauthorized
        navigate("/login")
        return
      }
    }

    setIsAuthorized(true)
    setIsLoading(false)
  }, [allowedRoles, redirectTo, roleRedirects, navigate])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
