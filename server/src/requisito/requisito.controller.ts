import { Controller } from '@nestjs/common';
import { RequisitoService } from './requisito.service';

@Controller('requisito')
export class RequisitoController {
  constructor(private readonly requisitoService: RequisitoService) {}
}
