import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEmail,
} from 'class-validator';

export class CreateDocenteDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  apellido: string;

  @IsString()
  @IsNotEmpty()
  dni: string;

  @IsString() @IsOptional() sexo?: string;
  @IsString() @IsOptional() cuil?: string;
  @IsString() @IsOptional() domicilio?: string;
  @IsString() @IsOptional() localidad?: string;
  @IsString() @IsOptional() barrio?: string;
  @IsString() @IsOptional() codigo_postal?: string;
  @IsString() @IsOptional() telefono?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsDateString()
  @IsOptional()
  fecha_nacimiento?: Date;

  @IsString() @IsOptional() ciudad_nacimiento?: string;
  @IsString() @IsOptional() provincia_nacimiento?: string;

  // Este campo faltaba
  @IsString()
  @IsOptional()
  titulo?: string;

  // Estudios
  @IsString() @IsOptional() completo_nivel_medio?: string;
  @IsString() @IsOptional() anio_ingreso_medio?: string;
  @IsString() @IsOptional() anio_egreso_medio?: string;
  @IsString() @IsOptional() provincia_medio?: string;
  @IsString() @IsOptional() titulo_medio?: string;

  @IsString() @IsOptional() completo_nivel_superior?: string;
  @IsString() @IsOptional() carrera_superior?: string;
  @IsString() @IsOptional() institucion_superior?: string;
  @IsString() @IsOptional() provincia_superior?: string;
  @IsString() @IsOptional() anio_ingreso_superior?: string;
  @IsString() @IsOptional() anio_egreso_superior?: string;

  // Laboral (no están en la entidad Docente, pero los recibimos)
  @IsString() @IsOptional() trabajo?: string;
  @IsString() @IsOptional() horas_diarias?: string;
  @IsString() @IsOptional() descripcion_trabajo?: string;
  @IsString() @IsOptional() personas_cargo?: string;

  // Observaciones para el legajo
  @IsString()
  @IsOptional()
  observaciones_docente?: string;
}
