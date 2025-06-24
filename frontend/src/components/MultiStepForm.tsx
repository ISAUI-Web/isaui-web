import { useState } from "react"
import { ChevronLeft, ChevronRight, Upload, User, GraduationCap, FileText, ArrowLeft } from "lucide-react"

interface FormData {
   // Datos personales
  nombre: string
  apellido: string
  dni: string
  cuil_cuit: string
  domicilio: string
  localidad: string
  barrio: string
  codigoPostal: string
  telefono: string
  email: string
  fechaNacimiento: string
  lugarNacimiento: string
  provinciaNacimiento: string
  sexo: string

  // Estudios anteriores
  nivelMedio: string 
  nivelMedioAnoIngreso: string
  nivelMedioAnoEgreso: string
  nivelMedioProvincia: string
  nivelMedioTitulo: string
  nivelSuperior: string
  nivelSuperiorCarrera: string
  nivelSuperiorInstitucion: string
  nivelSuperiorProvincia: string
  nivelSuperiorAnoIngreso: string
  nivelSuperiorAnoEgreso: string
  // Situación laboral
  trabaja: string 
  horasDiarias: string
  descripcionTrabajo: string
  // Responsabilidades
  tienePersonasACargo: string 
  
  // Documentación
  dniFrente: File | null
  dniDorso: File | null
}

const initialFormData: FormData = {
   nombre: "",
  apellido: "",
  dni: "",
  cuil_cuit: "",
  domicilio: "",
  email: "",
  telefono: "",
  fechaNacimiento: "",
  lugarNacimiento: "",
  provinciaNacimiento: "",
  barrio: "",
  codigoPostal: "",
  localidad: "",
  sexo: "",
  nivelMedio: "",
  nivelMedioAnoIngreso: "",
  nivelMedioAnoEgreso: "",
  nivelMedioProvincia: "",
  nivelMedioTitulo: "",
  nivelSuperior: "",
  nivelSuperiorCarrera: "",
  nivelSuperiorInstitucion: "",
  nivelSuperiorProvincia: "",
  nivelSuperiorAnoIngreso: "",
  nivelSuperiorAnoEgreso: "",
  trabaja: "",
  horasDiarias: "",
  descripcionTrabajo: "",
  tienePersonasACargo: "",
  dniFrente: null,
  dniDorso: null,
}

const provincias = [
  "Buenos Aires",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
]

const RadioGroup = ({
  label,
  name,
  options,
  value,
  onChange,
  className = "",
}: {
  label: string
  name: string
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  className?: string
}) => (
  <div className={`mb-6 ${className}`}>
    <div className="flex items-center space-x-6">
      <span className="text-white text-lg font-medium uppercase tracking-wide">{label}</span>
      {options.map((option) => (
        <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
          />
          <span className="text-white text-lg font-medium">{option.label}</span>
        </label>
      ))}
    </div>
  </div>
)

