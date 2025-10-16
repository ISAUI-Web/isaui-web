import {
  ValidateIf,
  IsString,
  IsNotEmpty,
  IsEmail,
  IsDateString,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsIn,
  Length,
  Matches,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

const transformToBoolean = ({ value }: { value: any }): boolean | any => {
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase().trim();
    if (lowerValue === 'true' || lowerValue === 'sí' || lowerValue === 'si') {
      return true;
    }
    if (lowerValue === 'false' || lowerValue === 'no') {
      return false;
    }
  }
  return value; // Devuelve el valor original si no es un string booleano reconocible
};

// Esta función transforma valores comunes (como 'true', 'false', 'en_curso')
// a los valores de string que espera la base de datos ('Sí', 'No', 'En curso').
const transformToEstadoEstudio = ({ value }: { value: any }): string => {
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase().trim();
    if (lowerValue === 'true' || lowerValue === 'sí' || lowerValue === 'si') {
      return 'Sí';
    }
    if (lowerValue === 'false' || lowerValue === 'no') {
      return 'No';
    }
    if (lowerValue === 'en curso' || lowerValue === 'en_curso') {
      return 'En curso';
    }
  }
  return value;
};

export class CreateAspiranteDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  apellido: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Matches(/^\d{7,8}$/, {
    message: 'El DNI debe tener 7 u 8 dígitos numéricos',
  })
  dni: string;

  @IsString()
  @IsNotEmpty()
  sexo: string;

  @IsString()
  @Matches(/^\d{11}$/, { message: 'El CUIL debe tener 11 dígitos numéricos' })
  cuil: string;

  @IsString()
  @IsNotEmpty()
  domicilio: string;

  @IsString()
  @IsNotEmpty()
  localidad: string;

  @IsString()
  @IsNotEmpty()
  barrio: string;

  @IsString()
  @Matches(/^\d{4,5}$/, {
    message: 'El código postal debe tener 4 o 5 dígitos numéricos',
  })
  codigo_postal: string;

  @IsString()
  @Matches(/^\d{6,15}$/, {
    message: 'El teléfono debe tener entre 6 y 15 dígitos numéricos',
  })
  telefono: string;

  @IsDateString(
    {},
    {
      message: 'La fecha de nacimiento debe ser una fecha válida (YYYY-MM-DD)',
    },
  )
  fecha_nacimiento: Date;

  @IsString()
  @IsNotEmpty()
  provincia_nacimiento: string;

  @IsString()
  @IsNotEmpty()
  ciudad_nacimiento: string;

  @IsString()
  @IsNotEmpty()
  estado_preinscripcion: string;

  @IsString()
  @IsNotEmpty()
  estado_matriculacion: string;

  @Transform(transformToEstadoEstudio)
  @IsString()
  @IsIn(['Sí', 'No', 'En curso'], {
    message: 'El estado del nivel medio debe ser Sí, No, o En curso',
  })
  completo_nivel_medio?: string;

  @Transform(({ value }) =>
    value === '' || value === null ? null : Number(value),
  )
  @ValidateIf((o) => ['Sí', 'En curso'].includes(o.completo_nivel_medio))
  @IsNotEmpty({
    message: 'El año de ingreso es requerido si el nivel medio fue iniciado',
  })
  @ValidateIf((o, v) => v != null) // Evita errores en cascada si el campo está vacío
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear())
  anio_ingreso_medio?: number;

  @Transform(({ value }) =>
    value === '' || value === null ? null : Number(value),
  )
  @ValidateIf((o) => o.completo_nivel_medio === 'Sí')
  @IsNotEmpty({
    message: 'El año de egreso es requerido si completó el nivel medio',
  })
  @ValidateIf((o, v) => v != null) // Evita errores en cascada si el campo está vacío
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  anio_egreso_medio?: number;

  @ValidateIf((o) => ['Sí', 'En curso'].includes(o.completo_nivel_medio))
  @IsNotEmpty({ message: 'La provincia del nivel medio es requerida' })
  @IsString()
  provincia_medio?: string;

  @ValidateIf((o) => ['Sí', 'En curso'].includes(o.completo_nivel_medio))
  @IsNotEmpty({ message: 'El título del nivel medio es requerido' })
  @IsString()
  titulo_medio?: string;

  @Transform(transformToEstadoEstudio)
  @IsOptional()
  @IsString()
  @IsIn(['Sí', 'No', 'En curso'], {
    message: 'El estado del nivel superior debe ser Sí, No, o En curso',
  })
  completo_nivel_superior?: string;

  @ValidateIf((o) => ['Sí', 'En curso'].includes(o.completo_nivel_superior))
  @IsNotEmpty({ message: 'La carrera superior es requerida' })
  @IsString()
  carrera_superior?: string;

  @ValidateIf((o) => ['Sí', 'En curso'].includes(o.completo_nivel_superior))
  @IsNotEmpty({ message: 'La institución superior es requerida' })
  @IsString()
  institucion_superior?: string;

  @ValidateIf((o) => ['Sí', 'En curso'].includes(o.completo_nivel_superior))
  @IsNotEmpty({
    message: 'La provincia de la institución superior es requerida',
  })
  @IsString()
  provincia_superior?: string;

  @Transform(({ value }) =>
    value === '' || value === null ? null : Number(value),
  )
  @ValidateIf((o) => ['Sí', 'En curso'].includes(o.completo_nivel_superior))
  @IsNotEmpty({
    message:
      'El año de ingreso superior es requerido si los estudios fueron iniciados',
  })
  @ValidateIf((o, v) => v != null) // Evita errores en cascada si el campo está vacío
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  anio_ingreso_superior?: number;

  @Transform(({ value }) =>
    value === '' || value === null ? null : Number(value),
  )
  @ValidateIf((o) => o.completo_nivel_superior === 'Sí')
  @IsNotEmpty({
    message: 'El año de egreso superior es requerido si completó los estudios',
  })
  @ValidateIf((o, v) => v != null) // Evita errores en cascada si el campo está vacío
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  anio_egreso_superior?: number;

  @Transform(transformToBoolean)
  @IsBoolean()
  trabajo: boolean;

  @ValidateIf((o) => o.trabajo === true)
  @Transform(({ value }) => (value === '' || value === null ? null : Number(value)))
  @IsNotEmpty({ message: 'Las horas diarias son requeridas si trabaja' })
  @IsNumber()
  @Min(1)
  @Max(24)
  horas_diarias?: number;

  @ValidateIf((o) => o.trabajo === true)
  @IsNotEmpty({ message: 'La descripción del trabajo es requerida si trabaja' })
  @IsString()
  descripcion_trabajo?: string;

  @Transform(transformToBoolean)
  @IsBoolean()
  personas_cargo: boolean;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsNotEmpty()
  carrera_id: number;

  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsNumber({}, { message: 'El ciclo lectivo debe ser un número' })
  @IsNotEmpty({ message: 'El ciclo lectivo no puede estar vacío' })
  @Min(2000, { message: 'El ciclo lectivo parece ser un año inválido.' })
  @Max(new Date().getFullYear() + 5, {
    message: 'El ciclo lectivo es demasiado a futuro.',
  })
  ciclo_lectivo: number;
}
