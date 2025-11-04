import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Upload, User, GraduationCap, FileText, ArrowLeft } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import {CustomDialog} from "../components/ui/customDialog"

interface FormData {
   // Datos personales
  carrera: string
  nombre: string
  apellido: string
  dni: string
  cuil: string
  domicilio: string
  localidad: string
  barrio: string
  codigo_postal: string
  telefono: string
  email: string
  fecha_nacimiento: string
  ciudad_nacimiento: string
  provincia_nacimiento: string
  sexo: string
  numeroRegistro: string

  // Estudios anteriores
  completo_nivel_medio: string 
  anio_ingreso_medio: string
  anio_egreso_medio: string
  provincia_medio: string
  titulo_medio: string
  completo_nivel_superior: string
  carrera_superior: string
  institucion_superior: string
  provincia_superior: string
  anio_ingreso_superior: string
  anio_egreso_superior: string
  // Situación laboral
  trabajo: string 
  horas_diarias: string
  descripcion_trabajo: string
  // Responsabilidades
  personas_cargo: string 
  
  // Documentación
  estado_preinscripcion: string
  estado_matriculacion: string
  dniFrente: File | null
  dniDorso: File | null
  carrera_id: string
}

const initialFormData: FormData = {
  
  carrera: "",
  nombre: "",
  apellido: "",
  dni: "",
  cuil: "",
  domicilio: "",
  email: "",
  telefono: "",
  fecha_nacimiento: "",
  ciudad_nacimiento: "",
  provincia_nacimiento: "",
  barrio: "",
  codigo_postal: "",
  localidad: "",
  sexo: "",
  numeroRegistro: "",
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
  estado_preinscripcion: "pendiente",
  estado_matriculacion: "no matriculado",
  dniFrente: null,
  dniDorso: null,
  carrera_id: "",
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

type UnifiedOption = {
  value: string;
  label: string;
};

type FormFieldProps = {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  options?: string[] | UnifiedOption[] | null;
  required?: boolean;
  disabled?: boolean;
};

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
}: FormFieldProps) => (
  <div className="bg-slate-700 rounded-lg p-4">
    <label
      htmlFor={id}
      className="block text-white text-sm font-medium mb-3 uppercase tracking-wide"
    >
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
        {options.map((option) => {
          if (typeof option === "string") {
            return (
              <option key={option} value={option}>
                {option}
              </option>
            );
          } else {
            // Aquí TypeScript sabe que es UnifiedOption
            return (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            );
          }
        })}

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
);



