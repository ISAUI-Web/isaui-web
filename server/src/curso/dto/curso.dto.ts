import { IsNotEmpty, IsString } from 'class-validator';

export class CursoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;
}
