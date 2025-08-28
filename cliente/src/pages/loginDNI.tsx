"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Button } from "../components/ui/button"
import {
  Menu,
  X,
  Home,
  Users,
  BarChart3,
  Clock,
  ThumbsUp,
  FolderOpen,
  FileText,
  LogOut,
  Settings,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react"
import { useNavigate } from "react-router"

export default function LoginDni() {
  const Navigate = useNavigate()
  const [dni, setDni] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "") // Solo números
    setDni(value)
    if (error) setError("") // Limpiar error al escribir
  }

  const handleDniSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (dni.length < 7 || dni.length > 8) {
      setError("El DNI debe tener entre 7 y 8 dígitos")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // 👉 Llamar a tu backend (ajustá la URL según tu setup: proxy, puerto, etc.)
      const response = await fetch("http://localhost:3000/matricula/iniciar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni }),
      })

      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data.reason || "DNI no válido para matriculación")
      }

      // ✅ Todo OK, redirigir pasando el DNI (o id del aspirante si preferís)
      Navigate(`/formMatriculacion/${data.aspirante.id}`, {
        state: { nombre: data.aspirante.nombre, apellido: data.aspirante.apellido }
      })
    } catch (error: any) {
      console.error("Error al verificar DNI:", error)
      setError(error.message || "DNI no válido")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    Navigate("/")
  }

  return (
    <div className="min-h-screen bg-[#1F6680] from-teal-600 to-teal-800 flex flex-col items-center justify-center relative p-4">
          {/* Botón de regreso */}
        <button
            onClick={handleBack}
            className="absolute top-4 left-4 md:top-10 md:left-10 flex items-center justify-center w-12 h-12 bg-slate-800 hover:bg-teal-600 rounded-full transition-colors"
        >
            <ArrowLeft className="w-6 h-6 text-white" />
        </button>
    
      {/* Main Content */}
      <main className="p-8">
        <div className="max-w-2xl mx-auto">
          {/* Page Title */}
          <div className="mb-8 text-center">
            <h2 className="text-white text-3xl font-bold mb-4">Matriculación</h2>
            <p className="text-white/80 text-lg">Ingrese su DNI para continuar con el proceso</p>
          </div>

          {/* DNI Input Card */}
          <Card className="bg-white shadow-xl overflow-hidden">
            <div className="p-8">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-[#1F6680] rounded-full flex items-center justify-center">
                  <FileText className="w-10 h-10 text-white" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-800 text-center mb-2">Proceso de Matriculación</h3>
              <p className="text-gray-600 text-center mb-8">
                Para continuar con su matriculación, ingrese su número de DNI
              </p>

              {/* DNI Form */}
              <form onSubmit={handleDniSubmit} className="space-y-6">
                {/* Error message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                {/* DNI Input */}
                <div className="space-y-2">
                  <Label htmlFor="dni" className="text-gray-700 font-medium">
                    Número de DNI
                  </Label>
                  <div className="relative">
                    <Input
                      id="dni"
                      type="text"
                      value={dni}
                      onChange={handleDniChange}
                      placeholder="Ej: 43189371"
                      className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-0"
                      maxLength={8}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Users className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">Ingrese su DNI sin puntos ni espacios</p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || dni.length < 7}
                  className="w-full bg-[#1F6680] hover:bg-slate-800 text-white py-3 text-lg font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Verificando...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Continuar con Matriculación
                    </div>
                  )}
                </Button>
              </form>

              {/* Help Text */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-red-800 text-sm">
                    <p className="font-medium mb-1">Información importante:</p>
                    <ul className="list-disc list-inside space-y-1 text-red-700">
                      <li>Debe haber completado previamente el proceso de preinscripción</li>
                      <li>Tenga a mano los documentos requeridos para la matriculación</li>
                      <li>El DNI debe coincidir con el utilizado en la preinscripción</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
