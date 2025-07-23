import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsDateString,
  IsBoolean,
  IsNumber,
  IsOptional,
  Length,
  Matches,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

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

  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  completo_nivel_medio: boolean;

  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear())
  anio_ingreso_medio: number;

  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  anio_egreso_medio: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  provincia_medio: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  titulo_medio: string;

  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  completo_nivel_superior: boolean;

  @IsOptional()
  @IsString()
  carrera_superior?: string;

  @IsOptional()
  @IsString()
  institucion_superior?: string;

  @IsOptional()
  @IsString()
  provincia_superior?: string;

  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  anio_ingreso_superior?: number;

  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  anio_egreso_superior?: number;

  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  trabajo: boolean;

  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(24)
  horas_diarias?: number;

  @IsOptional()
  @IsString()
  descripcion_trabajo?: string;

  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  personas_cargo: boolean;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsNotEmpty()
  carrera_id: number;
}
