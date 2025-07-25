"use client"

import { useState } from "react"
import { Card } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { ArrowLeft, User, Save, Edit } from "lucide-react"
import { useParams, useNavigate } from 'react-router-dom'



// Datos de ejemplo del aspirante
const aspiranteData = {
  id: 1,
  nombre: "",
  apellido: "",
  sexo: "",
  dni: "",
  cuil: "",
  domicilio: "",
  localidad: "",
  barrio: "",
  codigoPostal: "",
  telefono: "",
  email: "",
  carrera: "",
  estado_preinscripcion: "pendiente",
  estado_matriculacion: "no matriculado",
  completo_nivel_medio: "",
  anio_ingreso_medio: "",
  anio_egreso_medio: "",
  provincia_medio: "",
  titulo_medio: "",
  completo_nivel_superior: "",
  carrera_superior: "",
  institucion_superior: "",
  provincia_superior: "",
  anio_ingreso_superior: "",
  anio_egreso_superior: "",
  trabajo: "",
  horas_diarias: "",
  descripcion_trabajo: "",
  personas_cargo: "",
  dniFrente: null,
  dniDorso: null,
}

const tabs = [
  { id: "datos", label: "Datos personales" },
  { id: "estudios", label: "Estudios" },
  { id: "laboral", label: "Situación laboral y responsabilidades" },
  { id: "documentacion", label: "Documentación" },
]

