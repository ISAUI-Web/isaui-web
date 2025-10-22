"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { ArrowLeft, User, Save, Edit, Eye, X, Camera, Upload, FileText } from "lucide-react"
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import jsPDF from "jspdf"

const API_BASE = 'http://localhost:3000';
const abs = (u?: string | null) => {
  if (!u) return '';
  return u.startsWith('http') || u.startsWith('blob:') ? u : `${API_BASE}${u}`;
};

// Datos de ejemplo del aspirante


const tabs = [
  { id: "datos", label: "Datos personales" },
  { id: "estudios", label: "Estudios" },
  { id: "laboral", label: "Situación laboral y responsabilidades" },
  { id: "documentacion", label: "Documentación" },
]

export default function DetalleLegajo() {
  const navigate = useNavigate();
  const { id } = useParams();
   const location = useLocation();

  const [activeTab, setActiveTab] = useState("datos")
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<any>({
    nombre: '',
    apellido: '',
    sexo: '',
    dni: '',
    cuil: '',
    domicilio: '',
    localidad: '',
    barrio: '',
    codigo_postal: '',
    telefono: '',
    email: '',
    fecha_nacimiento: '',
    ciudad_nacimiento: '',
    provincia_nacimiento: '',
    carrera: '',
    estado_preinscripcion: '',
    estado_matriculacion: '',
    // ... y así con todos los demás campos para evitar que sean `undefined`
    documentos: {
      dniFrenteUrl: null,
      dniDorsoUrl: null,
      cusUrl: null,
      foto_carnetUrl: null,
      isaUrl: null,
      partida_nacimientoUrl: null,
      analiticoUrl: null,
      grupo_sanguineoUrl: null,
      cudUrl: null,
      emmacUrl: null,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploadingImage, setIsUploadingImage] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  
  // Generar años para el selector de ciclo lectivo
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - i); // Genera años desde el actual hasta 10 años atrás

  // Estado para manejar los archivos seleccionados para subir
  const [dniFrenteFile, setDniFrenteFile] = useState<File | null>(null);
  const [dniDorsoFile, setDniDorsoFile] = useState<File | null>(null);
  const [cusFile, setCusFile] = useState<File | null>(null);
  const [fotoCarnetFile, setFotoCarnetFile] = useState<File | null>(null);
  const [isaFile, setIsaFile] = useState<File | null>(null);
  const [partidaNacimientoFile, setPartidaNacimientoFile] = useState<File | null>(null);
  const [analiticoFile, setAnaliticoFile] = useState<File | null>(null);
  const [grupoSanguineoFile, setGrupoSanguineoFile] = useState<File | null>(null);
  const [cudFile, setCudFile] = useState<File | null>(null);
  const [emmacFile, setEmmacFile] = useState<File | null>(null);

  // Mapeo para manejar el estado de los archivos de forma genérica
  const fileStates: Record<string, React.Dispatch<React.SetStateAction<File | null>>> = {
    dniFrente: setDniFrenteFile,
    dniDorso: setDniDorsoFile,
    cus: setCusFile,
    foto_carnet: setFotoCarnetFile,
    isa: setIsaFile,
    partida_nacimiento: setPartidaNacimientoFile,
    analitico: setAnaliticoFile,
    grupo_sanguineo: setGrupoSanguineoFile,
    cud: setCudFile,
    emmac: setEmmacFile,
  };

  //  VALIDACIÓN UNIFICADA
  // Esta función centraliza toda la lógica de validación, eliminando la duplicación
  // y asegurando que las reglas sean consistentes en todo el componente.
  const validate = (data: any, step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!data.nombre) {
        newErrors.nombre = "El nombre es requerido"
      } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(data.nombre)) {
        newErrors.nombre = "El nombre solo puede contener letras"
      }
      if (!data.apellido) {
        newErrors.apellido = "El apellido es requerido"
      } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(data.apellido)) {
        newErrors.apellido = "El apellido solo puede contener letras"
      }
      if (!data.dni) newErrors.dni = "El DNI es requerido"
      else if (!/^\d{7,8}$/.test(data.dni)) {
        newErrors.dni = "El DNI debe tener 7 u 8 dígitos"
      } else if (isNaN(Number(data.dni))) {
        newErrors.dni = "El DNI debe ser un número"
      }
      if (!data.cuil) newErrors.cuil = "El CUIL/CUIT es requerido"
      else if (!/^\d{11}$/.test(data.cuil)) {
        newErrors.cuil = "El CUIL/CUIT debe tener 11 dígitos"
      } else if (isNaN(Number(data.cuil))) {
        newErrors.cuil = "El CUIL/CUIT debe ser un número"
      }
      if (!data.domicilio) newErrors.domicilio = "El domicilio es requerido"
      if (!data.localidad) newErrors.localidad = "La localidad es requerida"
      if (!data.barrio) newErrors.barrio = "El barrio es requerido"
      if (!data.codigo_postal) newErrors.codigo_postal = "El código postal es requerido"
      else if (!/^\d{4,5}$/.test(data.codigo_postal)) {
        newErrors.codigo_postal = "El código postal debe tener 4 o 5 dígitos"
      } else if (isNaN(Number(data.codigo_postal))) {
        newErrors.codigo_postal = "El código postal debe ser un número"
      }
      if (!data.telefono) newErrors.telefono = "El teléfono es requerido"
      else if (!/^\d{6,15}$/.test(data.telefono)) {
        newErrors.telefono = "El teléfono debe tener entre 6 y 15 dígitos"
      } else if (isNaN(Number(data.telefono))) {
        newErrors.telefono = "El teléfono debe ser un número"
      }
      if (!data.email) {
        newErrors.email = "El email es requerido"
      } else if (
        !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(data.email)
      ) {
        newErrors.email = "El email no es válido"
      }
      if (!data.fecha_nacimiento) newErrors.fecha_nacimiento = "La fecha de nacimiento es requerida"
      else {
        const today = new Date()
        const birthDate = new Date(data.fecha_nacimiento)
        if (birthDate >= today) {
          newErrors.fecha_nacimiento = "La fecha de nacimiento no puede ser hoy o en el futuro"
        }
      }
      if (!data.ciudad_nacimiento) newErrors.ciudad_nacimiento = "La ciudad de nacimiento es requerida"
      if (!data.provincia_nacimiento) newErrors.provincia_nacimiento = "La provincia es requerida"
      if (!data.sexo) newErrors.sexo = "El sexo es requerido"
    }

    if (step === 2) {
      if (!data.completo_nivel_medio) newErrors.completo_nivel_medio = "Debe indicar si completó el nivel medio";
      if (data.completo_nivel_medio === "Sí") {
        if (!data.anio_ingreso_medio) newErrors.anio_ingreso_medio = "El año de ingreso es requerido";
        else if (Number(data.anio_ingreso_medio) < 1900) newErrors.anio_ingreso_medio = "El año de ingreso debe ser mayor a 1900";
        if (!data.anio_egreso_medio) newErrors.anio_egreso_medio = "El año de egreso es requerido";
        else if (Number(data.anio_egreso_medio) < 1900) newErrors.anio_egreso_medio = "El año de egreso debe ser mayor a 1900";
        if (!data.provincia_medio) newErrors.provincia_medio = "La provincia es requerida";
        if (!data.titulo_medio) newErrors.titulo_medio = "El título es requerido";
      }

      if (!data.completo_nivel_superior) newErrors.completo_nivel_superior = "Debe indicar si completó el nivel superior"
      if (data.completo_nivel_superior === "Sí" || data.completo_nivel_superior === "En curso") {
        if (!data.carrera_superior) newErrors.carrera_superior = "La carrera es requerida"
        if (!data.institucion_superior) newErrors.institucion_superior = "La institución es requerida"
        if (!data.provincia_superior) newErrors.provincia_superior = "La provincia es requerida"
        if (!data.anio_ingreso_superior) newErrors.anio_ingreso_superior = "El año de ingreso es requerido"
      }
      if (data.completo_nivel_superior === "Sí") {
        if (!data.anio_egreso_superior) newErrors.anio_egreso_superior = "El año de egreso es requerido"
      }
    }

    if (step === 3) {
      // Validaciones de situación laboral y responsabilidades
      if (data.trabajo === "Sí" || data.trabajo === true) {
        if (!data.horas_diarias) {
          newErrors.horas_diarias = "Las horas diarias son requeridas";
        } else if (isNaN(Number(data.horas_diarias)) || Number(data.horas_diarias) <= 0) {
          newErrors.horas_diarias = "Las horas diarias deben ser un número mayor a 0";
        }
        if (!data.descripcion_trabajo) {
          newErrors.descripcion_trabajo = "La descripción del trabajo es requerida";
        }
      }
    }

    // Para la pestaña de documentación, no hay campos editables que validar.
    // Siempre se considera válida para permitir guardar cambios en los archivos.
    if (step === 4) {
      // No hay errores que agregar
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  useEffect(() => {
  const fetchLegajo = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/estudiante/by-aspirante/${id}`);
      if (!response.ok) throw new Error('Error al cargar el legajo del estudiante');

      const estudianteData = await response.json();
      console.log("Legajo de Estudiante cargado:", estudianteData);

      if (!estudianteData.aspirante) {
        throw new Error('Los datos del aspirante no se encontraron en la respuesta del legajo.');
      }

      const formattedDate = estudianteData.aspirante.fecha_nacimiento 
        ? estudianteData.aspirante.fecha_nacimiento.split('T')[0] 
        : "";

      // El problema es que la respuesta del backend es anidada: { ..., aspirante: { ... } }
      // El estado del frontend espera una estructura plana.
      // La solución es combinar los datos del estudiante y los datos del aspirante anidado.
      // Y lo más importante, construir el objeto `documentos` a partir del objeto `aspirante` anidado.
      setFormData({
        ...estudianteData, // Copia los datos del estudiante (id, año_actual, etc.)
        ...estudianteData.aspirante, // Copia los datos del aspirante (nombre, dni, etc.)
        fecha_nacimiento: formattedDate,
        documentos: {
          // El error estaba aquí. No se estaba leyendo del objeto anidado.
          // Ahora, tomamos todas las URLs del objeto `aspirante` y las ponemos en `documentos`.
          ...estudianteData.aspirante,
        },
      });
    } catch (error) {
      console.error("❌ Error:", error)
    } finally {
      setIsLoading(false);
    }
  }

  if (id) fetchLegajo()
}, [id])

  const handleBack = () => {
      // Si existe un "from", vuelve ahí. Si no, vuelve a aspirantes por defecto
      navigate("/legajo");
    }
  
  const handleSave = async () => {
    const step =
    activeTab === "datos" ? 1 :
    activeTab === "estudios" ? 2 :
    activeTab === "laboral" ? 3 :
    activeTab === "documentacion" ? 4 : 1;
  // Usamos la nueva función de validación unificada, pasándole el estado actual del formulario
  if (!validate(formData, step)) {
    alert("Por favor, corrige los errores antes de guardar.");
    return;
  }

  const data = new FormData();

  // Lista de campos que SÍ se deben enviar al backend (coinciden con UpdateAspiranteDto)
  const allowedKeys = [
    'nombre', 'apellido', 'sexo', 'dni', 'cuil', 'domicilio', 'localidad',
    'barrio', 'codigo_postal', 'telefono', 'email', 'fecha_nacimiento',
    'ciudad_nacimiento', 'provincia_nacimiento', 'estado_preinscripcion',
    'estado_matriculacion', 'completo_nivel_medio', 'anio_ingreso_medio',
    'anio_egreso_medio', 'provincia_medio', 'titulo_medio',
    'completo_nivel_superior', 'carrera_superior', 'institucion_superior',
    'provincia_superior', 'anio_ingreso_superior', 'anio_egreso_superior', 'ciclo_lectivo',
    'trabajo', 'horas_diarias', 'descripcion_trabajo', 'personas_cargo'
  ];

  // Iteramos sobre las claves permitidas y las agregamos al FormData si existen en el estado
  allowedKeys.forEach(key => {
    if (formData[key] !== null && formData[key] !== undefined) {
      let value = formData[key];

      // Convertir booleanos a string 'true'/'false'
      if (typeof value === 'boolean') {
        value = String(value);
      }

      // Mapeo de valores de selects a lo que espera el backend si es necesario
      // (ej: 'Sí' -> 'true', 'No' -> 'false')
      if (['completo_nivel_medio', 'completo_nivel_superior', 'trabajo', 'personas_cargo'].includes(key)) {
        if (value === 'Sí') {
          value = 'true';
        } else if (value === 'No') {
          value = 'false';
        }
        // Si es 'En curso', se mantiene como está
      }

      // Si el valor es una cadena vacía, no lo enviamos para que el backend
      // no intente validar un campo opcional vacío.
      if (value !== '') {
        data.append(key, value);
      }
    }
  });

  // Adjuntamos los nuevos archivos si fueron seleccionados
  if (dniFrenteFile) {
    data.append('dniFrente', dniFrenteFile);
  }
  if (dniDorsoFile) {
    data.append('dniDorso', dniDorsoFile);
  }
  if (cusFile) data.append('cus', cusFile);
  if (fotoCarnetFile) data.append('foto_carnet', fotoCarnetFile);
  if (isaFile) data.append('isa', isaFile);
  if (partidaNacimientoFile) data.append('partida_nacimiento', partidaNacimientoFile);
  if (analiticoFile) data.append('analitico', analiticoFile);
  if (grupoSanguineoFile) data.append('grupo_sanguineo', grupoSanguineoFile);
  if (cudFile) data.append('cud', cudFile);
  if (emmacFile) data.append('emmac', emmacFile);

  try {
    const res = await fetch(`http://localhost:3000/aspirante/${id}`, {
      method: 'PUT',
      // NO establecemos Content-Type, el navegador lo hará automáticamente para FormData
      body: data,
    });

    if (!res.ok) {
      const errorData = await res.json();
      const errorMessage = errorData.message || 'Error desconocido del servidor.';
      const detailedMessage = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;
      throw new Error(detailedMessage);
    }

    const updatedLegajo = await res.json();

    // Formateamos la fecha que viene del backend
    const formattedDate = updatedLegajo.fecha_nacimiento
      ? updatedLegajo.fecha_nacimiento.split('T')[0]
      : "";

    setFormData({
      ...formData, // Mantiene el estado actual
      ...updatedLegajo, // Sobrescribe con los datos actualizados del backend
      fecha_nacimiento: formattedDate,
      documentos: {
        ...formData.documentos, // Mantiene las URLs de documentos existentes
        ...updatedLegajo, // Sobrescribe con las nuevas URLs si las hay
      }
    });
    setIsEditing(false);
    alert('Cambios guardados con éxito');
  } catch (error: any) {
    console.error('Error guardando aspirante:', error);
    alert(`Hubo un error al guardar los cambios: ${error.message}`);
  }
};

  const handleEdit = () => {
    setIsEditing(true)
  }
  
  const handleGeneratePDF = async () => {
    try {
      const pdf = new jsPDF()

      // Helper function to convert image URL to base64
      const getImageBase64 = async (url: string): Promise<string | null> => {
        try {
          const response = await fetch(url)
          const blob = await response.blob()
          return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(blob)
          })
        } catch (error) {
          console.error("[v0] Error loading image:", url, error)
          return null
        }
      }

      let yPosition = 20 // Start at top of page

      const printDate = new Date().toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      pdf.setFontSize(9)
      pdf.setFont("helvetica", "normal")
      pdf.setTextColor(100, 100, 100)
      pdf.text(`Fecha de impresión: ${printDate}`, 200, yPosition, { align: "right" })
      pdf.setTextColor(0, 0, 0) // Reset to black
      yPosition += 10

      // Title
      pdf.setFontSize(18)
      pdf.setFont("helvetica", "bold")
      pdf.text(`Legajo del Estudiante`, 105, yPosition, { align: "center" })
      yPosition += 8

      pdf.setFontSize(14)
      pdf.text(`${formData.nombre} ${formData.apellido}`, 105, yPosition, { align: "center" })
      yPosition += 12

      const leftX = 20
      const lineHeight = 6

      // Personal Data Section
      pdf.setFontSize(12)
      pdf.setFont("helvetica", "bold")
      pdf.text("DATOS PERSONALES", leftX, yPosition)
      yPosition += lineHeight + 2

      pdf.setFontSize(10)
      pdf.setFont("helvetica", "normal")

      const personalData = [
        `Nombre: ${formData.nombre || "N/A"}`,
        `Apellido: ${formData.apellido || "N/A"}`,
        `Sexo: ${formData.sexo || "N/A"}`,
        `DNI: ${formData.dni || "N/A"}`,
        `CUIL/CUIT: ${formData.cuil || "N/A"}`,
        `Domicilio: ${formData.domicilio || "N/A"}`,
        `Localidad: ${formData.localidad || "N/A"}`,
        `Barrio: ${formData.barrio || "N/A"}`,
        `Código Postal: ${formData.codigo_postal || "N/A"}`,
        `Teléfono: ${formData.telefono || "N/A"}`,
        `Email: ${formData.email || "N/A"}`,
        `Fecha de Nacimiento: ${formData.fecha_nacimiento || "N/A"}`,
        `Ciudad de Nacimiento: ${formData.ciudad_nacimiento || "N/A"}`,
        `Provincia: ${formData.provincia_nacimiento || "N/A"}`,
        `Carrera: ${formData.carrera || "N/A"}`,
        `Ciclo Lectivo: ${formData.ciclo_lectivo || "N/A"}`,
      ]

      personalData.forEach((line) => {
        pdf.text(line, leftX, yPosition)
        yPosition += lineHeight
      })

      yPosition += 5

      // Education Section
      pdf.setFontSize(12)
      pdf.setFont("helvetica", "bold")
      pdf.text("ESTUDIOS", leftX, yPosition)
      yPosition += lineHeight + 2

      pdf.setFontSize(10)
      pdf.setFont("helvetica", "normal")

      const educationData = [`Nivel Medio: ${formData.completo_nivel_medio || "N/A"}`]

      if (formData.completo_nivel_medio === "Sí") {
        educationData.push(
          `Año Ingreso: ${formData.anio_ingreso_medio || "N/A"}`,
          `Año Egreso: ${formData.anio_egreso_medio || "N/A"}`,
          `Provincia: ${formData.provincia_medio || "N/A"}`,
          `Título: ${formData.titulo_medio || "N/A"}`,
        )
      }

      educationData.push(`Nivel Superior: ${formData.completo_nivel_superior || "N/A"}`)

      if (formData.completo_nivel_superior === "Sí" || formData.completo_nivel_superior === "En curso") {
        educationData.push(
          `Carrera: ${formData.carrera_superior || "N/A"}`,
          `Institución: ${formData.institucion_superior || "N/A"}`,
          `Provincia: ${formData.provincia_superior || "N/A"}`,
          `Año Ingreso: ${formData.anio_ingreso_superior || "N/A"}`,
        )
        if (formData.completo_nivel_superior === "Sí") {
          educationData.push(`Año Egreso: ${formData.anio_egreso_superior || "N/A"}`)
        }
      }

      educationData.forEach((line) => {
        pdf.text(line, leftX, yPosition)
        yPosition += lineHeight
      })

      yPosition += 5

      // Work Situation Section
      pdf.setFontSize(12)
      pdf.setFont("helvetica", "bold")
      pdf.text("SITUACIÓN LABORAL", leftX, yPosition)
      yPosition += lineHeight + 2

      pdf.setFontSize(10)
      pdf.setFont("helvetica", "normal")

      const workData = [`Trabaja: ${formData.trabajo || "N/A"}`]

      if (formData.trabajo === "Sí") {
        workData.push(
          `Horas Diarias: ${formData.horas_diarias || "N/A"}`,
          `Descripción: ${formData.descripcion_trabajo || "N/A"}`,
        )
      }

      workData.push(`Personas a Cargo: ${formData.personas_cargo || "N/A"}`)

      workData.forEach((line) => {
        pdf.text(line, leftX, yPosition)
        yPosition += lineHeight
      })

      // Collect all documents with their titles
      const documents = [
        { url: formData.documentos?.dniFrenteUrl, title: "DNI - Frente" },
        { url: formData.documentos?.dniDorsoUrl, title: "DNI - Dorso" },
        { url: formData.documentos?.cusUrl, title: "CUS" },
        { url: formData.documentos?.foto_carnetUrl, title: "Foto Carnet 4x4" },
        { url: formData.documentos?.isaUrl, title: "ISA" },
        { url: formData.documentos?.partida_nacimientoUrl, title: "Partida de Nacimiento" },
        { url: formData.documentos?.analiticoUrl, title: "Analítico Secundario" },
        { url: formData.documentos?.grupo_sanguineoUrl, title: "Certificado de Grupo Sanguíneo" },
        { url: formData.documentos?.cudUrl, title: "CUD" },
        { url: formData.documentos?.emmacUrl, title: "EMMAC" },
      ].filter((doc) => doc.url)

      if (documents.length > 0) {
        pdf.addPage()
        yPosition = 20

        // Add documentation title on the new page
        pdf.setFontSize(12)
        pdf.setFont("helvetica", "bold")
        pdf.text("DOCUMENTACIÓN", 20, yPosition)
        yPosition += 10

        // Process documents two at a time
        for (let i = 0; i < documents.length; i += 2) {
          const doc1 = documents[i]
          const doc2 = documents[i + 1]

          // If this is not the first pair of images, add a new page
          if (i > 0) {
            pdf.addPage()
            yPosition = 20
          }

          // Add first image
          const fullUrl1 = abs(doc1.url)
          const base64_1 = await getImageBase64(fullUrl1)

          if (base64_1) {
            // Add document title
            pdf.setFontSize(11)
            pdf.setFont("helvetica", "bold")
            pdf.text(doc1.title, 20, yPosition)
            yPosition += 7

            // Add image
            const imgWidth = 170
            const imgHeight = 110
            pdf.addImage(base64_1, "JPEG", 20, yPosition, imgWidth, imgHeight)
            yPosition += imgHeight + 15
          }

          // Add second image if it exists
          if (doc2) {
            const fullUrl2 = abs(doc2.url)
            const base64_2 = await getImageBase64(fullUrl2)

            if (base64_2) {
              // Add document title
              pdf.setFontSize(11)
              pdf.setFont("helvetica", "bold")
              pdf.text(doc2.title, 20, yPosition)
              yPosition += 7

              // Add image
              const imgWidth = 170
              const imgHeight = 110
              pdf.addImage(base64_2, "JPEG", 20, yPosition, imgWidth, imgHeight)
            }
          }
        }
      }

      // Save the PDF
      pdf.save(`Legajo_${formData.apellido}_${formData.nombre}_${formData.dni}.pdf`)

      console.log("[v0] PDF generated successfully with all documentation")
    } catch (error: any) {
      console.error("[v0] Error generating PDF:", error)
      alert(`Hubo un error al generar el PDF: ${error.message}`)
    }
  }

  const handleViewImage = (imageUrl: string | null) => {
    if (imageUrl) {
      setSelectedImage(imageUrl)
    }
  }

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    documentType: string,
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      // Guardamos el archivo en el estado correspondiente
      const fileSetter = fileStates[documentType];
      if (fileSetter) {
        fileSetter(file);
      }
      // Mostramos una vista previa local de la imagen seleccionada
      const previewUrl = URL.createObjectURL(file);
      const urlKey = `${documentType}Url`;
      const nameKey = `${documentType}Nombre`;

      setFormData((prev: any) => ({
        ...prev,
        documentos: { ...prev.documentos, [urlKey]: previewUrl, [nameKey]: file.name },
      }));
    }
  }

  const triggerFileInput = (documentType: string) => {
    fileInputRefs.current[documentType]?.click();
  };

  const setInputRef = (documentType: string) => (el: HTMLInputElement | null) => {
    if (el) {
      fileInputRefs.current[documentType] = el;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Calcula el nuevo estado antes de setearlo
    let newFormData = { ...formData, [field]: value };

    // Limpiar campos relacionados cuando se cambia a "No"
    if (field === "completo_nivel_medio" && value === "No") {
      newFormData.anio_ingreso_medio = "";
      newFormData.anio_egreso_medio = "";
      newFormData.provincia_medio = "";
      newFormData.titulo_medio = "";
    }

    if (field === "completo_nivel_superior" && value === "No") {
      newFormData.carrera_superior = "";
      newFormData.institucion_superior = "";
      newFormData.provincia_superior = "";
      newFormData.anio_ingreso_superior = "";
      newFormData.anio_egreso_superior = "";
    }

    // Limpiar año de egreso si se cambia a "En curso"
    if (field === "completo_nivel_superior" && value === "En curso") {
      newFormData.anio_egreso_superior = "";
    }

    if (field === "trabajo" && value === "No") {
      newFormData.horas_diarias = "";
      newFormData.descripcion_trabajo = "";
    }

    setFormData(newFormData);

    // Validación en tiempo real usando el nuevo estado
    if (isEditing) {
      const step =
        activeTab === "datos" ? 1 :
        activeTab === "estudios" ? 2 :
        activeTab === "laboral" ? 3 :
        activeTab === "documentacion" ? 4 : 1;
      // Usamos la nueva función de validación unificada, pasándole el nuevo estado
      validate(newFormData, step);
    }
  }

  const fromAspirantes = location.state?.from === "/aspirantes";
const fromMatriculacion = location.state?.from === "/matriculacion";

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1F6680] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Cargando datos del legajo...</p>
        </div>
      </div>
    );
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
        value={formData.nombre || ""}
        onChange={(e) => handleInputChange("nombre", e.target.value)}
        className="w-full"
      />
    ) : (
      <div className="text-blue-600 font-medium">{formData.nombre}</div>
    )}
    {errors.nombre && (
      <div className="text-red-500 text-xs mt-1">{errors.nombre}</div>
    )}
  </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">APELLIDO</Label>
              {isEditing ? (
                <Input
                  value={formData.apellido || ""}
                  onChange={(e) => handleInputChange("apellido", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.apellido}</div>
              )}
              {errors.apellido && <div className="text-red-500 text-xs mt-1">{errors.apellido}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">SEXO</Label>
              {isEditing ? (
                <Input
                  value={formData.sexo || ""}
                  onChange={(e) => handleInputChange("sexo", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.sexo}</div>
              )}
              {errors.sexo && <div className="text-red-500 text-xs mt-1">{errors.sexo}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">DNI</Label>
              {isEditing ? (
                <Input
                  value={formData.dni || ""}
                  onChange={(e) => handleInputChange("dni", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.dni}</div>
              )}
              {errors.dni && <div className="text-red-500 text-xs mt-1">{errors.dni}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">CUIL/CUIT</Label>
              {isEditing ? (
                <Input
                  value={formData.cuil || ""}
                  onChange={(e) => handleInputChange("cuil", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.cuil}</div>
              )}
              {errors.cuil && <div className="text-red-500 text-xs mt-1">{errors.cuil}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">DOMICILIO</Label>
              {isEditing ? (
                <Input
                  value={formData.domicilio || ""}
                  onChange={(e) => handleInputChange("domicilio", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.domicilio}</div>
              )}
              {errors.domicilio && <div className="text-red-500 text-xs mt-1">{errors.domicilio}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">LOCALIDAD</Label>
              {isEditing ? (
                <Input
                  value={formData.localidad || ""}
                  onChange={(e) => handleInputChange("localidad", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.localidad}</div>
              )}
              {errors.localidad && <div className="text-red-500 text-xs mt-1">{errors.localidad}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">BARRIO</Label>
              {isEditing ? (
                <Input
                  value={formData.barrio || ""}
                  onChange={(e) => handleInputChange("barrio", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.barrio}</div>
              )}
              {errors.barrio && <div className="text-red-500 text-xs mt-1">{errors.barrio}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">CÓDIGO POSTAL</Label>
              {isEditing ? (
                <Input
                  value={formData.codigo_postal || ""}
                  onChange={(e) => handleInputChange("codigo_postal", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.codigo_postal}</div>
              )}
              {errors.codigo_postal && <div className="text-red-500 text-xs mt-1">{errors.codigo_postal}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">TELÉFONO</Label>
              {isEditing ? (
                <Input
                  value={formData.telefono || ""}
                  onChange={(e) => handleInputChange("telefono", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.telefono}</div>
              )}
              {errors.telefono && <div className="text-red-500 text-xs mt-1">{errors.telefono}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">MAIL</Label>
              {isEditing ? (
                <Input
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.email}</div>
              )}
              {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">FECHA DE NACIMIENTO</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={formData.fecha_nacimiento || ""}
                  onChange={(e) => handleInputChange("fecha_nacimiento", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.fecha_nacimiento}</div>
              )}
              {errors.fecha_nacimiento && <div className="text-red-500 text-xs mt-1">{errors.fecha_nacimiento}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">CIUDAD DE NACIMIENTO</Label>
              {isEditing ? (
                <Input
                  value={formData.ciudad_nacimiento || ""}
                  onChange={(e) => handleInputChange("ciudad_nacimiento", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.ciudad_nacimiento}</div>
              )}
              {errors.ciudad_nacimiento && <div className="text-red-500 text-xs mt-1">{errors.ciudad_nacimiento}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">PROVINCIA DE NACIMIENTO</Label>
              {isEditing ? (
                <Input
                  value={formData.provincia_nacimiento || ""}
                  onChange={(e) => handleInputChange("provincia_nacimiento", e.target.value)}
                  className="w-full"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.provincia_nacimiento}</div>
              )}
              {errors.provincia_nacimiento && <div className="text-red-500 text-xs mt-1">{errors.provincia_nacimiento}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">CARRERA</Label>
              {isEditing ? (
                <Input
                  value={formData.carrera || ""}
                  readOnly
                  className="w-full bg-gray-100 cursor-not-allowed"
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.carrera}</div>
              )}
              {errors.carrera && <div className="text-red-500 text-xs mt-1">{errors.carrera}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">CICLO LECTIVO</Label>
              {isEditing ? (
                <select
                  value={formData.ciclo_lectivo || ""}
                  onChange={(e) => handleInputChange("ciclo_lectivo", e.target.value)}
                  className="w-full p-2 border rounded-md bg-white text-gray-900 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">Seleccionar ciclo lectivo</option>
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              ) : (
                <div className="text-blue-600 font-medium">
                  {formData.ciclo_lectivo}
                </div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">ESTADO DE PREINSCRIPCIÓN</Label>
              {isEditing ? (
                <select
                  value={formData.estado_preinscripcion || "pendiente"}
                  onChange={(e) => handleInputChange("estado_preinscripcion", e.target.value)}
                  className="w-full p-2 border rounded-md bg-white text-gray-900 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en espera">En Espera</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="rechazado">Rechazado</option>
                </select>
              ) : (
                <div className="text-blue-600 font-medium capitalize">{formData.estado_preinscripcion}</div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">ESTADO DE MATRICULACIÓN</Label>
              {isEditing ? (
                <Input
                  value={formData.estado_matriculacion || ""}
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
                <select
                  value={formData.completo_nivel_medio}
                  onChange={(e) => handleInputChange('completo_nivel_medio', e.target.value)}
                  className="w-full p-2 border rounded-md bg-white text-gray-900 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                </select>
              ) : (
                <div className="text-blue-600 font-medium">{formData.completo_nivel_medio}</div>
              )}
              {errors.completo_nivel_medio && <div className="text-red-500 text-xs mt-1">{errors.completo_nivel_medio}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">AÑO DE INGRESO MEDIO</Label>
              {isEditing ? (
                <Input
                  value={formData.anio_ingreso_medio || ""}
                  onChange={(e) => handleInputChange("anio_ingreso_medio", e.target.value)}
                  className={`w-full ${formData.completo_nivel_medio === "No" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  disabled={formData.completo_nivel_medio === "No"}
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.anio_ingreso_medio}</div>
              )}
              {errors.anio_ingreso_medio && <div className="text-red-500 text-xs mt-1">{errors.anio_ingreso_medio}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">AÑO DE EGRESO MEDIO</Label>
              {isEditing ? (
                <Input
                  value={formData.anio_egreso_medio || ""}
                  onChange={(e) => handleInputChange("anio_egreso_medio", e.target.value)}
                  className={`w-full ${formData.completo_nivel_medio === "No" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  disabled={formData.completo_nivel_medio === "No"}
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.anio_egreso_medio}</div>
              )}
              {errors.anio_egreso_medio && <div className="text-red-500 text-xs mt-1">{errors.anio_egreso_medio}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">PROVINCIA (MEDIO)</Label>
              {isEditing ? (
                <Input
                  value={formData.provincia_medio || ""}
                  onChange={(e) => handleInputChange("provincia_medio", e.target.value)}
                  className={`w-full ${formData.completo_nivel_medio === "No" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  disabled={formData.completo_nivel_medio === "No"}
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.provincia_medio}</div>
              )}
              {errors.provincia_medio && <div className="text-red-500 text-xs mt-1">{errors.provincia_medio}</div>}
            </div>
            <div className="col-span-2">
              <Label className="text-sm font-medium text-gray-700 mb-1 block">TÍTULO NIVEL MEDIO</Label>
              {isEditing ? (
                <Input
                  value={formData.titulo_medio || ""}
                  onChange={(e) => handleInputChange("titulo_medio", e.target.value)}
                  className={`w-full ${formData.completo_nivel_medio === "No" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  disabled={formData.completo_nivel_medio === "No"}
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.titulo_medio}</div>
              )}
              {errors.titulo_medio && <div className="text-red-500 text-xs mt-1">{errors.titulo_medio}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">¿COMPLETÓ NIVEL SUPERIOR?</Label>
              {isEditing ? (
                <select
                  value={formData.completo_nivel_superior}
                  onChange={(e) => handleInputChange('completo_nivel_superior', e.target.value)}
                  className="w-full p-2 border rounded-md bg-white text-gray-900 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                  <option value="En curso">En curso</option>
                </select>
              ) : (
                <div className="text-blue-600 font-medium">{formData.completo_nivel_superior}</div>
              )}
              {errors.completo_nivel_superior && <div className="text-red-500 text-xs mt-1">{errors.completo_nivel_superior}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">CARRERA SUPERIOR</Label>
              {isEditing ? (
                <Input
                  value={formData.carrera_superior || ""}
                  onChange={(e) => handleInputChange("carrera_superior", e.target.value)}
                  className={`w-full ${formData.completo_nivel_superior === "No" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  disabled={formData.completo_nivel_superior === "No"}
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.carrera_superior}</div>
              )}
              {errors.carrera_superior && <div className="text-red-500 text-xs mt-1">{errors.carrera_superior}</div>}
            </div>
            <div className="col-span-2">
              <Label className="text-sm font-medium text-gray-700 mb-1 block">INSTITUCIÓN SUPERIOR</Label>
              {isEditing ? (
                <Input
                  value={formData.institucion_superior || ""}
                  onChange={(e) => handleInputChange("institucion_superior", e.target.value)}
                  className={`w-full ${formData.completo_nivel_superior === "No" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  disabled={formData.completo_nivel_superior === "No"}
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.institucion_superior}</div>
              )}
              {errors.institucion_superior && <div className="text-red-500 text-xs mt-1">{errors.institucion_superior}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">PROVINCIA (SUPERIOR)</Label>
              {isEditing ? (
                <Input
                  value={formData.provincia_superior || ""}
                  onChange={(e) => handleInputChange("provincia_superior", e.target.value)}
                  className={`w-full ${formData.completo_nivel_superior === "No" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  disabled={formData.completo_nivel_superior === "No"}
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.provincia_superior}</div>
              )}
              {errors.provincia_superior && <div className="text-red-500 text-xs mt-1">{errors.provincia_superior}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">AÑO DE INGRESO SUPERIOR</Label>
              {isEditing ? (
                <Input
                  value={formData.anio_ingreso_superior || ""}
                  onChange={(e) => handleInputChange("anio_ingreso_superior", e.target.value)}
                  className={`w-full ${formData.completo_nivel_superior === "No" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  disabled={formData.completo_nivel_superior === "No"}
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.anio_ingreso_superior}</div>
              )}
              {errors.anio_ingreso_superior && <div className="text-red-500 text-xs mt-1">{errors.anio_ingreso_superior}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">AÑO DE EGRESO SUPERIOR</Label>
              {isEditing ? (
                <Input
                  value={formData.anio_egreso_superior || ""}
                  onChange={(e) => handleInputChange("anio_egreso_superior", e.target.value)}
                  className={`w-full ${(formData.completo_nivel_superior === "No" || formData.completo_nivel_superior === "En curso") ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  disabled={formData.completo_nivel_superior === "No" || formData.completo_nivel_superior === "En curso"}
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.anio_egreso_superior}</div>
              )}
              {errors.anio_egreso_superior && <div className="text-red-500 text-xs mt-1">{errors.anio_egreso_superior}</div>}
            </div>
          </div>
        );
      case "laboral":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">¿TRABAJA ACTUALMENTE?</Label>
              {isEditing ? (
                <select
                  value={formData.trabajo}
                  onChange={(e) => handleInputChange('trabajo', e.target.value)}
                  className="w-full p-2 border rounded-md bg-white text-gray-900 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                </select>
              ) : (
                  <div className="text-blue-600 font-medium">{formData.trabajo}</div>
              )}
              {errors.trabajo && <div className="text-red-500 text-xs mt-1">{errors.trabajo}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">HORAS DIARIAS</Label>
              {isEditing ? (
                <Input
                  value={formData.horas_diarias || ""}
                  onChange={(e) => handleInputChange("horas_diarias", e.target.value)}
                  className={`w-full ${formData.trabajo === "No" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  disabled={formData.trabajo === "No"}
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.horas_diarias}</div>
              )}
              {errors.horas_diarias && <div className="text-red-500 text-xs mt-1">{errors.horas_diarias}</div>}
            </div>
            <div className="col-span-2">
              <Label className="text-sm font-medium text-gray-700 mb-1 block">DESCRIPCIÓN DEL TRABAJO</Label>
              {isEditing ? (
                <Input
                  value={formData.descripcion_trabajo || ""}
                  onChange={(e) => handleInputChange("descripcion_trabajo", e.target.value)}
                  className={`w-full ${formData.trabajo === "No" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  disabled={formData.trabajo === "No"}
                />
              ) : (
                <div className="text-blue-600 font-medium">{formData.descripcion_trabajo}</div>
              )}
              {errors.descripcion_trabajo && <div className="text-red-500 text-xs mt-1">{errors.descripcion_trabajo}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">PERSONAS A CARGO</Label>
              {isEditing ? (
                <select
                  value={formData.personas_cargo}
                  onChange={(e) => handleInputChange('personas_cargo', e.target.value)}
                  className="w-full p-2 border rounded-md bg-white text-gray-900 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                </select>
              ) : (
                <div className="text-blue-600 font-medium">{formData.personas_cargo}</div>
              )}
              {errors.personas_cargo && <div className="text-red-500 text-xs mt-1">{errors.personas_cargo}</div>}
            </div>
          </div>
        );
      case "documentacion":
        return (
          <div className="text-gray-500 text-center py-8 col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Documentos del Aspirante</h3>
            {/* Inputs ocultos para subir archivos */}
            {Object.keys(fileStates).map(docType => (
              <input key={docType} ref={setInputRef(docType)} type="file" accept="image/*"
                onChange={(e) => handleFileInputChange(e, docType)}
                className="hidden"
              />
            ))}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6`}>
              {/* DNI Frente */}
              <div className="space-y-3">
                <h4 className="text-md font-medium text-gray-700">DNI - Frente</h4>
                <div className="relative group">
                  {formData.documentos?.dniFrenteUrl ? (
                    <img
                      src={abs(formData.documentos.dniFrenteUrl) || '/placeholder.svg'}
                      alt="DNI Frente"
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => !isEditing && formData.documentos?.dniFrenteUrl && handleViewImage(abs(formData.documentos.dniFrenteUrl))}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Camera className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">No hay imagen disponible</p>
                      </div>
                    </div>
                  )}

                  {/* Mostrar nombre del archivo si existe */}
                  {formData.documentos?.dniFrenteUrl && (
                    <p className="text-sm text-gray-700 truncate mt-1">
                      {formData.documentos.dniFrenteUrl.split('/').pop()}
                    </p>
                  )}

                  {/* Overlay para modo edición */}
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                      <Button
                        onClick={() => triggerFileInput("dniFrente")}
                        disabled={isUploadingImage === "dniFrente"}
                        className="bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2"
                      >
                        {isUploadingImage === "dniFrente" ? (
                          <>
                            <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                            Subiendo...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            {formData.documentos?.dniFrenteUrl ? "Cambiar imagen" : "Subir imagen"}
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Overlay para modo vista */}
                  {!isEditing && formData.documentos?.dniFrenteUrl && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button
                        onClick={() => handleViewImage(abs(formData.documentos.dniFrenteUrl))}
                        className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {isEditing ? (
                    <Button
                      onClick={() => triggerFileInput("dniFrente")}
                      disabled={isUploadingImage === "dniFrente"}
                      className="flex-1 text-sm bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {isUploadingImage === "dniFrente"
                        ? "Subiendo..."
                        : formData.documentos?.dniFrenteUrl
                          ? "Cambiar"
                          : "Subir"}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => window.open(abs(formData.documentos.dniFrenteUrl), "_blank")}
                      variant="outline"
                      className="flex-1 text-sm"
                      disabled={!formData.documentos?.dniFrenteUrl}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver
                    </Button>
                  )}
                </div>
              </div>

              {/* DNI Dorso */}
              <div className="space-y-3">
                <h4 className="text-md font-medium text-gray-700">DNI - Dorso</h4>
                <div className="relative group">
                  {formData.documentos?.dniDorsoUrl ? (
                    <img
                      src={abs(formData.documentos.dniDorsoUrl) || '/placeholder.svg'}
                      alt="DNI Dorso"
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => !isEditing && formData.documentos?.dniDorsoUrl && handleViewImage(abs(formData.documentos.dniDorsoUrl))}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Camera className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">No hay imagen disponible</p>
                      </div>
                    </div>
                  )}

                  {formData.documentos?.dniDorsoUrl && (
                    <p className="text-sm text-gray-700 truncate">
                      {formData.documentos.dniDorsoUrl.split('/').pop()}
                    </p>
                  )}

                  {/* Overlay para modo edición */}
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                      <Button
                        onClick={() => triggerFileInput("dniDorso")}
                        disabled={isUploadingImage === "dniDorso"}
                        className="bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2"
                      >
                        {isUploadingImage === "dniDorso" ? (
                          <>
                            <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                            Subiendo...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            {formData.documentos?.dniDorsoUrl ? "Cambiar imagen" : "Subir imagen"}
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Overlay para modo vista */}
                  {!isEditing && formData.documentos?.dniDorsoUrl && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button
                        onClick={() => handleViewImage(abs(formData.documentos.dniDorsoUrl))}
                        className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {isEditing ? (
                    <Button
                      onClick={() => triggerFileInput("dniDorso")}
                      disabled={isUploadingImage === "dniDorso"}
                      className="flex-1 text-sm bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {isUploadingImage === "dniDorso"
                        ? "Subiendo..."
                        : formData.documentos?.dniDorsoUrl
                          ? "Cambiar"
                          : "Subir"}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => window.open(abs(formData.documentos.dniDorsoUrl), "_blank")}
                      variant="outline"
                      className="flex-1 text-sm"
                      disabled={!formData.documentos?.dniDorsoUrl}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver
                    </Button>

                  )}
                </div>
              </div>
                {/* CUS */}
            <div className="space-y-3">
              <h4 className="text-md font-medium text-gray-700">CUS</h4>
                  <div className="relative group">
                    {formData.documentos?.cusUrl ? (
                      <img
                        src={abs(formData.documentos.cusUrl)}
                        alt="CUS"
                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handleViewImage(abs(formData.documentos.cusUrl))}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <Camera className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">No hay imagen disponible</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {formData.documentos?.cusUrl && (
                    <p className="text-sm text-gray-700 truncate mt-1">
                      {formData.documentos.cusUrl.split('/').pop()}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => window.open(abs(formData.documentos.cusUrl), "_blank")}
                      variant="outline"
                      className="flex-1 text-sm"
                      disabled={!formData.documentos?.cusUrl}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver
                    </Button>
                    {isEditing && (
                      <Button
                        onClick={() => triggerFileInput("cus")}
                        className="flex-1 text-sm bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {formData.documentos?.cusUrl ? "Cambiar" : "Subir"}
                      </Button>
                    )}
                  </div>
            </div>
                {/* FOTO CARNET */}
                <div className="space-y-3">
              <h4 className="text-md font-medium text-gray-700">Foto carnet 4x4</h4>
                  <div className="relative group">
                    {formData.documentos?.foto_carnetUrl ? (
                      <img
                        src={abs(formData.documentos.foto_carnetUrl)}
                        alt="Foto Carnet"
                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handleViewImage(abs(formData.documentos.foto_carnetUrl))}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <Camera className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">No hay imagen disponible</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {formData.documentos?.foto_carnetUrl && (
                    <p className="text-sm text-gray-700 truncate mt-1">
                      {formData.documentos.foto_carnetUrl.split('/').pop()}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => window.open(abs(formData.documentos.foto_carnetUrl), "_blank")}
                      variant="outline"
                      className="flex-1 text-sm"
                      disabled={!formData.documentos?.foto_carnetUrl}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver
                    </Button>
                    {isEditing && (
                      <Button
                        onClick={() => triggerFileInput("foto_carnet")}
                        className="flex-1 text-sm bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {formData.documentos?.foto_carnetUrl ? "Cambiar" : "Subir"}
                      </Button>
                    )}
                  </div>
            </div>
                {/* ISA */}
                <div className="space-y-3">
              <h4 className="text-md font-medium text-gray-700">ISA</h4>
                  <div className="relative group">
                    {formData.documentos?.isaUrl ? (
                      <img
                        src={abs(formData.documentos.isaUrl)}
                        alt="ISA"
                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handleViewImage(abs(formData.documentos.isaUrl))}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <Camera className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">No hay imagen disponible</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {formData.documentos?.isaUrl && (
                    <p className="text-sm text-gray-700 truncate mt-1">
                      {formData.documentos.isaUrl.split('/').pop()}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => window.open(abs(formData.documentos.isaUrl), "_blank")}
                      variant="outline"
                      className="flex-1 text-sm"
                      disabled={!formData.documentos?.isaUrl}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver
                    </Button>
                    {isEditing && (
                      <Button
                        onClick={() => triggerFileInput("isa")}
                        className="flex-1 text-sm bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {formData.documentos?.isaUrl ? "Cambiar" : "Subir"}
                      </Button>
                    )}
                  </div>
            </div>
                {/* PARTIDA DE NACIMIENTO */}
                <div className="space-y-3">
              <h4 className="text-md font-medium text-gray-700">Partida de nacimiento</h4>
                  <div className="relative group">
                    {formData.documentos?.partida_nacimientoUrl ? (
                      <img
                        src={abs(formData.documentos.partida_nacimientoUrl)}
                        alt="Partida de nacimiento"
                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handleViewImage(abs(formData.documentos.partida_nacimientoUrl))}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <Camera className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">No hay imagen disponible</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {formData.documentos?.partida_nacimientoUrl && (
                    <p className="text-sm text-gray-700 truncate mt-1">
                      {formData.documentos.partida_nacimientoUrl.split('/').pop()}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => window.open(abs(formData.documentos.partida_nacimientoUrl), "_blank")}
                      variant="outline"
                      className="flex-1 text-sm"
                      disabled={!formData.documentos?.partida_nacimientoUrl}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver
                    </Button>
                    {isEditing && (
                      <Button
                        onClick={() => triggerFileInput("partida_nacimiento")}
                        className="flex-1 text-sm bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {formData.documentos?.partida_nacimientoUrl ? "Cambiar" : "Subir"}
                      </Button>
                    )}
                  </div>
            </div>
                {/* ANALÍTICO SECUNDARIO */}
                <div className="space-y-3">
              <h4 className="text-md font-medium text-gray-700">Analítico Secundario</h4>
                  <div className="relative group">
                    {formData.documentos?.analiticoUrl ? (
                      <img
                        src={abs(formData.documentos.analiticoUrl)}
                        alt="Analítico Secundario"
                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handleViewImage(abs(formData.documentos.analiticoUrl))}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <Camera className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">No hay imagen disponible</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {formData.documentos?.analiticoUrl && (
                    <p className="text-sm text-gray-700 truncate mt-1">
                      {formData.documentos.analiticoUrl.split('/').pop()}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => window.open(abs(formData.documentos.analiticoUrl), "_blank")}
                      variant="outline"
                      className="flex-1 text-sm"
                      disabled={!formData.documentos?.analiticoUrl}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver
                    </Button>
                    {isEditing && (
                      <Button
                        onClick={() => triggerFileInput("analitico")}
                        className="flex-1 text-sm bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {formData.documentos?.analiticoUrl ? "Cambiar" : "Subir"}
                      </Button>
                    )}
                  </div>
            </div>
                {/* CERTIFICADO DE GRUPO SANGUÍNEO */}
                <div className="space-y-3">
              <h4 className="text-md font-medium text-gray-700">Certificado de grupo sanguíneo</h4>
                  <div className="relative group">
                    {formData.documentos?.grupo_sanguineoUrl ? (
                      <img
                        src={abs(formData.documentos.grupo_sanguineoUrl)}
                        alt="Grupo Sanguíneo"
                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handleViewImage(abs(formData.documentos.grupo_sanguineoUrl))}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <Camera className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">No hay imagen disponible</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {formData.documentos?.grupo_sanguineoUrl && (
                    <p className="text-sm text-gray-700 truncate mt-1">
                      {formData.documentos.grupo_sanguineoUrl.split('/').pop()}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => window.open(abs(formData.documentos.grupo_sanguineoUrl), "_blank")}
                      variant="outline"
                      className="flex-1 text-sm"
                      disabled={!formData.documentos?.grupo_sanguineoUrl}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver
                    </Button>
                    {isEditing && (
                      <Button
                        onClick={() => triggerFileInput("grupo_sanguineo")}
                        className="flex-1 text-sm bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {formData.documentos?.grupo_sanguineoUrl ? "Cambiar" : "Subir"}
                      </Button>
                    )}
                  </div>
            </div>
                {/* CUD */}
                <div className="space-y-3">
              <h4 className="text-md font-medium text-gray-700">CUD</h4>
                  <div className="relative group">
                    {formData.documentos?.cudUrl ? (
                      <img
                        src={abs(formData.documentos.cudUrl)}
                        alt="CUD"
                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handleViewImage(abs(formData.documentos.cudUrl))}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <Camera className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">No hay imagen disponible</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {formData.documentos?.cudUrl && (
                    <p className="text-sm text-gray-700 truncate mt-1">
                      {formData.documentos.cudUrl.split('/').pop()}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => window.open(abs(formData.documentos.cudUrl), "_blank")}
                      variant="outline"
                      className="flex-1 text-sm"
                      disabled={!formData.documentos?.cudUrl}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver
                    </Button>
                    {isEditing && (
                      <Button
                        onClick={() => triggerFileInput("cud")}
                        className="flex-1 text-sm bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {formData.documentos?.cudUrl ? "Cambiar" : "Subir"}
                      </Button>
                    )}
                  </div>
            </div>
                {/* EMMAC */}
                <div className="space-y-3">
                  <h4 className="text-md font-medium text-gray-700">EMMAC</h4>
                  <div className="relative group">
                    {formData.documentos?.emmacUrl ? (
                      <img
                        src={abs(formData.documentos.emmacUrl)}
                        alt="EMMAC"
                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handleViewImage(abs(formData.documentos.emmacUrl))}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <Camera className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">No hay imagen disponible</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {formData.documentos?.emmacUrl && (
                    <p className="text-sm text-gray-700 truncate mt-1">
                      {formData.documentos.emmacUrl.split('/').pop()}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => window.open(abs(formData.documentos.emmacUrl), "_blank")}
                      variant="outline"
                      className="flex-1 text-sm"
                      disabled={!formData.documentos?.emmacUrl}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver
                    </Button>
                  </div>
                </div>
              </div>
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
                {isEditing ? (
                  <Button
                    onClick={handleSave}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    GUARDAR
                  </Button>
                ) : (
                 <>
                   <Button
                     onClick={handleEdit}
                     className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                   >
                     <Edit className="w-4 h-4" />
                     EDITAR
                   </Button>
		   <Button
                    onClick={handleGeneratePDF}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    GENERAR PDF
                  </Button>
                 </>
                )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
