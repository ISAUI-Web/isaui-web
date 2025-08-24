import { useState } from "react"
import { Upload, FileText, ArrowLeftCircle, ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface FormData {
  dniFrente: File | null
  dniDorso: File | null
  cus: File | null
  isa: File | null
  partida_nacimiento: File | null
  analitico: File | null
  grupo_sanguineo: File | null
  cud: File | null
  emmac: File | null
  foto_carnet: File | null
}

const initialFormData: FormData = {
  dniFrente: null,
  dniDorso: null,
  cus: null,
  isa: null,
  partida_nacimiento: null,
  analitico: null,
  grupo_sanguineo: null,
  cud: null,
  emmac: null,
  foto_carnet: null,
}

export default function FormMatriculacion() {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const navigate = useNavigate();

  const handleFileChange = (field: keyof FormData, file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.dniFrente) newErrors.dniFrente = "La foto del frente del DNI es requerida"
    if (!formData.dniDorso) newErrors.dniDorso = "La foto del dorso del DNI es requerida"
    if (!formData.cus) newErrors.cus = "La foto del CUS es requerida"
    if (!formData.foto_carnet) newErrors.foto_carnet = "La foto carnet es requerida"
    if (!formData.isa) newErrors.isa = "La foto del ISA es requerida"
    if (!formData.partida_nacimiento) newErrors.partida_nacimiento = "La foto de la partida de nacimiento es requerida"
    if (!formData.analitico) newErrors.analitico = "La foto del analítico es requerida"
    if (!formData.grupo_sanguineo) newErrors.grupo_sanguineo = "La foto del certificado de grupo sanguíneo es requerida"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) {
      alert("Debe completar todos los datos antes de enviar.");
      return;
    }
    alert("¡Formulario enviado con éxito!");
    // Aquí puedes agregar la lógica para enviar los archivos al backend
  }

   const handleBack = () => {
    navigate("/loginDNI")
  }

  return (
    <div className="min-h-screen bg-[#1F6680] overflow-y-auto">
      <div className="py-8 px-0 flex items-center justify-center">
        <div className="max-w-4xl mx-auto w-full">
          {/* Botón de regreso */}
        <button
            onClick={handleBack}
            className="absolute top-4 left-4 md:top-10 md:left-10 flex items-center justify-center w-12 h-12 bg-slate-800 hover:bg-teal-600 rounded-full transition-colors"
        >
            <ArrowLeft className="w-6 h-6 text-white" />
        </button>
          {/* Título de sección */}
          <div className="bg-slate-800 rounded-lg p-4 text-center mb-8">
            <h2 className="text-white text-2xl font-semibold uppercase tracking-wider flex items-center justify-center gap-2">
              <FileText className="w-8 h-8" />
              DOCUMENTACIÓN
            </h2>
          </div>
          {/* Documentación */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUpload
                label="CUS *"
                field="cus"
                file={formData.cus}
                error={errors.cus}
                onChange={handleFileChange}
              />
              <FileUpload
                label="FOTO CARNET 4x4 *"
                field="foto_carnet"
                file={formData.foto_carnet}
                error={errors.foto_carnet}
                onChange={handleFileChange}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUpload
                label="ISA *"
                field="isa"
                file={formData.isa}
                error={errors.isa}
                onChange={handleFileChange}
              />
              <FileUpload
                label="PARTIDA DE NACIMIENTO *"
                field="partida_nacimiento"
                file={formData.partida_nacimiento}
                error={errors.partida_nacimiento}
                onChange={handleFileChange}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUpload
                label="ANALÍTICO NIVEL SECUNDARIO *"
                field="analitico"
                file={formData.analitico}
                error={errors.analitico}
                onChange={handleFileChange}
              />
              <FileUpload
                label="CERTIFICADO DE GRUPO SANGUÍNEO *"
                field="grupo_sanguineo"
                file={formData.grupo_sanguineo}
                error={errors.grupo_sanguineo}
                onChange={handleFileChange}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUpload
                label="CUD (Certificado único de Discapacidad)"
                field="cud"
                file={formData.cud}
                error={errors.cud}
                onChange={handleFileChange}
              />
              <FileUpload
                label="EMMAC (Guía de Trekking y Guía de Montaña)"
                field="emmac"
                file={formData.emmac}
                error={errors.emmac}
                onChange={handleFileChange}
              />
            </div>
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mt-8">
              <h4 className="font-medium text-blue-200 mb-2 uppercase tracking-wide">
                Instrucciones para las fotos:
              </h4>
              <ul className="text-sm text-blue-300 space-y-1">
                <li>• Las fotos deben ser claras y legibles</li>
                <li>• Evita reflejos y sombras</li>
                <li>• Asegúrate de que todos los datos sean visibles</li>
                <li>• Formatos aceptados: JPG, PNG</li>
                <li>• Tamaño máximo: 5MB por archivo</li>
              </ul>
            </div>
            <div className="flex justify-center mt-8">
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
              >
                Enviar Formulario
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente para subir archivos
function FileUpload({
  label,
  field,
  file,
  error,
  onChange,
}: {
  label: string
  field: keyof FormData
  file: File | null
  error?: string
  onChange: (field: keyof FormData, file: File | null) => void
}) {
  return (
    <div className="bg-slate-700 rounded-lg p-4">
      <label className="block text-white text-sm font-medium mb-3 uppercase tracking-wide">{label}</label>
      <div className="border-2 border-dashed border-slate-500 rounded-lg p-6 text-center hover:border-slate-400 transition-colors bg-slate-600">
        <input
          id={field}
          type="file"
          accept="image/jpeg,image/png"
          onChange={(e) => onChange(field, e.target.files?.[0] || null)}
          className="hidden"
        />
        <label htmlFor={field} className="cursor-pointer">
          <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <p className="text-sm text-slate-300">
            {file ? file.name : `Haz clic para subir la foto de ${label.replace("*", "").trim()}`}
          </p>
        </label>
      </div>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  )
}