export default function DetalleAspirante() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [activeTab, setActiveTab] = useState("datos")
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(aspiranteData)

  const handleBack = () => {
    navigate("/aspirantes")
  }

  const handleSave = () => {
    // Aquí conectarías con tu API para guardar los cambios
    console.log("Guardando datos:", formData)
    setIsEditing(false)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "datos":
        return (
          <div className="grid grid-cols-2 gap-4">
            {/* ... ya está bien estilizado ... */}
            {/* Código original de "datos" */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">NOMBRE</Label>
              {isEditing ? (
                <Input
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.nombre}</div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">APELLIDO</Label>
              {isEditing ? (
                <Input
                  value={formData.apellido}
                  onChange={(e) => handleInputChange("apellido", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.apellido}</div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">SEXO</Label>
              {isEditing ? (
                <Input
                  value={formData.sexo}
                  onChange={(e) => handleInputChange("sexo", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.sexo}</div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">DNI</Label>
              {isEditing ? (
                <Input
                  value={formData.dni}
                  onChange={(e) => handleInputChange("dni", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.dni}</div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">CUIL/CUIT</Label>
              {isEditing ? (
                <Input
                  value={formData.cuil}
                  onChange={(e) => handleInputChange("cuil", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.cuil}</div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">DOMICILIO</Label>
              {isEditing ? (
                <Input
                  value={formData.domicilio}
                  onChange={(e) => handleInputChange("domicilio", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.domicilio}</div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">LOCALIDAD</Label>
              {isEditing ? (
                <Input
                  value={formData.localidad}
                  onChange={(e) => handleInputChange("localidad", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.localidad}</div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">BARRIO</Label>
              {isEditing ? (
                <Input
                  value={formData.barrio}
                  onChange={(e) => handleInputChange("barrio", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.barrio}</div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">CÓDIGO POSTAL</Label>
              {isEditing ? (
                <Input
                  value={formData.codigoPostal}
                  onChange={(e) => handleInputChange("codigoPostal", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.codigoPostal}</div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">TELÉFONO</Label>
              {isEditing ? (
                <Input
                  value={formData.telefono}
                  onChange={(e) => handleInputChange("telefono", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.telefono}</div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">MAIL</Label>
              {isEditing ? (
                <Input
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.email}</div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">CARRERA</Label>
              {isEditing ? (
                <Input
                  value={formData.carrera}
                  onChange={(e) => handleInputChange("carrera", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.carrera}</div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">ESTADO DE PREINSCRIPCIÓN</Label>
              {isEditing ? (
                <Input
                  value={formData.estado_preinscripcion}
                  onChange={(e) => handleInputChange("estado_preinscripcion", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.estado_preinscripcion}</div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">ESTADO DE MATRICULACIÓN</Label>
              {isEditing ? (
                <Input
                  value={formData.estado_matriculacion}
                  onChange={(e) => handleInputChange("estado_matriculacion", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.estado_matriculacion}</div>
              )}
            </div>
          </div>
        );
      case "estudios":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">¿COMPLETÓ NIVEL MEDIO?</Label>
              {isEditing ? (
                <Input
                  value={formData.completo_nivel_medio}
                  onChange={(e) => handleInputChange("completo_nivel_medio", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.completo_nivel_medio}</div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">AÑO DE INGRESO MEDIO</Label>
              {isEditing ? (
                <Input
                  value={formData.anio_ingreso_medio}
                  onChange={(e) => handleInputChange("anio_ingreso_medio", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.anio_ingreso_medio}</div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">AÑO DE EGRESO MEDIO</Label>
              {isEditing ? (
                <Input
                  value={formData.anio_egreso_medio}
                  onChange={(e) => handleInputChange("anio_egreso_medio", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.anio_egreso_medio}</div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">PROVINCIA (MEDIO)</Label>
              {isEditing ? (
                <Input
                  value={formData.provincia_medio}
                  onChange={(e) => handleInputChange("provincia_medio", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.provincia_medio}</div>
              )}
            </div>
            <div className="col-span-2">
              <Label className="text-sm font-medium text-gray-700 mb-1 block">TÍTULO NIVEL MEDIO</Label>
              {isEditing ? (
                <Input
                  value={formData.titulo_medio}
                  onChange={(e) => handleInputChange("titulo_medio", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.titulo_medio}</div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">¿COMPLETÓ NIVEL SUPERIOR?</Label>
              {isEditing ? (
                <Input
                  value={formData.completo_nivel_superior}
                  onChange={(e) => handleInputChange("completo_nivel_superior", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.completo_nivel_superior}</div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">CARRERA SUPERIOR</Label>
              {isEditing ? (
                <Input
                  value={formData.carrera_superior}
                  onChange={(e) => handleInputChange("carrera_superior", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.carrera_superior}</div>
              )}
            </div>
            <div className="col-span-2">
              <Label className="text-sm font-medium text-gray-700 mb-1 block">INSTITUCIÓN SUPERIOR</Label>
              {isEditing ? (
                <Input
                  value={formData.institucion_superior}
                  onChange={(e) => handleInputChange("institucion_superior", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.institucion_superior}</div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">PROVINCIA (SUPERIOR)</Label>
              {isEditing ? (
                <Input
                  value={formData.provincia_superior}
                  onChange={(e) => handleInputChange("provincia_superior", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.provincia_superior}</div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">AÑO DE INGRESO SUPERIOR</Label>
              {isEditing ? (
                <Input
                  value={formData.anio_ingreso_superior}
                  onChange={(e) => handleInputChange("anio_ingreso_superior", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.anio_ingreso_superior}</div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">AÑO DE EGRESO SUPERIOR</Label>
              {isEditing ? (
                <Input
                  value={formData.anio_egreso_superior}
                  onChange={(e) => handleInputChange("anio_egreso_superior", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.anio_egreso_superior}</div>
              )}
            </div>
          </div>
        );
      case "laboral":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">¿TRABAJA ACTUALMENTE?</Label>
              {isEditing ? (
                <Input
                  value={formData.trabajo}
                  onChange={(e) => handleInputChange("trabajo", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.trabajo}</div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">HORAS DIARIAS</Label>
              {isEditing ? (
                <Input
                  value={formData.horas_diarias}
                  onChange={(e) => handleInputChange("horas_diarias", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.horas_diarias}</div>
              )}
            </div>
            <div className="col-span-2">
              <Label className="text-sm font-medium text-gray-700 mb-1 block">DESCRIPCIÓN DEL TRABAJO</Label>
              {isEditing ? (
                <Input
                  value={formData.descripcion_trabajo}
                  onChange={(e) => handleInputChange("descripcion_trabajo", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.descripcion_trabajo}</div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">PERSONAS A CARGO</Label>
              {isEditing ? (
                <Input
                  value={formData.personas_cargo}
                  onChange={(e) => handleInputChange("personas_cargo", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.personas_cargo}</div>
              )}
            </div>
          </div>
        );
      case "documentacion":
        return (
          <div className="text-gray-500 text-center py-8 col-span-2">
            <span className="uppercase tracking-wide text-sm font-semibold">SECCIÓN DE DOCUMENTACIÓN (PRÓXIMAMENTE)</span>
          </div>
        );
      default:
        return null;
    }
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
      <div className="flex items-center justify-center min-h-screen py-4">
        <Card className="w-full max-w-4xl bg-white shadow-2xl">
          <div className="p-6">
            {/* Header con avatar y nombre */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-[#274357] rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                {formData.nombre} {formData.apellido}
              </h1>
              <p className="text-gray-600 text-sm">ASPIRANTE</p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-4">
              <nav className="flex space-x-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-teal-500 text-teal-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="mb-6">{renderTabContent()}</div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <Button
                onClick={handleSave}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                GUARDAR
              </Button>
              {!isEditing && (
                <Button
                  onClick={handleEdit}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  EDITAR
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
