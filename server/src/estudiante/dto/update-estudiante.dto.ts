import { IsNumber, IsOptional, Min, Max } from 'class-validator';

export class UpdateEstudianteDto {
  @IsOptional()
  @IsNumber()
  @Min(2000)
  @Max(new Date().getFullYear() + 5)
  ciclo_lectivo?: number;
}
