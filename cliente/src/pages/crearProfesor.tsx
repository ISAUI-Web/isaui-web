"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { ArrowLeft, User, Save, Camera } from "lucide-react"
import { useParams, useNavigate, useLocation } from 'react-router-dom'

const API_BASE = 'http://localhost:3000';
const abs = (u?: string | null) => (u ? (u.startsWith('http') ? u : `${API_BASE}${u}`) : '');

const tabs = [
  { id: "datos", label: "Datos personales" },
  { id: "estudios", label: "Estudios" },
  { id: "laboral", label: "Situación laboral y responsabilidades" },
  { id: "documentacion", label: "Documentación" },
]

export default function CrearLegajoProfesor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // Estado y carga de carreras desde backend
  const [carreras, setCarreras] = useState<Array<{ id: number, nombre: string }>>([]);
  const [loadingCarreras, setLoadingCarreras] = useState(false);
  const [errorCarreras, setErrorCarreras] = useState<string | null>(null);
  useEffect(() => {
    setLoadingCarreras(true);
    fetch(`${API_BASE}/carrera`)
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

  const [activeTab, setActiveTab] = useState("datos")
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
    },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dniFrenteInputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
  const dniDorsoInputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
  const tituloSecundarioInputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
  const tituloTerciarioInputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
  const examenPsicofisicoInputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Generalizado para todos los tipos de documentos
  const fileInputRefs: Record<string, React.RefObject<HTMLInputElement>> = {
    dniFrente: dniFrenteInputRef,
    dniDorso: dniDorsoInputRef,
    titulo_secundarioUrl: tituloSecundarioInputRef,
    titulo_terciarioUrl: tituloTerciarioInputRef,
    examen_psicofisicoUrl: examenPsicofisicoInputRef,
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    documentType: string,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev: any) => ({
        ...prev,
        documentos: { ...prev.documentos, [documentType]: previewUrl },
      }));
    }
  };

  const triggerFileInput = (documentType: string) => {
    fileInputRefs[documentType]?.current?.click();
  };

  const handleInputChange = (field: string, value: string) => {
    let newFormData = { ...formData, [field]: value };
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
    if (field === "completo_nivel_superior" && value === "En curso") {
      newFormData.anio_egreso_superior = "";
    }
    if (field === "trabajo" && value === "No") {
      newFormData.horas_diarias = "";
      newFormData.descripcion_trabajo = "";
    }
    setFormData(newFormData);
    const step =
      activeTab === "datos" ? 1 :
      activeTab === "estudios" ? 2 :
      activeTab === "laboral" ? 3 :
      activeTab === "documentacion" ? 4 : 1;
    validate(newFormData, step);
  };

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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBack = () => {
    navigate("/legajo");
  };

  const handleViewImage = (imageUrl: string | null) => {
    if (imageUrl) {
      setSelectedImage(imageUrl)
    }
  };

  const fromAspirantes = location.state?.from === "/aspirantes";
  const fromMatriculacion = location.state?.from === "/matriculacion";

  const renderTabContent = () => {
    switch (activeTab) {
      case "datos":
        return (
          <div className="grid grid-cols-2 gap-4">
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
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Documentos del Profesor</h3>
            {/* Inputs ocultos para subir archivos (generalizado) */}
            <input ref={dniFrenteInputRef} type="file" accept="image/*" onChange={e => handleFileInputChange(e, "dniFrente") } className="hidden" />
            <input ref={dniDorsoInputRef} type="file" accept="image/*" onChange={e => handleFileInputChange(e, "dniDorso") } className="hidden" />
            <input ref={tituloSecundarioInputRef} type="file" accept="image/*" onChange={e => handleFileInputChange(e, "titulo_secundarioUrl") } className="hidden" />
            <input ref={tituloTerciarioInputRef} type="file" accept="image/*" onChange={e => handleFileInputChange(e, "titulo_terciarioUrl") } className="hidden" />
            <input ref={examenPsicofisicoInputRef} type="file" accept="image/*" onChange={e => handleFileInputChange(e, "examen_psicofisicoUrl") } className="hidden" />
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

                  {/* Overlay para modo vista */}
                  {!formData.documentos?.dniFrenteUrl && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button
                        onClick={() => triggerFileInput("dniFrente")}
                        className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => triggerFileInput("dniFrente")}
                    className="flex-1 text-sm bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {formData.documentos?.dniFrenteUrl ? "Cambiar" : "Subir"}
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

                  {/* Overlay para modo vista */}
                  {!formData.documentos?.dniDorsoUrl && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button
                        onClick={() => triggerFileInput("dniDorso")}
                        className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => triggerFileInput("dniDorso")}
                    className="flex-1 text-sm bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {formData.documentos?.dniDorsoUrl ? "Cambiar" : "Subir"}
                  </Button>
                </div>
              </div>
                {/* Título nivel secundario */}
            <div className="space-y-3">
              <h4 className="text-md font-medium text-gray-700">Título nivel secundario</h4>
                  <div className="relative group">
                    {formData.documentos?.titulo_secundarioUrl ? (
                      <img
                        src={abs(formData.documentos.titulo_secundarioUrl)}
                        alt="Título nivel secundario"
                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
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
                  {formData.documentos?.titulo_secundarioUrl && (
                    <p className="text-sm text-gray-700 truncate mt-1">
                      {formData.documentos.titulo_secundarioUrl.split('/').pop()}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => triggerFileInput("titulo_secundarioUrl")}
                      className="flex-1 text-sm bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {formData.documentos?.titulo_secundarioUrl ? "Cambiar" : "Subir"}
                    </Button>
                  </div>
            </div>
                {/* titulo nivel terciario */}
                <div className="space-y-3">
              <h4 className="text-md font-medium text-gray-700">Título nivel terciario</h4>
                  <div className="relative group">
                    {formData.documentos?.titulo_terciarioUrl ? (
                      <img
                        src={abs(formData.documentos.titulo_terciarioUrl)}
                        alt="Título nivel terciario"
                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
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
                  {formData.documentos?.titulo_terciarioUrl && (
                    <p className="text-sm text-gray-700 truncate mt-1">
                      {formData.documentos.titulo_terciarioUrl.split('/').pop()}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => triggerFileInput("titulo_terciarioUrl")}
                      className="flex-1 text-sm bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {formData.documentos?.titulo_terciarioUrl ? "Cambiar" : "Subir"}
                    </Button>
                  </div>
            </div>
                {/* examen psicofisico */}
                <div className="space-y-3">
              <h4 className="text-md font-medium text-gray-700">Examen psicofísico</h4>
                  <div className="relative group">
                    {formData.documentos?.examen_psicofisicoUrl ? (
                      <img
                        src={abs(formData.documentos.examen_psicofisicoUrl)}
                        alt="Examen psicofísico"
                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
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
                  {formData.documentos?.examen_psicofisicoUrl && (
                    <p className="text-sm text-gray-700 truncate mt-1">
                      {formData.documentos.examen_psicofisicoUrl.split('/').pop()}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => triggerFileInput("examen_psicofisicoUrl")}
                      className="flex-1 text-sm bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {formData.documentos?.examen_psicofisicoUrl ? "Cambiar" : "Subir"}
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

  // Botón CREAR
  const handleCreate = () => {
    const step =
      activeTab === "datos" ? 1 :
      activeTab === "estudios" ? 2 :
      activeTab === "laboral" ? 3 :
      activeTab === "documentacion" ? 4 : 1;
    if (!validate(formData, step)) {
      alert("Por favor, corrige los errores antes de crear.");
      return;
    }
    alert('Profesor creado (simulado, sin conexión a backend)');
    navigate('/legajo');
  };

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

            {/* Action Button: CREAR */}
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
    </div>
  )
}
