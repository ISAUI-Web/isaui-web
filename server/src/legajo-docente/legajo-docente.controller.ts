import { Controller } from '@nestjs/common';
import { LegajoDocenteService } from './legajo-docente.service';

@Controller('legajo-docente')
export class LegajoDocenteController {
  constructor(private readonly legajoDocenteService: LegajoDocenteService) {}
}
