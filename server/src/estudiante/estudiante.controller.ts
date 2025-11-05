import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Patch,
  Body,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Aspirante } from 'src/aspirante/aspirante.entity';

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
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'dniFrente', maxCount: 1 },
      { name: 'dniDorso', maxCount: 1 },
      { name: 'cus', maxCount: 1 },
      { name: 'foto_carnet', maxCount: 1 },
      { name: 'isa', maxCount: 1 },
      { name: 'partida_nacimiento', maxCount: 1 },
      { name: 'analitico', maxCount: 1 },
      { name: 'grupo_sanguineo', maxCount: 1 },
      { name: 'cud', maxCount: 1 },
      { name: 'emmac', maxCount: 1 },
    ]),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: any, // Recibimos los campos de texto aquí
    @UploadedFiles()
    files: { [fieldname: string]: Express.Multer.File[] },
  ) {
    // El servicio ahora necesita manejar los datos y los archivos
    // Convertimos los strings 'true'/'false' a booleanos
    const dto = this.convertToDto(updateData);
    return this.estudianteService.update(id, dto, files);
  }

  // Helper para convertir strings a booleanos y números
  private convertToDto(body: any): UpdateEstudianteDto {
    const dto = new UpdateEstudianteDto();
    Object.keys(body).forEach((key) => {
      // Simplemente asignamos el valor. La validación y transformación se manejan en el DTO.
      dto[key] = body[key];
    });
    return dto;
  }
}
