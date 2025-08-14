import { Expose, Transform } from 'class-transformer';

const transformBooleanToSiNo = ({ value }: { value: any }): string =>
  value === true || value === 1 ? 'Sí' : 'No';

export class DetalleAspiranteDto {
  @Expose() nombre: string;
  @Expose() apellido: string;
  @Expose() email: string;
  @Expose() dni: string;
  @Expose() sexo: string;
  @Expose() cuil: string;
  @Expose() domicilio: string;
  @Expose() localidad: string;
  @Expose() barrio: string;
  @Expose() telefono: string;
  @Expose() fecha_nacimiento: Date;
  @Expose() provincia_nacimiento: string;
  @Expose() ciudad_nacimiento: string;
  @Expose() estado_preinscripcion: string;
  @Expose() estado_matriculacion: string;

  @Expose()
  carrera: string;

  @Expose()
  codigo_postal: string;

  @Expose()
  completo_nivel_medio: string; // Ahora será 'Sí', 'No', o 'En curso'

  @Expose()
  anio_ingreso_medio: number;

  @Expose()
  anio_egreso_medio: number;

  @Expose()
  provincia_medio: string;

  @Expose()
  titulo_medio: string;

  @Expose()
  completo_nivel_superior: string; // Ahora será 'Sí', 'No', o 'En curso'

  @Expose()
  carrera_superior: string;

  @Expose()
  institucion_superior: string;

  @Expose()
  provincia_superior: string;

  @Expose()
  anio_ingreso_superior: number;

  @Expose()
  anio_egreso_superior: number;

  @Expose()
  @Transform(transformBooleanToSiNo)
  trabajo: string;

  @Expose()
  horas_diarias: number;

  @Expose()
  descripcion_trabajo: string;

  @Expose()
  @Transform(transformBooleanToSiNo)
  personas_cargo: string;

  @Expose()
  dniFrenteUrl: string;

  @Expose()
  dniDorsoUrl: string;

  @Expose()
  dniFrenteNombre: string;

  @Expose()
  dniDorsoNombre: string;
}
