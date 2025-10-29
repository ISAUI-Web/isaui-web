"use client"

import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { ShieldAlert } from "lucide-react"
import { useRouter } from "next/navigation"

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <ShieldAlert className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Acceso Denegado</h1>
        <p className="text-muted-foreground mb-6">No tienes permisos para acceder a esta página.</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => router.back()} variant="outline">
            Volver
          </Button>
          <Button onClick={() => router.push("/")}>Ir al Inicio</Button>
        </div>
      </Card>
    </div>
  )
}