const FormField = ({
    label,
    id,
    type = "text",
    value,
    onChange,
    error,
    placeholder = "...",
    options = null,
    required = false,
    disabled = false,
  }: {
    label: string
    id: string
    type?: string
    value: string
    onChange: (value: string) => void
    error?: string
    placeholder?: string
    options?: string[] | null
    required?: boolean
    disabled?: boolean
  }) => (
    <div className="bg-slate-700 rounded-lg p-4">
      <label htmlFor={id} className="block text-white text-sm font-medium mb-3 uppercase tracking-wide">
        {label} {required && "*"}
      </label>
      {options ? (
        <select
          id={id}
          className={`w-full px-4 py-3 rounded-md bg-white text-gray-900 border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
            error ? "ring-2 ring-red-500" : ""
          }`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          id={id}
          rows={4}
          className={`w-full px-4 py-3 rounded-md bg-white text-gray-900 border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none ${
            error ? "ring-2 ring-red-500" : ""
          }`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
      ) : (
        <input
          id={id}
          type={type}
          className={`w-full px-4 py-3 rounded-md bg-white text-gray-900 border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
            error ? "ring-2 ring-red-500" : ""
          }`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  )

export default function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const totalSteps = 3
  const progress = (currentStep / totalSteps) * 100

  const stepTitles = [
    { icon: User, title: "DATOS PERSONALES", description: "Información básica del solicitante" },
    { icon: GraduationCap, title: "ESTUDIOS ANTERIORES", description: "Historial académico" },
    { icon: FileText, title: "DOCUMENTACIÓN", description: "Carga de documentos requeridos" },
  ]

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }

      // Limpiar campos relacionados cuando se cambia a "NO"
      if (field === "nivelMedio" && value === "NO") {
        newData.nivelMedioAnoIngreso = ""
        newData.nivelMedioAnoEgreso = ""
        newData.nivelMedioProvincia = ""
        newData.nivelMedioTitulo = ""
      }

      if (field === "nivelSuperior" && value === "NO") {
        newData.nivelSuperiorCarrera = ""
        newData.nivelSuperiorInstitucion = ""
        newData.nivelSuperiorProvincia = ""
        newData.nivelSuperiorAnoIngreso = ""
        newData.nivelSuperiorAnoEgreso = ""
      }

      if (field === "trabaja" && value === "NO") {
        newData.horasDiarias = ""
        newData.descripcionTrabajo = ""
      }

      return newData
    })
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleFileChange = (field: keyof FormData, file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
     if (!formData.nombre) {
    newErrors.nombre = "El nombre es requerido"
      } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombre)) {
        newErrors.nombre = "El nombre solo puede contener letras"
      }
      if (!formData.apellido) {
        newErrors.apellido = "El apellido es requerido"
      } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.apellido)) {
        newErrors.apellido = "El apellido solo puede contener letras"
      }
      if (!formData.dni) newErrors.dni = "El DNI es requerido"
      else if (!/^\d{8}$/.test(formData.dni)) {
        newErrors.dni = "El DNI debe tener 8 digitos"
      } else if (isNaN(Number(formData.dni))) {
        newErrors.dni = "El DNI debe ser un número"
      }
      if (!formData.cuil_cuit) newErrors.cuil_cuit = "El CUIL/CUIT es requerido"
      else if (!/^\d{11}$/.test(formData.cuil_cuit)) {
        newErrors.cuil_cuit = "El CUIL/CUIT debe tener 11 digitos"
      } else if (isNaN(Number(formData.cuil_cuit))) {
        newErrors.cuil_cuit = "El CUIL/CUIT debe ser un número"
      }
      if (!formData.domicilio) newErrors.domicilio = "El domicilio es requerido"
      if (!formData.localidad) newErrors.localidad = "La localidad es requerida"
      if (!formData.barrio) newErrors.barrio = "El barrio es requerido"
      if (!formData.codigoPostal) newErrors.codigoPostal = "El código postal es requerido"
      else if (!/^\d{4}$/.test(formData.codigoPostal)) {
        newErrors.codigoPostal = "El código postal debe tener 4 digitos"
      } else if (isNaN(Number(formData.codigoPostal))) {
        newErrors.codigoPostal = "El código postal debe ser un número"
      }
      if (!formData.telefono) newErrors.telefono = "El teléfono es requerido"
      else if (!/^\d{10,15}$/.test(formData.telefono)) {
        newErrors.telefono = "El teléfono debe tener entre 10 y 15 digitos"
      } else if (isNaN(Number(formData.telefono))) {
        newErrors.telefono = "El teléfono debe ser un número"
      }
      if (!formData.email) {
        newErrors.email = "El email es requerido"
      } else if (
        !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
      ) {
        newErrors.email = "El email no es válido"
      }
      if (!formData.fechaNacimiento) newErrors.fechaNacimiento = "La fecha de nacimiento es requerida"
      else {
        const today = new Date()
        const birthDate = new Date(formData.fechaNacimiento)
        if (birthDate >= today) {
          newErrors.fechaNacimiento = "La fecha de nacimiento no puede ser hoy o en el futuro"
        }
      }
      if (!formData.lugarNacimiento) newErrors.lugarNacimiento = "El lugar de nacimiento es requerido"
      if (!formData.sexo) newErrors.sexo = "El sexo es requerido"

    }

    if (step === 2) {
      if (!formData.nivelMedio) newErrors.nivelMedio = "Debe indicar si completó el nivel medio"
      if (formData.nivelMedio === "SI") {
        if (!formData.nivelMedioAnoIngreso) newErrors.nivelMedioAnoIngreso = "El año de ingreso es requerido"
        if (!formData.nivelMedioAnoEgreso) newErrors.nivelMedioAnoEgreso = "El año de egreso es requerido"
        if (!formData.nivelMedioProvincia) newErrors.nivelMedioProvincia = "La provincia es requerida"
        if (!formData.nivelMedioTitulo) newErrors.nivelMedioTitulo = "El título es requerido"
      }

      if (!formData.nivelSuperior) newErrors.nivelSuperior = "Debe indicar si completó el nivel superior"
      if (formData.nivelSuperior === "COMPLETO") {
        if (!formData.nivelSuperiorCarrera) newErrors.nivelSuperiorCarrera = "La carrera es requerida"
        if (!formData.nivelSuperiorInstitucion) newErrors.nivelSuperiorInstitucion = "La institución es requerida"
        if (!formData.nivelSuperiorProvincia) newErrors.nivelSuperiorProvincia = "La provincia es requerida"
        if (!formData.nivelSuperiorAnoIngreso) newErrors.nivelSuperiorAnoIngreso = "El año de ingreso es requerido"
        if (!formData.nivelSuperiorAnoEgreso) newErrors.nivelSuperiorAnoEgreso = "El año de egreso es requerido"
      }
      if (formData.nivelSuperior === "EN_CURSO") {
        if (!formData.nivelSuperiorCarrera) newErrors.nivelSuperiorCarrera = "La carrera es requerida"
        if (!formData.nivelSuperiorInstitucion) newErrors.nivelSuperiorInstitucion = "La institución es requerida"
        if (!formData.nivelSuperiorProvincia) newErrors.nivelSuperiorProvincia = "La provincia es requerida"
        if (!formData.nivelSuperiorAnoIngreso) newErrors.nivelSuperiorAnoIngreso = "El año de ingreso es requerido"
      }
      if (!formData.trabaja) newErrors.trabaja = "Debe indicar si trabaja actualmente"
      if (formData.trabaja === "SI") {
        if (!formData.horasDiarias) newErrors.horasDiarias = "Las horas diarias son requeridas"
        if (!formData.descripcionTrabajo) newErrors.descripcionTrabajo = "La descripción del trabajo es requerida"
      }
      if (!formData.tienePersonasACargo) newErrors.tienePersonasACargo = "Debe indicar si tiene personas a cargo"
    }

    if (step === 3) {
      if (!formData.dniFrente) newErrors.dniFrente = "La foto del frente del DNI es requerida"
      if (!formData.dniDorso) newErrors.dniDorso = "La foto del dorso del DNI es requerida"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      console.log("Datos del formulario:", formData)
      alert("Formulario enviado correctamente!")
    }
  }

  const renderPersonalData = () => (
    <div className="space-y-6">
      {/* Título de sección */}
      <div className="bg-slate-800 rounded-lg p-4 text-center">
        <h2 className="text-white text-xl font-semibold uppercase tracking-wider">DATOS PERSONALES</h2>
      </div>

      {/* Grid de campos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="NOMBRE"
          id="nombre"
          value={formData.nombre}
          onChange={(value) => handleInputChange("nombre", value)}
          error={errors.nombre}
          required
        />

        <FormField
          label="APELLIDO"
          id="apellido"
          value={formData.apellido}
          onChange={(value) => handleInputChange("apellido", value)}
          error={errors.apellido}
          required
        />

        <FormField
          label="DNI"
          id="dni"
          value={formData.dni}
          onChange={(value) => handleInputChange("dni", value)}
          error={errors.dni}
          required
        />

        <FormField
          label="CUIL/CUIT"
          id="cuil_cuit"
          value={formData.cuil_cuit}
          onChange={(value) => handleInputChange("cuil_cuit", value)}
          error={errors.cuil_cuit}
          required
        />

        <FormField
          label="DOMICILIO"
          id="domicilio"
          value={formData.domicilio}
          onChange={(value) => handleInputChange("domicilio", value)}
          required
          error={errors.domicilio}
        />

        <FormField
          label="LOCALIDAD"
          id="localidad"
          value={formData.localidad}
          onChange={(value) => handleInputChange("localidad", value)}
          error={errors.localidad}
          required
        />

        <FormField
          label="BARRIO"
          id="barrio"
          value={formData.barrio}
          onChange={(value) => handleInputChange("barrio", value)}
          error={errors.barrio}
          required
        />

        <FormField
          label="CÓDIGO POSTAL"
          id="codigoPostal"
          value={formData.codigoPostal}
          onChange={(value) => handleInputChange("codigoPostal", value)}
          error={errors.codigoPostal}
          required
        />

        <FormField
          label="TELÉFONO"
          id="telefono"
          value={formData.telefono}
          onChange={(value) => handleInputChange("telefono", value)}
          error={errors.telefono}
          required
        />

        <FormField
          label="EMAIL"
          id="email"
          type="email"
          value={formData.email}
          onChange={(value) => handleInputChange("email", value)}
          error={errors.email}
          required
        />

        <FormField
          label="FECHA DE NACIMIENTO"
          id="fechaNacimiento"
          type="date"
          value={formData.fechaNacimiento}
          onChange={(value) => handleInputChange("fechaNacimiento", value)}
          error={errors.fechaNacimiento}
          required
        />

        <FormField
          label="LUGAR DE NACIMIENTO"
          id="lugarNacimiento"
          value={formData.lugarNacimiento}
          onChange={(value) => handleInputChange("lugarNacimiento", value)}
          error={errors.lugarNacimiento}
          required
        />

        <FormField
          label="SEXO"
          id="sexo"
          value={formData.sexo}
          onChange={(value) => handleInputChange("sexo", value)}
          options={["Masculino", "Femenino", "Otro"]}
          error={errors.sexo}
          required
        />
      </div>
    </div>
  )

  const renderEducationData = () => {
    const nivelMedioEnabled = formData.nivelMedio === "SI"
    const nivelSuperiorEnabled = formData.nivelSuperior === "COMPLETO" || formData.nivelSuperior === "EN_CURSO"
    const trabajaEnabled = formData.trabaja === "SI"

    return (
      <div className="space-y-8">
        {/* Título de sección */}
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <h2 className="text-white text-xl font-semibold uppercase tracking-wider">ESTUDIOS:</h2>
        </div>

        {/* Nivel Medio */}
        <div>
          <RadioGroup
            label="NIVEL MEDIO:"
            name="nivelMedio"
            options={[
              { value: "SI", label: "SI" },
              { value: "NO", label: "NO" },
            ]}
            value={formData.nivelMedio}
            onChange={(value) => handleInputChange("nivelMedio", value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField
              label="AÑO DE INGRESO"
              id="nivelMedioAnoIngreso"
              value={formData.nivelMedioAnoIngreso}
              onChange={(value) => handleInputChange("nivelMedioAnoIngreso", value)}
              disabled={!nivelMedioEnabled}
              required
            />
            <FormField
              label="AÑO DE EGRESO"
              id="nivelMedioAnoEgreso"
              value={formData.nivelMedioAnoEgreso}
              onChange={(value) => handleInputChange("nivelMedioAnoEgreso", value)}
              disabled={!nivelMedioEnabled}
              required
            />
            <FormField
              label="PROVINCIA"
              id="nivelMedioProvincia"
              value={formData.nivelMedioProvincia}
              onChange={(value) => handleInputChange("nivelMedioProvincia", value)}
              options={provincias}
              placeholder="PROVINCIA..."
              disabled={!nivelMedioEnabled}
              required
            />
            <FormField
              label="TÍTULO"
              id="nivelMedioTitulo"
              value={formData.nivelMedioTitulo}
              onChange={(value) => handleInputChange("nivelMedioTitulo", value)}
              disabled={!nivelMedioEnabled}
              required
            />
          </div>
        </div>

        {/* Nivel Superior */}
        <div>
          <RadioGroup
            label="NIVEL SUPERIOR:"
            name="nivelSuperior"
            options={[
              { value: "COMPLETO", label: "COMPLETO" },
              { value: "NO", label: "NO" },
              { value: "EN_CURSO", label: "EN CURSO" },
            ]}
            value={formData.nivelSuperior}
            onChange={(value) => handleInputChange("nivelSuperior", value)}
            
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <FormField
              label="CARRERA"
              id="nivelSuperiorCarrera"
              value={formData.nivelSuperiorCarrera}
              onChange={(value) => handleInputChange("nivelSuperiorCarrera", value)}
              disabled={!nivelSuperiorEnabled}
              required
            />
            <FormField
              label="INSTITUCIÓN"
              id="nivelSuperiorInstitucion"
              value={formData.nivelSuperiorInstitucion}
              onChange={(value) => handleInputChange("nivelSuperiorInstitucion", value)}
              disabled={!nivelSuperiorEnabled}
              required
            />
            <FormField
              label="PROVINCIA"
              id="nivelSuperiorProvincia"
              value={formData.nivelSuperiorProvincia}
              onChange={(value) => handleInputChange("nivelSuperiorProvincia", value)}
              options={provincias}
              placeholder="PROVINCIA..."
              disabled={!nivelSuperiorEnabled}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="AÑO DE INGRESO"
              id="nivelSuperiorAnoIngreso"
              value={formData.nivelSuperiorAnoIngreso}
              onChange={(value) => handleInputChange("nivelSuperiorAnoIngreso", value)}
              disabled={!nivelSuperiorEnabled}
              required
            />
            <FormField
              label="AÑO DE EGRESO"
              id="nivelSuperiorAnoEgreso"
              value={formData.nivelSuperiorAnoEgreso}
              onChange={(value) => handleInputChange("nivelSuperiorAnoEgreso", value)}
              disabled={!nivelSuperiorEnabled}
              required
            />
          </div>
        </div>

        {/* Situación Laboral */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="bg-slate-800 rounded-lg p-3 mb-4">
              <h3 className="text-white text-lg font-semibold uppercase tracking-wider">SITUACIÓN LABORAL:</h3>
            </div>

            <RadioGroup
              label="¿TRABAJA?:"
              name="trabaja"
              options={[
                { value: "SI", label: "SI" },
                { value: "NO", label: "NO" },
              ]}
              value={formData.trabaja}
              onChange={(value) => handleInputChange("trabaja", value)}
            />

            <div className="space-y-4">
              <FormField
                label="HORAS DIARIAS"
                id="horasDiarias"
                value={formData.horasDiarias}
                onChange={(value) => handleInputChange("horasDiarias", value)}
                disabled={!trabajaEnabled}
                required  
              />

              <FormField
                label="DESCRIPCIÓN DEL TRABAJO"
                id="descripcionTrabajo"
                type="textarea"
                value={formData.descripcionTrabajo}
                onChange={(value) => handleInputChange("descripcionTrabajo", value)}
                disabled={!trabajaEnabled}
                required
              />
            </div>
          </div>

          {/* Responsabilidades */}
          <div>
            <div className="bg-slate-800 rounded-lg p-3 mb-4">
              <h3 className="text-white text-lg font-semibold uppercase tracking-wider">RESPONSABILIDADES:</h3>
            </div>

            <RadioGroup
              label="¿TIENE PERSONAS A CARGO?:"
              name="tienePersonasACargo"
              options={[
                { value: "SI", label: "SI" },
                { value: "NO", label: "NO" },
              ]}
              value={formData.tienePersonasACargo}
              onChange={(value) => handleInputChange("tienePersonasACargo", value)}
            />
          </div>
        </div>
      </div>
    )
  }
  const renderDocumentation = () => (
    <div className="space-y-6">
      {/* Título de sección */}
      <div className="bg-slate-800 rounded-lg p-4 text-center">
        <h2 className="text-white text-xl font-semibold uppercase tracking-wider">DOCUMENTACIÓN</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-700 rounded-lg p-4">
          <label className="block text-white text-sm font-medium mb-3 uppercase tracking-wide">DNI - FRENTE *</label>
          <div className="border-2 border-dashed border-slate-500 rounded-lg p-6 text-center hover:border-slate-400 transition-colors bg-slate-600">
            <input
              id="dniFrente"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange("dniFrente", e.target.files?.[0] || null)}
              className="hidden"
            />
            <label htmlFor="dniFrente" className="cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <p className="text-sm text-slate-300">
                {formData.dniFrente ? formData.dniFrente.name : "Haz clic para subir la foto del frente del DNI"}
              </p>
            </label>
          </div>
          {errors.dniFrente && <p className="text-red-400 text-sm mt-2">{errors.dniFrente}</p>}
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <label className="block text-white text-sm font-medium mb-3 uppercase tracking-wide">DNI - DORSO *</label>
          <div className="border-2 border-dashed border-slate-500 rounded-lg p-6 text-center hover:border-slate-400 transition-colors bg-slate-600">
            <input
              id="dniDorso"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange("dniDorso", e.target.files?.[0] || null)}
              className="hidden"
            />
            <label htmlFor="dniDorso" className="cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <p className="text-sm text-slate-300">
                {formData.dniDorso ? formData.dniDorso.name : "Haz clic para subir la foto del dorso del DNI"}
              </p>
            </label>
          </div>
          {errors.dniDorso && <p className="text-red-400 text-sm mt-2">{errors.dniDorso}</p>}
        </div>
      </div>

      <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
        <h4 className="font-medium text-blue-200 mb-2 uppercase tracking-wide">
          Instrucciones para las fotos del DNI:
        </h4>
        <ul className="text-sm text-blue-300 space-y-1">
          <li>• Las fotos deben ser claras y legibles</li>
          <li>• Evita reflejos y sombras</li>
          <li>• Asegúrate de que todos los datos sean visibles</li>
          <li>• Formatos aceptados: JPG, PNG</li>
          <li>• Tamaño máximo: 5MB por archivo</li>
        </ul>
      </div>
    </div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalData()
      case 2:
        return renderEducationData()
      case 3:
        return renderDocumentation()
      default:
        return null
    }
  }

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: -1, background: "#1F6680" }} />
      <div className="min-h-screen py-2.5 px-[0]">
        <div className="max-w-6xl mx-auto">
          {/* Header con botón de regreso */}
          <div className="flex items-center justify-between mb-8">
            <button className="flex items-center justify-center w-12 h-12 bg-[#274357] hover:bg-teal-600 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center uppercase tracking-wider flex-1">
              FORMULARIO DE PREINSCRIPCIÓN
            </h1>
            <div className="w-12"></div> {/* Spacer para centrar el título */}
          </div>

          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex justify-center items-center mb-4 space-x-8">
              {stepTitles.map((step, index) => {
                const StepIcon = step.icon
                const isActive = index + 1 === currentStep
                const isCompleted = index + 1 < currentStep

                return (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                        isActive
                          ? "border-white bg-white"
                          : isCompleted
                            ? "border-[#274357] bg-[#274357]"
                            : "border-[#274357] bg-transparent"
                      }`}
                    >
                      <StepIcon
                        className="w-6 h-6"
                        color={
                          isActive
                            ? "#274357"      // ícono azul en paso activo
                            : isCompleted
                              ? "#fff"       // ícono blanco en paso completado
                              : "#274357"    // ícono azul en paso pendiente
                        }
                      />
                    </div>
                    <span className="text-white text-sm mt-2 text-center max-w-24">{step.title}</span>
                  </div>
                )
              })}
            </div>
            <div className="w-full rounded-full h-2" style={{ background: "#274357" }}>
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Form Content */}
          <div className="rounded-2xl p-8" style={{ backgroundColor: "#1F6680" }}>{renderStepContent()}</div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Anterior</span>
            </button>

            <span className="text-white font-medium">
              Paso {currentStep} de {totalSteps}
            </span>

            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 px-6 py-3 bg-white hover:bg-gray-100 text-teal-700 font-semibold rounded-lg transition-colors"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
              >
                Enviar Formulario
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}