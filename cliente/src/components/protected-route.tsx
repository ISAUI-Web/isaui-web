"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { type RolUsuario, hasAnyRole, isAuthenticated } from "../lib/auth"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: RolUsuario[]
  redirectTo?: string
}

export function ProtectedRoute({ children, allowedRoles, redirectTo = "/login" }: ProtectedRouteProps) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar autenticación
    if (!isAuthenticated()) {
      router.push(redirectTo)
      return
    }

    // Si se especificaron roles, verificar autorización
    if (allowedRoles && allowedRoles.length > 0) {
      if (!hasAnyRole(allowedRoles)) {
        router.push("/unauthorized")
        return
      }
    }

    setIsAuthorized(true)
    setIsLoading(false)
  }, [allowedRoles, redirectTo, router])

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
