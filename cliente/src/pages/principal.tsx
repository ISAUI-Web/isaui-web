"use client"

import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function Principal() {
  return (
    <div className="min-h-screen bg-[#1F6680] from-teal-600 to-teal-800 flex flex-col items-center justify-center relative p-4">
      {/* Franjas laterales decorativas */}
      <div className="absolute left-0 top-0 h-full w-16 bg-[#274357]"></div>
      <div className="absolute right-0 top-0 h-full w-16 bg-[#274357]"></div>

      {/* Botón de ingreso admin */}
      <div className="absolute top-4 right-4 md:top-10 md:right-20">
        <Link to="/login">
            <Button variant="outline" className="bg-slate-800/80 text-white hover:bg-slate-700 border-none">
            Ingreso Admin
            </Button>
        </Link>
      </div>

      {/* Logo */}
      <div className="text-center mb-6">
        <img src={logo} alt="Logo" className="w-107 h-56 mx-auto mb-4" />
      </div>

      {/* Tarjeta de opciones */}
      <Card className="w-full max-w-md bg-slate-800/90 border-none shadow-xl">
        <div className="p-8">
          <h3 className="text-white text-center text-2xl mb-8">
            Antes de continuar seleccione una opción de inscripción:
          </h3>

          <div className="space-y-4">
              <Link to="/preinscripcion">
                  <Button
                    variant="outline"
                    className="w-full bg-white hover:bg-gray-100 text-slate-800 font-medium text-lg py-6"
                  >
                    Preinscripción
                  </Button>
              </Link>

              <Link to="/loginDNI">
                  <Button
                    //disabled = {true} Para desactivarlo
                    variant="outline"
                    className="w-full bg-white hover:bg-gray-100 text-slate-800 font-medium text-lg py-6"
                    style={{ marginTop: '1rem' }}

                  >
                    Matriculación
                  </Button>
              </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
