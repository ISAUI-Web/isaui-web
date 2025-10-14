import {
  IsString,
  IsOptional,
  IsArray,
  IsNotEmpty,
} from 'class-validator';

export class CreateDocenteDto {
  @IsString() @IsOptional() nombre?: string;
  @IsString() @IsOptional() apellido?: string;
  @IsString() @IsOptional() sexo?: string;
  @IsString() @IsNotEmpty() dni: string;
  @IsString() @IsOptional() cuil?: string;
  @IsString() @IsOptional() domicilio?: string;
  @IsString() @IsOptional() localidad?: string;
  @IsString() @IsOptional() barrio?: string;
  @IsString() @IsOptional() codigo_postal?: string;
  @IsString() @IsOptional() telefono?: string;
  @IsString() @IsOptional() email?: string;
  @IsString() @IsOptional() fecha_nacimiento?: string;
  @IsString() @IsOptional() ciudad_nacimiento?: string;
  @IsString() @IsOptional() provincia_nacimiento?: string;

  // Este campo está en la entidad Docente
  @IsString() @IsOptional() titulo?: string;

  // Estudios Nivel Medio
  @IsString() @IsOptional() completo_nivel_medio?: string;
  @IsString() @IsOptional() anio_ingreso_medio?: string;
  @IsString() @IsOptional() anio_egreso_medio?: string;
  @IsString() @IsOptional() provincia_medio?: string;
  @IsString() @IsOptional() titulo_medio?: string;

  // Estudios Nivel Superior
  @IsString() @IsOptional() completo_nivel_superior?: string;
  @IsString() @IsOptional() carrera_superior?: string;
  @IsString() @IsOptional() institucion_superior?: string;
  @IsString() @IsOptional() provincia_superior?: string;
  @IsString() @IsOptional() anio_ingreso_superior?: string;
  @IsString() @IsOptional() anio_egreso_superior?: string;

  // Datos laborales (los recibimos del frontend)
  @IsString() @IsOptional() trabajo?: string;
  @IsString() @IsOptional() horas_diarias?: string;
  @IsString() @IsOptional() descripcion_trabajo?: string;
  @IsString() @IsOptional() personas_cargo?: string;

  // Cursos
  @IsOptional()
  @IsArray() // El frontend envía un array de strings JSON
  cursos?: string[];

  // Observaciones
  @IsString() @IsOptional() observaciones_docente?: string;
}
