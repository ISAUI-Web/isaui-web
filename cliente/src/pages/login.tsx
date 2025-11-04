"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Checkbox } from "../components/ui/checkbox"
import { Card } from "../components/ui/card"
import { ArrowLeft, User } from "lucide-react"
import { useNavigate } from "react-router-dom"


interface LoginForm {
  usuario: string
  contrasena: string
  recordarme: boolean
}

export default function Login() {
  const [formData, setFormData] = useState<LoginForm>({
    usuario: "",
    contrasena: "",
    recordarme: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()


  const handleInputChange = (field: keyof LoginForm, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }


  //VALIDACIONES: DIEGO LUNA NO TE QUEJES DE LAS VALIDACIONES
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.usuario.trim()) {
      newErrors.usuario = "El usuario es requerido"
    }

    if (!formData.contrasena.trim()) {
      newErrors.contrasena = "La contraseña es requerida"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;

  setIsLoading(true);

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/usuario/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre_usuario: formData.usuario, 
        contrasena: formData.contrasena,
      }),
    });

    if (!response.ok) {
      
      const errorData = await response.json();
      setErrors({ general: errorData.message || 'Error en el login' });
      setIsLoading(false);
      return;
    }

    const data = await response.json();


    // Guardar SIEMPRE el token (para que funcione el cambio de contraseña)
    if (data.token) {
      localStorage.setItem('token', data.token);
      console.log(JSON.parse(atob(data.token.split(".")[1])))
    }

    // Guardar usuario solo si "Recuérdame" (opcional, para persistencia)
    if (formData.recordarme) {
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      // Opcional: guardar recordarme para pre-marcar el checkbox
      localStorage.setItem('recordarme', 'true');
    }

    setIsLoading(false);
    navigate('/admin'); // Redirigimos al panel admin

  } catch (error) {
    console.error(error);
    setErrors({ general: 'Error de conexión con el servidor' });
    setIsLoading(false);
  }
};


  const handleBack = () => {
    navigate("/")
  }

  return (
    <div className="min-h-screen bg-[#1F6680] from-teal-600 to-teal-800 relative p-4">
      {/* Franjas laterales decorativas */}
      <div className="absolute left-0 top-0 h-full w-16 bg-[#274357]"></div>
      <div className="absolute right-0 top-0 h-full w-16 bg-[#274357]"></div>

      {/* Botón de regreso */}
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 md:top-10 md:left-10 flex items-center justify-center w-12 h-12 bg-slate-800 hover:bg-teal-600 rounded-full transition-colors"
      >
        <ArrowLeft className="w-6 h-6 text-white" />
      </button>

      {/* Contenedor principal centrado */}
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-lg bg-slate-800/90 border-none shadow-2xl">
          <div className="p-12">
            {/* Ícono de usuario */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-slate-800" />
              </div>
            </div>

            {/* Título */}
            <h1 className="text-white text-2xl font-semibold text-center mb-8 uppercase tracking-wider">
              ADMINISTRADOR
            </h1>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error general */}
              {errors.general && (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-3">
                  <p className="text-red-200 text-sm text-center">{errors.general}</p>
                </div>
              )}

              {/* Campo Usuario */}
              <div className="space-y-2">
                <Label htmlFor="usuario" className="text-white text-sm font-medium uppercase tracking-wide">
                  USUARIO:
                </Label>
                <Input
                  id="usuario"
                  type="text"
                  value={formData.usuario}
                  onChange={(e) => handleInputChange("usuario", e.target.value)}
                  className={`w-full px-4 py-3 rounded-md bg-white text-gray-900 border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    errors.usuario ? "ring-2 ring-red-500" : ""
                  }`}
                  placeholder=""
                />
                {errors.usuario && <p className="text-red-400 text-sm">{errors.usuario}</p>}
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="contrasena" className="text-white text-sm font-medium uppercase tracking-wide">
                  CONTRASEÑA:
                </Label>
                <Input
                  id="contrasena"
                  type="password"
                  value={formData.contrasena}
                  onChange={(e) => handleInputChange("contrasena", e.target.value)}
                  className={`w-full px-4 py-3 rounded-md bg-white text-gray-900 border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    errors.contrasena ? "ring-2 ring-red-500" : ""
                  }`}
                  placeholder=""
                />
                {errors.contrasena && <p className="text-red-400 text-sm">{errors.contrasena}</p>}
              </div>

              {/* Checkbox y botón */}
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recordarme"
                    checked={formData.recordarme}
                    onCheckedChange={(checked) => handleInputChange("recordarme", checked as boolean)}
                    className="border-white data-[state=checked]:bg-white data-[state=checked]:text-slate-800"
                  />
                  <Label htmlFor="recordarme" className="text-white text-sm cursor-pointer">
                    Recuérdame
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-white hover:bg-gray-100 text-slate-800 font-medium px-8 py-2 rounded-md transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Ingresando..." : "Ingresar"}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}
