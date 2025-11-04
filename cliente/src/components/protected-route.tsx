"use client"

import type React from "react"
import { useEffect } from "react"
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

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate(redirectTo)
      return
    }

    if (allowedRoles && allowedRoles.length > 0) {
      if (!hasAnyRole(allowedRoles)) {
        if (roleRedirects) {
          const userRole = getUserRole()
          if (userRole && roleRedirects[userRole]) {
            navigate(roleRedirects[userRole]!)
            return
          }
        }
        navigate("/login")
        return
      }
    }
  }, [allowedRoles, redirectTo, roleRedirects, navigate])

  return <>{children}</>
}