export default function MultiStepForm() {

  type Carrera = {
  id: number;
  nombre: string;
  activo: boolean;
};

const [carreras, setCarreras] = useState<Carrera[]>([]);
const [carrerasOptions, setCarrerasOptions] = useState<{ value: string; label: string }[]>([]);
const [dialogOpen, setDialogOpen] = useState(false)
const [dialogProps, setDialogProps] = useState<{
  title?: string
  description?: string
  variant?: "info"|"error"|"success"|"confirm"
  onConfirm?: (() => void) | undefined
  onCancel?: (() => void) | undefined
  confirmText?: string
  cancelText?: string
}>({})

useEffect(() => {
  const fetchCarreras = async () => {
    try {
      // CORRECCIÓN: Usar la variable de entorno para la URL de la API.
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/carrera`);
      if (!res.ok) throw new Error('No se pudo conectar al servidor para cargar las carreras.');
      const data: Carrera[] = await res.json();

      // solo activas
      const activas = data.filter(c => c.activo);

      setCarreras(activas);
      setCarrerasOptions(
        activas.map(c => ({ value: c.id.toString(), label: c.nombre }))
      );
    } catch (err) {
      console.error("Error al cargar carreras:", err);
      alert("Error al cargar carreras: No se pudo conectar con el servidor.");
    }
  };

  fetchCarreras();
}, []);

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const navigate = useNavigate()

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
      if (field === "completo_nivel_medio" && value === "NO") {
        newData.anio_ingreso_medio = ""
        newData.anio_egreso_medio = ""
        newData.provincia_medio = ""
        newData.titulo_medio = ""
      }

      if (field === "completo_nivel_superior" && value === "NO") {
        newData.carrera_superior = ""
        newData.institucion_superior = ""
        newData.provincia_superior = ""
        newData.anio_ingreso_superior = ""
        newData.anio_egreso_superior = ""
      }

      // Limpiar año de egreso si se cambia a "EN CURSO"
      if (field === "completo_nivel_superior" && value === "EN_CURSO") {
        newData.anio_egreso_superior = ""
      }

      if (field === "trabajo" && value === "NO") {
      newData.horas_diarias = "0"; // Guardamos 0 como string para consistencia del input
      newData.descripcion_trabajo = "";
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
      if (!formData.cuil) newErrors.cuil = "El CUIL/CUIT es requerido"
      else if (!/^\d{11}$/.test(formData.cuil)) {
        newErrors.cuil = "El CUIL/CUIT debe tener 11 digitos"
      } else if (isNaN(Number(formData.cuil))) {
        newErrors.cuil = "El CUIL/CUIT debe ser un número"
      }
      if (!formData.domicilio) newErrors.domicilio = "El domicilio es requerido"
      if (!formData.localidad) newErrors.localidad = "La localidad es requerida"
      if (!formData.barrio) newErrors.barrio = "El barrio es requerido"
      if (!formData.codigo_postal) newErrors.codigo_postal = "El código postal es requerido"
      else if (!/^\d{4}$/.test(formData.codigo_postal)) {
        newErrors.codigo_postal = "El código postal debe tener 4 digitos"
      } else if (isNaN(Number(formData.codigo_postal))) {
        newErrors.codigo_postal = "El código postal debe ser un número"
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
      if (!formData.fecha_nacimiento) newErrors.fecha_nacimiento = "La fecha de nacimiento es requerida"
      else {
        const today = new Date()
        const birthDate = new Date(formData.fecha_nacimiento)
        if (birthDate >= today) {
          newErrors.fecha_nacimiento = "La fecha de nacimiento no puede ser hoy o en el futuro"
        }
      }
      if (!formData.ciudad_nacimiento) newErrors.ciudad_nacimiento = "La ciudad de nacimiento es requerida"
      if (!formData.provincia_nacimiento) newErrors.provincia_nacimiento = "La provincia es requerida"
      if (!formData.sexo) newErrors.sexo = "El sexo es requerido"
      if(!formData.carrera) newErrors.carrera = "La carrera es requerida"

    }

    if (step === 2) {
      if (!formData.completo_nivel_medio) newErrors.completo_nivel_medio = "Debe indicar si completó el nivel medio"
      if (formData.completo_nivel_medio === "SI") {
        if (!formData.anio_ingreso_medio) newErrors.anio_ingreso_medio = "El año de ingreso es requerido"
        else if (isNaN(Number(formData.anio_ingreso_medio))) newErrors.anio_ingreso_medio = "El año de ingreso debe ser un número"
        else if (Number(formData.anio_ingreso_medio) < 1900) newErrors.anio_ingreso_medio = "El año de ingreso debe ser mayor a 1900";
        if (!formData.anio_egreso_medio) newErrors.anio_egreso_medio = "El año de egreso es requerido"
        else if (isNaN(Number(formData.anio_egreso_medio))) newErrors.anio_egreso_medio = "El año de egreso debe ser un número"
        else if (Number(formData.anio_egreso_medio) < 1900) newErrors.anio_egreso_medio = "El año de egreso debe ser mayor a 1900"
        if (!formData.provincia_medio) newErrors.provincia_medio = "La provincia es requerida"
        if (!formData.titulo_medio) newErrors.titulo_medio = "El título es requerido"
      }

      if (!formData.completo_nivel_superior) newErrors.completo_nivel_superior = "Debe indicar si completó el nivel superior"
      if (formData.completo_nivel_superior === "COMPLETO") {
        if (!formData.carrera_superior) newErrors.carrera_superior = "La carrera es requerida"
        if (!formData.institucion_superior) newErrors.institucion_superior = "La institución es requerida"
        if (!formData.provincia_superior) newErrors.provincia_superior = "La provincia es requerida"
        if (!formData.anio_ingreso_superior) newErrors.anio_ingreso_superior = "El año de ingreso es requerido"
        if (!formData.anio_egreso_superior) newErrors.anio_egreso_superior = "El año de egreso es requerido"
      }
      if (formData.completo_nivel_superior === "EN_CURSO") {
        if (!formData.carrera_superior) newErrors.carrera_superior = "La carrera es requerida"
        if (!formData.institucion_superior) newErrors.institucion_superior = "La institución es requerida"
        if (!formData.provincia_superior) newErrors.provincia_superior = "La provincia es requerida"
        if (!formData.anio_ingreso_superior) newErrors.anio_ingreso_superior = "El año de ingreso es requerido"
      }
      if (!formData.trabajo) newErrors.trabajo = "Debe indicar si trabajo actualmente"
      if (formData.trabajo === "SI") {
        if (!formData.horas_diarias) newErrors.horas_diarias = "Las horas diarias son requeridas"
        if (!formData.descripcion_trabajo) newErrors.descripcion_trabajo = "La descripción del trabajo es requerida"
      }
      if (!formData.personas_cargo) newErrors.personas_cargo = "Debe indicar si tiene personas a cargo"
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
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    } else {
      setDialogProps({
      title: "Datos incompletos",
      description: "Debes completar todos los campos requeridos antes de avanzar al siguiente paso.",
      variant: "error",
      confirmText: "Entendido",
    })
    setDialogOpen(true)
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
  if (!validateStep(currentStep)) return;

  try {
    const formPayload = new FormData();

    // 1: Mapear los datos del formulario al formato que espera el DTO del backend.
    const backendData = {
      ...formData,
      carrera_id: formData.carrera,
      // Con la entidad actualizada, ahora enviamos los strings directamente.
      completo_nivel_medio: formData.completo_nivel_medio === 'SI' ? 'Sí' : 'No',
      completo_nivel_superior:
        formData.completo_nivel_superior === 'COMPLETO' ? 'Sí'
        : formData.completo_nivel_superior === 'EN_CURSO' ? 'En curso'
        : 'No',
      trabajo: formData.trabajo === 'SI' ? 'Sí' : 'No',
      personas_cargo: formData.personas_cargo === 'SI' ? 'Sí' : 'No',
    };

    // 2: Poblar el FormData con los datos corregidos y listos para el backend.
    Object.entries(backendData).forEach(([key, value]) => {
      // Excluimos campos que se manejan por separado (archivos) o que no deben enviarse (lógica de UI).
      if (key !== 'dniFrente' && key !== 'dniDorso' && key !== 'carrera' && key !== 'numeroRegistro' && key !== 'ciclo_lectivo' && value !== null && value !== undefined) {
        // Ya no hay booleanos que convertir, todos los valores son strings.
        formPayload.append(key, value as string);
      }
    });

    if (formData.dniFrente) {
      formPayload.append('dniFrente', formData.dniFrente);
    }
    if (formData.dniDorso) {
      formPayload.append('dniDorso', formData.dniDorso);
    }

    // 3: Hacer una llamada unica al backend.
    // El controlador de 'aspirante' ya se encarga de crear la preinscripción y enviar la constancia.
    // CORRECCIÓN: Usar la variable de entorno para la URL de la API.
    const aspiranteResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/aspirante`, {
      method: 'POST',
      body: formPayload,
    });

    if (!aspiranteResponse.ok) {
      // **MEJORA EN EL MANEJO DE ERRORES**
      // NestJS envía un objeto de error con una propiedad 'message'.
      // Si 'message' es un array (común en errores de validación), lo unimos.
      // Si es un string, lo usamos directamente.
      const errorData = await aspiranteResponse.json();
      const serverMessage = Array.isArray(errorData.message) 
        ? errorData.message.join('\n') 
        : errorData.message || 'Error desconocido del servidor.';
      alert(`Error del servidor:\n${serverMessage}`);
      console.error('Error del servidor:', errorData); // Loguear el error completo para depuración.
      return;
    }
    setDialogProps({
      title: "Formulario correcto",
      description: "¡Formulario enviado con éxito! Revisa tu correo electrónico para ver la constancia de preinscripción.",
      variant: "success",
      confirmText: "Entendido",
      onConfirm: () => navigate("/"),
    })
    setDialogOpen(true)
  } catch (error) {
    console.error(error);
    alert('Error inesperado al conectar con el servidor.');
  }
};


  const renderPersonalData = () => (
    <div className="space-y-6">
      {/* Título de sección */}
      <div className="bg-slate-800 rounded-lg p-4 text-center">
        <h2 className="text-white text-xl font-semibold uppercase tracking-wider">ELECCIÓN DE CARRERA</h2>
      </div>

      <div className="w-full mt-4">
        <FormField
          label="Carrera"
          id="carrera"
          value={formData.carrera}
          onChange={(value) => setFormData({ ...formData, carrera: value })}
          options={carrerasOptions}
          placeholder="..."
          required
        />


      </div>

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
          id="cuil"
          value={formData.cuil}
          onChange={(value) => handleInputChange("cuil", value)}
          error={errors.cuil}
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
          id="codigo_postal"
          value={formData.codigo_postal}
          onChange={(value) => handleInputChange("codigo_postal", value)}
          error={errors.codigo_postal}
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
          id="fecha_nacimiento"
          type="date"
          value={formData.fecha_nacimiento}
          onChange={(value) => handleInputChange("fecha_nacimiento", value)}
          error={errors.fecha_nacimiento}
          required
        />

        <FormField
          label="CIUDAD DE NACIMIENTO"
          id="ciudad_nacimiento"
          value={formData.ciudad_nacimiento}
          onChange={(value) => handleInputChange("ciudad_nacimiento", value)}
          error={errors.ciudad_nacimiento}
          required
        />

        <FormField
              label="PROVINCIA DE NACIMIENTO"
              id="provincia_nacimiento"
              value={formData.provincia_nacimiento}
              onChange={(value) => handleInputChange("provincia_nacimiento", value)}
              options={provincias}
              placeholder="PROVINCIA..."
              error={errors.provincia_nacimiento}
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
    const nivelMedioEnabled = formData.completo_nivel_medio === "SI"
    const nivelSuperiorEnabled = formData.completo_nivel_superior === "COMPLETO" || formData.completo_nivel_superior === "EN_CURSO"
    const nivelSuperiorCompleto = formData.completo_nivel_superior === "COMPLETO"
    const trabajaEnabled = formData.trabajo === "SI"

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
            name="completo_nivel_medio"
            options={[
              { value: "SI", label: "SI" },
              { value: "NO", label: "NO" },
            ]}
            value={formData.completo_nivel_medio}
            onChange={(value) => handleInputChange("completo_nivel_medio", value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField
              label="AÑO DE INGRESO"
              id="anio_ingreso_medio"
              value={formData.anio_ingreso_medio}
              onChange={(value) => handleInputChange("anio_ingreso_medio", value)}
              disabled={!nivelMedioEnabled}
              required
              error={errors.anio_ingreso_medio}
            />
            <FormField
              label="AÑO DE EGRESO"
              id="anio_egreso_medio"
              value={formData.anio_egreso_medio}
              onChange={(value) => handleInputChange("anio_egreso_medio", value)}
              disabled={!nivelMedioEnabled}
              required
              error={errors.anio_egreso_medio}
            />
            <FormField
              label="PROVINCIA"
              id="provincia_medio"
              value={formData.provincia_medio}
              onChange={(value) => handleInputChange("provincia_medio", value)}
              options={provincias}
              placeholder="PROVINCIA..."
              disabled={!nivelMedioEnabled}
              required
              error={errors.provincia_medio}
            />
            <FormField
              label="TÍTULO"
              id="titulo_medio"
              value={formData.titulo_medio}
              onChange={(value) => handleInputChange("titulo_medio", value)}
              disabled={!nivelMedioEnabled}
              required
              error={errors.titulo_medio}
            />
          </div>
        </div>

        {/* Nivel Superior */}
        <div>
          <RadioGroup
            label="NIVEL SUPERIOR:"
            name="completo_nivel_superior"
            options={[
              { value: "COMPLETO", label: "COMPLETO" },
              { value: "NO", label: "NO" },
              { value: "EN_CURSO", label: "EN CURSO" },
              
            ]}
            value={formData.completo_nivel_superior}
            onChange={(value) => handleInputChange("completo_nivel_superior", value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <FormField
              label="CARRERA"
              id="carrera_superior"
              value={formData.carrera_superior}
              onChange={(value) => handleInputChange("carrera_superior", value)}
              disabled={!nivelSuperiorEnabled}
              required
              error={errors.carrera_superior}
            />
            <FormField
              label="INSTITUCIÓN"
              id="institucion_superior"
              value={formData.institucion_superior}
              onChange={(value) => handleInputChange("institucion_superior", value)}
              disabled={!nivelSuperiorEnabled}
              required
              error={errors.institucion_superior}
            />
            <FormField
              label="PROVINCIA"
              id="provincia_superior"
              value={formData.provincia_superior}
              onChange={(value) => handleInputChange("provincia_superior", value)}
              options={provincias}
              placeholder="PROVINCIA..."
              disabled={!nivelSuperiorEnabled}
              required
              error={errors.provincia_superior}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="AÑO DE INGRESO"
              id="anio_ingreso_superior"
              value={formData.anio_ingreso_superior}
              onChange={(value) => handleInputChange("anio_ingreso_superior", value)}
              disabled={!nivelSuperiorEnabled}
              required
              error={errors.anio_ingreso_superior}
            />
            <FormField
              label="AÑO DE EGRESO"
              id="anio_egreso_superior"
              value={formData.anio_egreso_superior}
              onChange={(value) => handleInputChange("anio_egreso_superior", value)}
              disabled={!nivelSuperiorCompleto}
              required
              error={errors.anio_egreso_superior}
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
              name="trabajo"
              options={[
                { value: "SI", label: "SI" },
                { value: "NO", label: "NO" },
              ]}
              value={formData.trabajo}
              onChange={(value) => handleInputChange("trabajo", value)}
            />

            <div className="space-y-4">
              <FormField
                label="HORAS DIARIAS"
                id="horas_diarias"
                value={formData.horas_diarias}
                onChange={(value) => handleInputChange("horas_diarias", value)}
                disabled={!trabajaEnabled}
                required
                error={errors.horas_diarias}
              />

              <FormField
                label="DESCRIPCIÓN DEL TRABAJO"
                id="descripcion_trabajo"
                type="textarea"
                value={formData.descripcion_trabajo}
                onChange={(value) => handleInputChange("descripcion_trabajo", value)}
                disabled={!trabajaEnabled}
                required
                error={errors.descripcion_trabajo}
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
              name="personas_cargo"
              options={[
                { value: "SI", label: "SI" },
                { value: "NO", label: "NO" },
              ]}
              value={formData.personas_cargo}
              onChange={(value) => handleInputChange("personas_cargo", value)}
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
              accept="image/jpeg,image/png"
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
              accept="image/jpeg,image/png"
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
            <Link to="/">
              <button className="flex items-center justify-center w-12 h-12 bg-[#274357] hover:bg-teal-600 rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
            </Link>
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
<CustomDialog
    open={dialogOpen}
    onClose={() => setDialogOpen(false)}
    title={dialogProps.title ?? ""}
    description={dialogProps.description ?? ""}
    confirmLabel={dialogProps.confirmText ?? "Entendido"}
    cancelLabel={dialogProps.cancelText}
    onConfirm={dialogProps.onConfirm}
    showCancel={!!dialogProps.onCancel}
/>
          </div>
        </div>
      </div>
    </>
  )
}