"use client"
import { ProtectedRoute } from "../components/protected-route"
import { RolUsuario } from "../lib/types"
import { useState, useEffect, useRef } from "react"
import {CustomDialog} from "../components/ui/customDialog"
import { Card } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { ArrowLeft, User, Save, Edit, Eye, X, Camera, Upload } from "lucide-react"
import { useParams, useNavigate, useLocation } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_BASE_URL;
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

export default function CrearLegajoAlumno() {
  // Estado y carga de carreras desde backend
  const [carreras, setCarreras] = useState<Array<{ id: number, nombre: string }>>([]);
  const [loadingCarreras, setLoadingCarreras] = useState(false);
  const [errorCarreras, setErrorCarreras] = useState<string | null>(null);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const [dialogProps, setDialogProps] = useState<{
    title?: string
    description?: string
    variant?: "info" | "error" | "success" | "confirm"
    onConfirm?: (() => void) | undefined
    onCancel?: (() => void) | undefined
    confirmText?: string
    cancelText?: string
  }>({})

  // Generar años para el selector de ciclo lectivo
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - i); // Genera años desde el actual hasta 10 años atrás

  useEffect(() => {
    setLoadingCarreras(true);
    fetch(`${import.meta.env.VITE_API_BASE_URL}/carrera`)
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener carreras');
        return res.json();
      })
      .then(data => {
        setCarreras(data);
        setLoadingCarreras(false);
      })
      .catch(err => {
        setErrorCarreras('Error al cargar carreras');
        setLoadingCarreras(false);
      });
  }, []);
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("datos");
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
    ciclo_lectivo: '', // <-- AÑADIR CAMPO AL ESTADO
    estado_preinscripcion: '',
    estado_matriculacion: '',
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
      cusUrl: '',
      foto_carnetUrl: '',
      isaUrl: '',
      partida_nacimientoUrl: '',
      analiticoUrl: '',
      grupo_sanguineoUrl: '',
      cudUrl: '',
      emmacUrl: '',
    },
  });
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dniFrenteInputRef = useRef<HTMLInputElement>(null);
  const dniDorsoInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState<"dniFrente" | "dniDorso" | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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
      // NUEVA VALIDACIÓN
      if (!data.ciclo_lectivo) {
        newErrors.ciclo_lectivo = "El ciclo lectivo es requerido";
      } // La validación de formato ya no es necesaria con un select
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

  // No cargar datos, es solo alta

  // formData siempre está inicializado



  const handleBack = () => {
    navigate("/legajo");
  }
  
  const handleCreate = async () => {
    // Validar todas las pestañas antes de enviar
    const isStep1Valid = validate(formData, 1);
    const isStep2Valid = validate(formData, 2);
    const isStep3Valid = validate(formData, 3);

    if (!isStep1Valid || !isStep2Valid || !isStep3Valid) {
      setDialogProps({
      title: "Errores de validación",
      description: "Por favor, complete todos los campos requeridos.",
      variant: "error",
      confirmText: "Entendido",
    })
    setIsLogoutDialogOpen(true)
      return;
    }

    const payload = new FormData();

    // Mapear y agregar datos del formulario
    const carreraSeleccionada = carreras.find(c => c.nombre === formData.carrera);
    if (carreraSeleccionada) {
      payload.append('carrera_id', carreraSeleccionada.id.toString());
    }

    Object.keys(formData).forEach(key => {
      if (key !== 'documentos' && key !== 'carrera' && formData[key] !== null && formData[key] !== '') {
        let value = formData[key];
        if (typeof value === 'boolean') {
          value = value.toString();
        }
        // Mapeo de valores de selects a lo que espera el backend si es necesario
        if (key === 'completo_nivel_medio' || key === 'completo_nivel_superior' || key === 'trabajo' || key === 'personas_cargo') {
            value = value === 'Sí' ? 'true' : (value === 'No' ? 'false' : value);
        }
        // Asegurarnos de que el ciclo_lectivo se envíe como número si es posible
        if (key === 'ciclo_lectivo') {
          payload.append(key, Number(value).toString());
        } else {
          payload.append(key, value);
        }
      }
    });

    // Añadir estados por defecto para el flujo de creación integral
    payload.append('estado_preinscripcion', 'confirmado');
    payload.append('estado_matriculacion', 'confirmado');

    // Adjuntar todos los archivos
    if (dniFrenteFile) payload.append('dniFrente', dniFrenteFile);
    if (dniDorsoFile) payload.append('dniDorso', dniDorsoFile);
    if (cusFile) payload.append('cus', cusFile);
    if (fotoCarnetFile) payload.append('foto_carnet', fotoCarnetFile);
    if (isaFile) payload.append('isa', isaFile);
    if (partidaNacimientoFile) payload.append('partida_nacimiento', partidaNacimientoFile);
    if (analiticoFile) payload.append('analitico', analiticoFile);
    if (grupoSanguineoFile) payload.append('grupo_sanguineo', grupoSanguineoFile);
    if (cudFile) payload.append('cud', cudFile);
    if (emmacFile) payload.append('emmac', emmacFile);

    try {
      const response = await fetch(`${API_BASE}/legajo-estudiante/crear-alumno-completo`, {
        method: 'POST',
        body: payload,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message;
        throw new Error(errorMessage || 'Error al crear el legajo del alumno.');
      }

      const result = await response.json();
      setDialogProps({
      title: "Legajo creado",
      description: `El legajo del alumno ${result.estudiante.nombre} ${result.estudiante.apellido} se ha creado correctamente.`,
      variant: "success",
      confirmText: "Entendido",
      onConfirm: () => {navigate('/legajo');}
    });
    setIsLogoutDialogOpen(true);
  } catch (error: any) {
    console.error('Error en la creación del legajo:', error);
    setDialogProps({
      title: "Error al crear legajo",
      description: `Hubo un problema al crear el legajo: ${error.message}`,
      variant: "error",
      confirmText: "Entendido",
    });
    setIsLogoutDialogOpen(true);
  }
};



  const handleViewImage = (imageUrl: string | null) => {
    if (imageUrl) {
      setSelectedImage(imageUrl)
    }
  }

  // Generalizado para todos los tipos de documentos
  const fileInputRefs = {
    dniFrente: dniFrenteInputRef,
    dniDorso: dniDorsoInputRef,
    cus: useRef<HTMLInputElement>(null),
    foto_carnet: useRef<HTMLInputElement>(null),
    isa: useRef<HTMLInputElement>(null),
    partida_nacimiento: useRef<HTMLInputElement>(null),
    analitico: useRef<HTMLInputElement>(null),
    grupo_sanguineo: useRef<HTMLInputElement>(null),
    cud: useRef<HTMLInputElement>(null),
    emmac: useRef<HTMLInputElement>(null),
  };

const handleFileInputChange = (
  event: React.ChangeEvent<HTMLInputElement>,
  documentType: string, // Usamos string para que coincida con las keys de fileInputRefs y fileStates
) => {
  const file = event.target.files ? event.target.files[0] : null;
    if (file) {
    // Usar el mapeo para actualizar el estado del archivo correcto
    const fileSetter = fileStates[documentType];
    if (fileSetter) {
      fileSetter(file);
    }

      const previewUrl = URL.createObjectURL(file);
    const urlKey = `${documentType}Url`;

      setFormData((prev: any) => ({
        ...prev,
      documentos: {
        ...prev.documentos,
        [urlKey]: previewUrl,
        [`${documentType}Nombre`]: file.name,
      },
      }));
    }
  };

  const triggerFileInput = (documentType: keyof typeof fileInputRefs) => {
    fileInputRefs[documentType]?.current?.click();
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
    // Validación en tiempo real usando el nuevo estado
    const step =
      activeTab === "datos" ? 1 :
      activeTab === "estudios" ? 2 :
      activeTab === "laboral" ? 3 :
      activeTab === "documentacion" ? 4 : 1;
    validate(newFormData, step);
  }

  const fromAspirantes = location.state?.from === "/aspirantes";
const fromMatriculacion = location.state?.from === "/matriculacion";

  const renderTabContent = () => {
    switch (activeTab) {
      case "datos":
        return (
          <div className="grid grid-cols-2 gap-4">
            {/* ... ya está bien estilizado ... */}
            {/* Código original de "datos" */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">NOMBRE</Label>
    <Input
      value={formData.nombre || ""}
      onChange={(e) => handleInputChange("nombre", e.target.value)}
      className="w-full"
    />
    {errors.nombre && (
      <div className="text-red-500 text-xs mt-1">{errors.nombre}</div>
    )}
  </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">APELLIDO</Label>
              <Input
                value={formData.apellido || ""}
                onChange={(e) => handleInputChange("apellido", e.target.value)}
                className="w-full"
              />
              {errors.apellido && <div className="text-red-500 text-xs mt-1">{errors.apellido}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">SEXO</Label>
              <Input
                value={formData.sexo || ""}
                onChange={(e) => handleInputChange("sexo", e.target.value)}
                className="w-full"
              />
              {errors.sexo && <div className="text-red-500 text-xs mt-1">{errors.sexo}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">DNI</Label>
              <Input
                value={formData.dni || ""}
                onChange={(e) => handleInputChange("dni", e.target.value)}
                className="w-full"
              />
              {errors.dni && <div className="text-red-500 text-xs mt-1">{errors.dni}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">CUIL/CUIT</Label>
              <Input
                value={formData.cuil || ""}
                onChange={(e) => handleInputChange("cuil", e.target.value)}
                className="w-full"
              />
              {errors.cuil && <div className="text-red-500 text-xs mt-1">{errors.cuil}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">DOMICILIO</Label>
              <Input
                value={formData.domicilio || ""}
                onChange={(e) => handleInputChange("domicilio", e.target.value)}
                className="w-full"
              />
              {errors.domicilio && <div className="text-red-500 text-xs mt-1">{errors.domicilio}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">LOCALIDAD</Label>
              <Input
                value={formData.localidad || ""}
                onChange={(e) => handleInputChange("localidad", e.target.value)}
                className="w-full"
              />
              {errors.localidad && <div className="text-red-500 text-xs mt-1">{errors.localidad}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">BARRIO</Label>
              <Input
                value={formData.barrio || ""}
                onChange={(e) => handleInputChange("barrio", e.target.value)}
                className="w-full"
              />
              {errors.barrio && <div className="text-red-500 text-xs mt-1">{errors.barrio}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">CÓDIGO POSTAL</Label>
              <Input
                value={formData.codigo_postal || ""}
                onChange={(e) => handleInputChange("codigo_postal", e.target.value)}
                className="w-full"
              />
              {errors.codigo_postal && <div className="text-red-500 text-xs mt-1">{errors.codigo_postal}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">TELÉFONO</Label>
              <Input
                value={formData.telefono || ""}
                onChange={(e) => handleInputChange("telefono", e.target.value)}
                className="w-full"
              />
              {errors.telefono && <div className="text-red-500 text-xs mt-1">{errors.telefono}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">MAIL</Label>
              <Input
                value={formData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full"
              />
              {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">FECHA DE NACIMIENTO</Label>
              <Input
                type="date"
                value={formData.fecha_nacimiento || ""}
                onChange={(e) => handleInputChange("fecha_nacimiento", e.target.value)}
                className="w-full"
              />
              {errors.fecha_nacimiento && <div className="text-red-500 text-xs mt-1">{errors.fecha_nacimiento}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">CIUDAD DE NACIMIENTO</Label>
              <Input
                value={formData.ciudad_nacimiento || ""}
                onChange={(e) => handleInputChange("ciudad_nacimiento", e.target.value)}
                className="w-full"
              />
              {errors.ciudad_nacimiento && <div className="text-red-500 text-xs mt-1">{errors.ciudad_nacimiento}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">PROVINCIA DE NACIMIENTO</Label>
              <Input
                value={formData.provincia_nacimiento || ""}
                onChange={(e) => handleInputChange("provincia_nacimiento", e.target.value)}
                className="w-full"
              />
              {errors.provincia_nacimiento && <div className="text-red-500 text-xs mt-1">{errors.provincia_nacimiento}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">CARRERA</Label>
              <select
                value={formData.carrera}
                onChange={e => setFormData({ ...formData, carrera: e.target.value })}
                className="w-full p-2 border rounded-md bg-white text-gray-900 focus:ring-teal-500 focus:border-teal-500"
                disabled={loadingCarreras}
              >
                <option value="">{loadingCarreras ? 'Cargando carreras...' : 'Seleccionar carrera'}</option>
                {carreras.map((c) => (
                  <option key={c.id} value={c.nombre}>{c.nombre}</option>
                ))}
              </select>
              {errorCarreras && <div className="text-red-500 text-xs mt-1">{errorCarreras}</div>}
              {errors.carrera && <div className="text-red-500 text-xs mt-1">{errors.carrera}</div>}
            </div>
            {/* NUEVO CAMPO PARA CICLO LECTIVO */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">CICLO LECTIVO</Label>
              <select
                value={formData.ciclo_lectivo}
                onChange={(e) => handleInputChange("ciclo_lectivo", e.target.value)}
                className="w-full p-2 border rounded-md bg-white text-gray-900 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Seleccionar ciclo lectivo</option>
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              {errors.ciclo_lectivo && <div className="text-red-500 text-xs mt-1">{errors.ciclo_lectivo}</div>}
            </div>
          </div>
        );
      case "estudios":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">¿COMPLETÓ NIVEL MEDIO?</Label>
              <select
                value={formData.completo_nivel_medio}
                onChange={(e) => handleInputChange('completo_nivel_medio', e.target.value)}
                className="w-full p-2 border rounded-md bg-white text-gray-900 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Seleccionar</option>
                <option value="Sí">Sí</option>
                <option value="No">No</option>
              </select>
              {errors.completo_nivel_medio && <div className="text-red-500 text-xs mt-1">{errors.completo_nivel_medio}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">AÑO DE INGRESO MEDIO</Label>
              <Input
                value={formData.anio_ingreso_medio || ""}
                onChange={(e) => handleInputChange("anio_ingreso_medio", e.target.value)}
                className={`w-full ${formData.completo_nivel_medio === "No" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                disabled={formData.completo_nivel_medio === "No"}
              />
              {errors.anio_ingreso_medio && <div className="text-red-500 text-xs mt-1">{errors.anio_ingreso_medio}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">AÑO DE EGRESO MEDIO</Label>
              <Input
                value={formData.anio_egreso_medio || ""}
                onChange={(e) => handleInputChange("anio_egreso_medio", e.target.value)}
                className={`w-full ${formData.completo_nivel_medio === "No" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                disabled={formData.completo_nivel_medio === "No"}
              />
              {errors.anio_egreso_medio && <div className="text-red-500 text-xs mt-1">{errors.anio_egreso_medio}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">PROVINCIA (MEDIO)</Label>
              <Input
                value={formData.provincia_medio || ""}
                onChange={(e) => handleInputChange("provincia_medio", e.target.value)}
                className={`w-full ${formData.completo_nivel_medio === "No" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                disabled={formData.completo_nivel_medio === "No"}
              />
              {errors.provincia_medio && <div className="text-red-500 text-xs mt-1">{errors.provincia_medio}</div>}
            </div>
            <div className="col-span-2">
              <Label className="text-sm font-medium text-gray-700 mb-1 block">TÍTULO NIVEL MEDIO</Label>
              <Input
                value={formData.titulo_medio || ""}
                onChange={(e) => handleInputChange("titulo_medio", e.target.value)}
                className={`w-full ${formData.completo_nivel_medio === "No" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                disabled={formData.completo_nivel_medio === "No"}
              />
              {errors.titulo_medio && <div className="text-red-500 text-xs mt-1">{errors.titulo_medio}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">¿COMPLETÓ NIVEL SUPERIOR?</Label>
              <select
                value={formData.completo_nivel_superior}
                onChange={(e) => handleInputChange('completo_nivel_superior', e.target.value)}
                className="w-full p-2 border rounded-md bg-white text-gray-900 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Seleccionar</option>
                <option value="Sí">Sí</option>
                <option value="No">No</option>
                <option value="En curso">En curso</option>
              </select>
              {errors.completo_nivel_superior && <div className="text-red-500 text-xs mt-1">{errors.completo_nivel_superior}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">CARRERA SUPERIOR</Label>
              <Input
                value={formData.carrera_superior || ""}
                onChange={(e) => handleInputChange("carrera_superior", e.target.value)}
                className={`w-full ${formData.completo_nivel_superior === "No" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                disabled={formData.completo_nivel_superior === "No"}
              />
              {errors.carrera_superior && <div className="text-red-500 text-xs mt-1">{errors.carrera_superior}</div>}
            </div>
            <div className="col-span-2">
              <Label className="text-sm font-medium text-gray-700 mb-1 block">INSTITUCIÓN SUPERIOR</Label>
              <Input
                value={formData.institucion_superior || ""}
                onChange={(e) => handleInputChange("institucion_superior", e.target.value)}
                className={`w-full ${formData.completo_nivel_superior === "No" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                disabled={formData.completo_nivel_superior === "No"}
              />
              {errors.institucion_superior && <div className="text-red-500 text-xs mt-1">{errors.institucion_superior}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">PROVINCIA (SUPERIOR)</Label>
              <Input
                value={formData.provincia_superior || ""}
                onChange={(e) => handleInputChange("provincia_superior", e.target.value)}
                className={`w-full ${formData.completo_nivel_superior === "No" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                disabled={formData.completo_nivel_superior === "No"}
              />
              {errors.provincia_superior && <div className="text-red-500 text-xs mt-1">{errors.provincia_superior}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">AÑO DE INGRESO SUPERIOR</Label>
              <Input
                value={formData.anio_ingreso_superior || ""}
                onChange={(e) => handleInputChange("anio_ingreso_superior", e.target.value)}
                className={`w-full ${formData.completo_nivel_superior === "No" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                disabled={formData.completo_nivel_superior === "No"}
              />
              {errors.anio_ingreso_superior && <div className="text-red-500 text-xs mt-1">{errors.anio_ingreso_superior}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">AÑO DE EGRESO SUPERIOR</Label>
              <Input
                value={formData.anio_egreso_superior || ""}
                onChange={(e) => handleInputChange("anio_egreso_superior", e.target.value)}
                className={`w-full ${(formData.completo_nivel_superior === "No" || formData.completo_nivel_superior === "En curso") ? "bg-gray-100 cursor-not-allowed" : ""}`}
                disabled={formData.completo_nivel_superior === "No" || formData.completo_nivel_superior === "En curso"}
              />
              {errors.anio_egreso_superior && <div className="text-red-500 text-xs mt-1">{errors.anio_egreso_superior}</div>}
            </div>
          </div>
        );
      case "laboral":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">¿TRABAJA ACTUALMENTE?</Label>
              <select
                value={formData.trabajo}
                onChange={(e) => handleInputChange('trabajo', e.target.value)}
                className="w-full p-2 border rounded-md bg-white text-gray-900 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Seleccionar</option>
                <option value="Sí">Sí</option>
                <option value="No">No</option>
              </select>
              {errors.trabajo && <div className="text-red-500 text-xs mt-1">{errors.trabajo}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">HORAS DIARIAS</Label>
              <Input
                value={formData.horas_diarias || ""}
                onChange={(e) => handleInputChange("horas_diarias", e.target.value)}
                className={`w-full ${formData.trabajo === "No" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                disabled={formData.trabajo === "No"}
              />
              {errors.horas_diarias && <div className="text-red-500 text-xs mt-1">{errors.horas_diarias}</div>}
            </div>
            <div className="col-span-2">
              <Label className="text-sm font-medium text-gray-700 mb-1 block">DESCRIPCIÓN DEL TRABAJO</Label>
              <Input
                value={formData.descripcion_trabajo || ""}
                onChange={(e) => handleInputChange("descripcion_trabajo", e.target.value)}
                className={`w-full ${formData.trabajo === "No" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                disabled={formData.trabajo === "No"}
              />
              {errors.descripcion_trabajo && <div className="text-red-500 text-xs mt-1">{errors.descripcion_trabajo}</div>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">PERSONAS A CARGO</Label>
              <select
                value={formData.personas_cargo}
                onChange={(e) => handleInputChange('personas_cargo', e.target.value)}
                className="w-full p-2 border rounded-md bg-white text-gray-900 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Seleccionar</option>
                <option value="Sí">Sí</option>
                <option value="No">No</option>
              </select>
              {errors.personas_cargo && <div className="text-red-500 text-xs mt-1">{errors.personas_cargo}</div>}
            </div>
          </div>
        );
      case "documentacion":
        return (
          <div className="text-gray-500 text-center py-8 col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Documentos del Aspirante</h3>
            {/* Inputs ocultos para subir archivos */}
            <input
              ref={dniFrenteInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileInputChange(e, "dniFrente")}
              className="hidden"
            />
            <input
              ref={dniDorsoInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileInputChange(e, "dniDorso")}
              className="hidden"
            />
            <input
              ref={fileInputRefs.cus}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileInputChange(e, "cus")}
              className="hidden"
            />
            <input
              ref={fileInputRefs.foto_carnet}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileInputChange(e, "foto_carnet")}
              className="hidden"
            />
            <input
              ref={fileInputRefs.isa}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileInputChange(e, "isa")}
              className="hidden"
            />
            <input
              ref={fileInputRefs.partida_nacimiento}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileInputChange(e, "partida_nacimiento")}
              className="hidden"
            />
            <input
              ref={fileInputRefs.analitico}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileInputChange(e, "analitico")}
              className="hidden"
            />
            <input
              ref={fileInputRefs.grupo_sanguineo}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileInputChange(e, "grupo_sanguineo")}
              className="hidden"
            />
            <input
              ref={fileInputRefs.cud}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileInputChange(e, "cud")}
              className="hidden"
            />
            <input
              ref={fileInputRefs.emmac}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileInputChange(e, "emmac")}
              className="hidden"
            />
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
                      onClick={() => formData.documentos?.dniFrenteUrl && handleViewImage(abs(formData.documentos.dniFrenteUrl))} // Corregido
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

                  {/* Overlay para modo vista */}
                </div>

                <div className="flex gap-2">
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
                      onClick={() => formData.documentos?.dniDorsoUrl && handleViewImage(abs(formData.documentos.dniDorsoUrl))}
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

                  {/* Overlay para modo vista */}
                </div>

                <div className="flex gap-2">
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
                      onClick={() => triggerFileInput("cus")}
                      className="flex-1 text-sm bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {formData.documentos?.cusUrl ? "Cambiar" : "Subir"}
                    </Button>
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
                      onClick={() => triggerFileInput("foto_carnet")}
                      className="flex-1 text-sm bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {formData.documentos?.foto_carnetUrl ? "Cambiar" : "Subir"}
                    </Button>
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
                      onClick={() => triggerFileInput("isa")}
                      className="flex-1 text-sm bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {formData.documentos?.isaUrl ? "Cambiar" : "Subir"}
                    </Button>
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
                      onClick={() => triggerFileInput("partida_nacimiento")}
                      className="flex-1 text-sm bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {formData.documentos?.partida_nacimientoUrl ? "Cambiar" : "Subir"}
                    </Button>
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
                      onClick={() => triggerFileInput("analitico")}
                      className="flex-1 text-sm bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {formData.documentos?.analiticoUrl ? "Cambiar" : "Subir"}
                    </Button>
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
                      onClick={() => triggerFileInput("grupo_sanguineo")}
                      className="flex-1 text-sm bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {formData.documentos?.grupo_sanguineoUrl ? "Cambiar" : "Subir"}
                    </Button>
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
                      onClick={() => triggerFileInput("cud")}
                      className="flex-1 text-sm bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {formData.documentos?.cudUrl ? "Cambiar" : "Subir"}
                    </Button>
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
                      onClick={() => triggerFileInput("emmac")}
                      className="flex-1 text-sm bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {formData.documentos?.emmacUrl ? "Cambiar" : "Subir"}
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
    
  <ProtectedRoute allowedRoles={[RolUsuario.ADMIN_GENERAL, RolUsuario.GESTOR_ACADEMICO]}>
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
                onClick={handleCreate}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                CREAR
              </Button>
            </div>
          </div>
        </Card>
      </div>
            <CustomDialog
    open={isLogoutDialogOpen}
    onClose={() => setIsLogoutDialogOpen(false)}
    title={dialogProps.title ?? ""}
    description={dialogProps.description ?? ""}
    confirmLabel={dialogProps.confirmText ?? "Entendido"}
    cancelLabel={dialogProps.cancelText}
    onConfirm={dialogProps.onConfirm}
    showCancel={!!dialogProps.onCancel}
/>
    </div>
    </ProtectedRoute>
  )
}
