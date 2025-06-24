import { Controller } from '@nestjs/common';
import { LegajoEstudianteService } from './legajo-estudiante.service';

@Controller('legajo-estudiante')
export class LegajoEstudianteController {
  constructor(private readonly legajoEstudianteService: LegajoEstudianteService) {}
}
