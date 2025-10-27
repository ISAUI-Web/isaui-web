import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Patch,
  Body,
} from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';

@Controller('estudiante')
export class EstudianteController {
  constructor(private readonly estudianteService: EstudianteService) {}

  @Get()
  findAll() {
    return this.estudianteService.findAll();
  }

  @Get('by-aspirante/:id')
  findByAspiranteId(@Param('id', ParseIntPipe) id: number) {
    return this.estudianteService.findByAspiranteId(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateEstudianteDto: UpdateEstudianteDto,
  ) {
    return this.estudianteService.update(+id, updateEstudianteDto);
  }

  @Patch(':id')
  updateActivo(
    @Param('id', ParseIntPipe) id: number,
    @Body('activo') activo: boolean,
  ) {
    return this.estudianteService.updateActivo(id, activo);
  }
}
