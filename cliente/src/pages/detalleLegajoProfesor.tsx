"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button, buttonVariants } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { ArrowLeft, User, Save, Edit, Eye, X, Camera, Upload, BookOpen, Trash2, Building2, Clock, Calendar, FileText } from "lucide-react"
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import jsPDF from "jspdf";
const API_BASE = import.meta.env.VITE_API_BASE_URL;
const abs = (u?: string | null) => (u ? (u.startsWith('http') || u.startsWith('blob:') ? u : `${API_BASE}/${u.startsWith('/') ? u.substring(1) : u}`) : '');

// Datos de ejemplo del aspirante


const tabs = [
  { id: "datos", label: "Datos personales" },
  { id: "estudios", label: "Estudios" },
  { id: "laboral", label: "Situación laboral y responsabilidades" },
  { id: "documentacion", label: "Documentación" },
  { id: "cursos", label: "Cursos" },
]

export default function DetalleLegajoProfesor() {
  const navigate = useNavigate();
  const { id } = useParams();
   const location = useLocation();

  const [activeTab, setActiveTab] = useState("datos")
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true);
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
    completo_nivel_medio: '',
    anio_ingreso_medio: '',
    anio_egreso_medio: '',
    provincia_medio: '',
    titulo_medio: '',
    completo_nivel_superior: '',
    carrera_superior: '',
    institucion_superior: '',
    provincia_superior: '',
    anio_ingreso_superior: '',
    anio_egreso_superior: '',
    trabajo: '',
    horas_diarias: '',
    descripcion_trabajo: '',
    personas_cargo: '',
    documentos: {
      dniFrenteUrl: '',
      dniDorsoUrl: '',
      titulo_secundarioUrl: '',
      titulo_terciarioUrl: '',
      examen_psicofisicoUrl: '',
      regimen_de_compatibilidadUrl: '',
    },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  
  // Estados para almacenar los archivos (File objects)
  const [dniFrenteFile, setDniFrenteFile] = useState<File | null>(null);
  const [dniDorsoFile, setDniDorsoFile] = useState<File | null>(null);
  const [tituloSecundarioFile, setTituloSecundarioFile] = useState<File | null>(null);
  const [tituloTerciarioFile, setTituloTerciarioFile] = useState<File | null>(null);
  const [examenPsicofisicoFile, setExamenPsicofisicoFile] = useState<File | null>(null);
  const [regimenCompatibilidadFile, setRegimenCompatibilidadFile] = useState<File | null>(null);
  
  // Estados para cursos
  const [cursos, setCursos] = useState<Array<{
    id: number | string; // Puede ser número (de la BD) o string (nuevo)
    nombre: string;
    certificadoUrl: string;
    certificadoFile: File | null;
  }>>([]);
  
  const dniFrenteInputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
  const dniDorsoInputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
  const tituloSecundarioInputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
  const tituloTerciarioInputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
  const examenPsicofisicoInputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
  const regimenCompatibilidadInputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

  // Mapeo de setters para los archivos
  const fileSetters: Record<string, React.Dispatch<React.SetStateAction<File | null>>> = {
    dniFrente: setDniFrenteFile,
    dniDorso: setDniDorsoFile,
    titulo_secundario: setTituloSecundarioFile,
    titulo_terciario: setTituloTerciarioFile,
    examen_psicofisico: setExamenPsicofisicoFile,
    regimen_de_compatibilidad: setRegimenCompatibilidadFile,
  };

  // Generalizado para todos los tipos de documentos
  const fileInputRefs: Record<string, React.RefObject<HTMLInputElement>> = {
    dniFrente: dniFrenteInputRef,
    dniDorso: dniDorsoInputRef,
    titulo_secundario: tituloSecundarioInputRef,
    titulo_terciario: tituloTerciarioInputRef,
    examen_psicofisico: examenPsicofisicoInputRef,
    regimen_de_compatibilidad: regimenCompatibilidadInputRef,
  };

  useEffect(() => {
    const fetchDocente = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE}/docente/${id}`);
        if (!response.ok) {
          throw new Error('No se pudo cargar el legajo del profesor.');
        }
        const data = await response.json();

        // Transformar los datos booleanos a strings para la UI
        const transformedData = {
          ...data,
          completo_nivel_medio: data.completo_nivel_medio ? 'Sí' : 'No',
          // El backend guarda 'true'/'false' como strings. Los convertimos a 'Sí'/'No'.
          completo_nivel_superior: data.completo_nivel_superior === 'true' ? 'Sí'
            : data.completo_nivel_superior === 'false' ? 'No'
            : data.completo_nivel_superior, // Mantiene 'En curso' si es el caso
          trabajo: data.trabajo === 'true' ? 'Sí' : 'No',
          personas_cargo: data.personas_cargo === 'true' ? 'Sí' : 'No',
        };

        // Mapear los datos del backend al estado del formulario
        setFormData({ ...transformedData, documentos: data.documentos || {} });

        // Mapear los cursos del backend al estado de cursos del frontend
        if (data.cursos) {
          const cursosMapeados = data.cursos.map((curso: any) => ({
            id: curso.id,
            nombre: curso.nombre,
            certificadoUrl: curso.certificado_url || '', // La URL completa ya viene de Cloudinary
            certificadoFile: null, // No tenemos el archivo al cargar
          }));
          setCursos(cursosMapeados);
        }

      } catch (error) {
        console.error(error);
        alert('Error al cargar los datos del profesor.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocente();
  }, [id]);

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


  const handleBack = () => {
      // Si existe un "from", vuelve ahí. Si no, vuelve a aspirantes por defecto
      navigate("/legajo");
    }
  
  const handleSave = async () => {
    // Validar todas las pestañas antes de enviar
    const isStep1Valid = validate(formData, 1);
    const isStep2Valid = validate(formData, 2);
    const isStep3Valid = validate(formData, 3);

    if (!isStep1Valid || !isStep2Valid || !isStep3Valid) {
      alert("Por favor, completa todos los campos obligatorios en todas las pestañas antes de guardar.");
      return;
    }

    const payload = new FormData();

    // Agregar datos del formulario al payload
    Object.keys(formData).forEach(key => {
      if (key !== 'documentos' && key !== 'cursos' && key !== 'id' && key !== 'activo' && formData[key] !== null && formData[key] !== '') {
        let value = formData[key];
        if (['completo_nivel_medio', 'completo_nivel_superior', 'trabajo', 'personas_cargo'].includes(key)) {
            value = value === 'Sí' ? 'true' : (value === 'No' ? 'false' : value);
        }
        payload.append(key, value);
      }
    });

    // Adjuntar archivos de documentos
    if (dniFrenteFile) payload.append('dniFrente', dniFrenteFile);
    if (dniDorsoFile) payload.append('dniDorso', dniDorsoFile);
    if (tituloSecundarioFile) payload.append('titulo_secundario', tituloSecundarioFile);
    if (tituloTerciarioFile) payload.append('titulo_terciario', tituloTerciarioFile);
    if (examenPsicofisicoFile) payload.append('examen_psicofisico', examenPsicofisicoFile);
    if (regimenCompatibilidadFile) payload.append('regimen_de_compatibilidad', regimenCompatibilidadFile);

    // Adjuntar cursos y sus certificados
    cursos.forEach((curso, index) => {
      // Enviamos todos los cursos, nuevos y existentes
      payload.append('cursos[]', JSON.stringify({ id: curso.id, nombre: curso.nombre }));
      if (curso.certificadoFile) {
        payload.append(`cursos[${index}][certificadoFile]`, curso.certificadoFile);
      }
    });

    try {
      const response = await fetch(`${API_BASE}/docente/${id}/update`, {
        method: 'PATCH',
        body: payload,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message;
        throw new Error(errorMessage || 'Error al actualizar el legajo del profesor.');
      }

      alert('Legajo del profesor actualizado con éxito.');
      setIsEditing(false);
      // Opcional: Recargar los datos para mostrar la información actualizada
      // fetchDocente(); 
    } catch (error: any) {
      console.error('Error en la actualización del legajo:', error);
      alert(`Hubo un problema al actualizar el legajo: ${error.message}`);
    }
  };
  
  const handleGeneratePDF = async () => {
    try {
      const pdf = new jsPDF()

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

      let yPosition = 20 

      const printDate = new Date().toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      pdf.setFontSize(9)
      pdf.setFont("helvetica", "normal")
      pdf.setTextColor(100, 100, 100)
      pdf.text(`Fecha de impresión: ${printDate}`, 200, yPosition, { align: "right" })
      pdf.setTextColor(0, 0, 0)
      yPosition += 10

      pdf.setFontSize(18)
      pdf.setFont("helvetica", "bold")
      pdf.text(`Legajo del Profesor`, 105, yPosition, { align: "center" })
      yPosition += 8

      pdf.setFontSize(14)
      pdf.text(`${formData.nombre} ${formData.apellido}`, 105, yPosition, { align: "center" })
      yPosition += 12

      const leftX = 20
      const lineHeight = 6

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
      ]

      personalData.forEach((line) => {
        pdf.text(line, leftX, yPosition)
        yPosition += lineHeight
      })

      yPosition += 5

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

      const documents = [
        { url: formData.documentos?.dniFrenteUrl, title: "DNI - Frente" },
        { url: formData.documentos?.dniDorsoUrl, title: "DNI - Dorso" },
        { url: formData.documentos?.titulo_secundarioUrl, title: "Título Nivel Secundario" },
        { url: formData.documentos?.titulo_terciarioUrl, title: "Título Nivel Terciario/Superior" },
        { url: formData.documentos?.examen_psicofisicoUrl, title: "Examen Psicofísico" },
        { url: formData.documentos?.regimen_de_compatibilidadUrl, title: "Régimen de Compatibilidad" },
      ].filter((doc) => doc.url)

      cursos.forEach((curso) => {
        if (curso.certificadoUrl) {
          documents.push({
            url: curso.certificadoUrl,
            title: `Curso: ${curso.nombre}`,
          })
        }
      })

      if (documents.length > 0) {
        pdf.addPage()
        yPosition = 20

        pdf.setFontSize(12)
        pdf.setFont("helvetica", "bold")
        pdf.text("DOCUMENTACIÓN Y CURSOS", 20, yPosition)
        yPosition += 10

        for (let i = 0; i < documents.length; i += 2) {
          const doc1 = documents[i]
          const doc2 = documents[i + 1]

          if (i > 0) {
            pdf.addPage()
            yPosition = 20
          }

          const fullUrl1 = abs(doc1.url)
          const base64_1 = await getImageBase64(fullUrl1)

          if (base64_1) {
            pdf.setFontSize(11)
            pdf.setFont("helvetica", "bold")
            pdf.text(doc1.title, 20, yPosition)
            yPosition += 7

            const imgWidth = 170
            const imgHeight = 110
            pdf.addImage(base64_1, "JPEG", 20, yPosition, imgWidth, imgHeight)
            yPosition += imgHeight + 15
          }

          if (doc2) {
            const fullUrl2 = abs(doc2.url)
            const base64_2 = await getImageBase64(fullUrl2)

            if (base64_2) {
              pdf.setFontSize(11)
              pdf.setFont("helvetica", "bold")
              pdf.text(doc2.title, 20, yPosition)
              yPosition += 7

              const imgWidth = 170
              const imgHeight = 110
              pdf.addImage(base64_2, "JPEG", 20, yPosition, imgWidth, imgHeight)
            }
          }
        }
      }

      pdf.save(`Legajo_Profesor_${formData.apellido}_${formData.nombre}_${formData.dni}.pdf`)

      console.log("[v0] PDF Generado correctamente")
    } catch (error: any) {
      console.error("[v0] Error generando PDF:", error)
      alert(`Hubo un error al generar el PDF: ${error.message}`)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleViewImage = (imageUrl: string | null) => {
    if (imageUrl) {
      setSelectedImage(imageUrl)
    }
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    documentType: string,
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      // Guardar el objeto File en su estado
      const setter = fileSetters[documentType];
      if (setter) setter(file);

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

  const triggerFileInput = (documentType: string) => fileInputRefs[documentType]?.current?.click();

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
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Documentos del Profesor</h3>
            {/* Inputs ocultos para subir archivos */}
            <input ref={dniFrenteInputRef} type="file" accept="image/*" onChange={e => handleFileInputChange(e, "dniFrente")} className="hidden" />
            <input ref={dniDorsoInputRef} type="file" accept="image/*" onChange={e => handleFileInputChange(e, "dniDorso")} className="hidden" />
            <input ref={tituloSecundarioInputRef} type="file" accept="image/*,application/pdf" onChange={e => handleFileInputChange(e, "titulo_secundario")} className="hidden" />
            <input ref={tituloTerciarioInputRef} type="file" accept="image/*,application/pdf" onChange={e => handleFileInputChange(e, "titulo_terciario")} className="hidden" />
            <input ref={examenPsicofisicoInputRef} type="file" accept="image/*,application/pdf" onChange={e => handleFileInputChange(e, "examen_psicofisico")} className="hidden" />
            <input ref={regimenCompatibilidadInputRef} type="file" accept="image/*,application/pdf" onChange={e => handleFileInputChange(e, "regimen_de_compatibilidad")} className="hidden" />
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6`}>
              {Object.keys(fileInputRefs).map((docType) => {
                const docUrl = formData.documentos?.[`${docType}Url`];
                const docFile = 
                  docType === 'dniFrente' ? dniFrenteFile :
                  docType === 'dniDorso' ? dniDorsoFile :
                  docType === 'titulo_secundario' ? tituloSecundarioFile :
                  docType === 'titulo_terciario' ? tituloTerciarioFile :
                  docType === 'regimen_de_compatibilidad' ? regimenCompatibilidadFile :
                  examenPsicofisicoFile;


                const docTitle = 
                  docType === 'dniFrente' ? 'DNI - Frente' :
                  docType === 'dniDorso' ? 'DNI - Dorso' :
                  docType === 'titulo_secundario' ? 'Título Nivel Secundario' :
                  docType === 'titulo_terciario' ? 'Título Nivel Terciario/Superior' :
                  docType === 'regimen_de_compatibilidad' ? 'Régimen de Compatibilidad' :
                  'Examen Psicofísico';

                return (
                  <div key={docType} className="space-y-3">
                    <h4 className="text-md font-medium text-gray-700">{docTitle}</h4>
                    <div className="relative group">
                      {docUrl ? (
                        <>
                          <img
                            src={abs(docUrl)} // Usar abs para construir la URL
                            alt={docTitle}
                            className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => !isEditing && docUrl && handleViewImage(abs(docUrl))}
                          />
                          {/* Overlay para modo vista */}
                          {!isEditing && (
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <Button
                                variant="outline"
                                onClick={() => handleViewImage(abs(docUrl))}
                                className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </>
                      ) : (
                        // Placeholder si no hay imagen
                        <div className="w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <Camera className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm">No hay imagen disponible</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {docFile && (
                      <div className="text-sm text-gray-600 truncate mt-1" title={docFile.name}>
                        {docFile.name}
                      </div>
                    )}

                    <div className="flex gap-2">
                      {!isEditing ? (
                        <Button
                          onClick={() => docUrl && window.open(abs(docUrl), "_blank")}
                          variant="outline"
                          className="flex-1 text-sm"
                          disabled={!docUrl}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Button>
                      ) : (
                        <Button onClick={() => triggerFileInput(docType)} className="flex-1 text-sm bg-blue-500 hover:bg-blue-600 text-white">
                          <Upload className="w-4 h-4 mr-2" />
                          {docUrl ? "Cambiar" : "Subir"}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          );
      case "cursos":
        return (
          <div className="text-gray-500 text-center py-8 col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Cursos del Profesor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cursos existentes con formato igual a documentación */}
              {cursos.map((curso) => (
                <div key={curso.id} className="space-y-3">
                  {/* Input editable para el nombre del curso en modo edición, texto en modo vista */}
                  {isEditing ? (
                    <Input
                      value={curso.nombre}
                      onChange={(e) => {
                        const newCursos = [...cursos];
                        const cursoIndex = newCursos.findIndex(c => c.id === curso.id);
                        if (cursoIndex !== -1) {
                          newCursos[cursoIndex].nombre = e.target.value;
                          setCursos(newCursos);
                        }
                      }}
                      className="text-md font-medium text-gray-700"
                      placeholder="Nombre del curso"
                    />
                  ) : (
                    <h4 className="text-md font-medium text-gray-700">{curso.nombre}</h4>
                  )}
                  
                  {/* Imagen/placeholder - igual que documentación */}
                  <div className="relative group">
                    {curso.certificadoUrl ? (
                      <img
                        src={abs(curso.certificadoUrl)}
                        alt={curso.nombre}
                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => !isEditing && handleViewImage(abs(curso.certificadoUrl))}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <Camera className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">No hay imagen disponible</p>
                        </div>
                      </div>
                    )}

                    {/* Overlay para modo edición */}
                    {isEditing && (
                      <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*,application/pdf';
                            input.onchange = (e: any) => {
                              const file = e.target.files?.[0] || null;
                              if (file) {
                                const newCursos = [...cursos];
                                const cursoIndex = newCursos.findIndex(c => c.id === curso.id);
                                if (cursoIndex !== -1) {
                                  newCursos[cursoIndex].certificadoFile = file;
                                  newCursos[cursoIndex].certificadoUrl = URL.createObjectURL(file);
                                  setCursos(newCursos);
                                }
                              }
                            };
                            input.click();
                          }}
                          className="bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          {curso.certificadoUrl ? "Cambiar imagen" : "Subir imagen"}
                        </Button>
                      </div>
                    )}

                    {/* Overlay para modo vista */}
                    {!isEditing && curso.certificadoUrl && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Button variant="outline"
                          onClick={() => handleViewImage(abs(curso.certificadoUrl))}
                          className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Nombre del archivo si existe */}
                  {curso.certificadoFile && (
                    <div className="text-sm text-gray-600 truncate mt-1" title={curso.certificadoFile.name}>
                      {curso.certificadoFile.name}
                    </div>
                  )}

                  {/* Botones según el modo */}
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*,application/pdf';
                            input.onchange = (e: any) => {
                              const file = e.target.files?.[0] || null;
                              if (file) {
                                const newCursos = [...cursos];
                                const cursoIndex = newCursos.findIndex(c => c.id === curso.id);
                                if (cursoIndex !== -1) {
                                  newCursos[cursoIndex].certificadoFile = file;
                                  newCursos[cursoIndex].certificadoUrl = URL.createObjectURL(file);
                                  setCursos(newCursos);
                                }
                              }
                            };
                            input.click();
                          }}
                          className="flex-1 text-sm bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {curso.certificadoUrl ? "Cambiar" : "Subir"}
                        </Button>
                        <Button
                          onClick={() => {
                            const newCursos = cursos.filter(c => c.id !== curso.id);
                            setCursos(newCursos);
                          }}
                          className="text-sm bg-red-500 hover:bg-red-600 text-white px-3"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => curso.certificadoUrl && window.open(abs(curso.certificadoUrl), "_blank")}
                        variant="outline"
                        className="flex-1 text-sm"
                        disabled={!curso.certificadoUrl}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Card para agregar nuevo curso - solo en modo edición */}
              {isEditing && (
                <div className="space-y-3 border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-700">Agregar Nuevo Curso</h4>
                  <div className="w-full h-48 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <BookOpen className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Nuevo curso</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        const nuevoCurso = {
                          id: Date.now().toString(),
                          nombre: '',
                          certificadoUrl: '',
                          certificadoFile: null,
                        };
                        setCursos([...cursos, nuevoCurso]);
                      }}
                      className="flex-1 text-sm bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Agregar Curso
                    </Button>
                  </div>
                </div>
              )}
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
              <p className="text-gray-600 text-sm">PROFESOR</p>
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
