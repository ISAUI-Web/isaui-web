import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  Get,
  Patch,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { DocenteService } from './docente.service';
import { CreateDocenteDto } from './dto/create-docente.dto';

@Controller('docente')
export class DocenteController {
  constructor(private readonly docenteService: DocenteService) {}

  @Get()
  async findAll() {
    return await this.docenteService.findAll();
  }

  @Patch(':id')
  async updateActivo(
    @Param('id') id: number,
    @Body() body: { activo: boolean },
  ) {
    return await this.docenteService.updateActivo(id, body.activo);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const docente = await this.docenteService.findOne(+id);
      return docente;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Post()
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: memoryStorage(),
    }),
  )
  create(
    @Body() createDocenteDto: CreateDocenteDto,
    @UploadedFiles()
    files: Array<Express.Multer.File>,
  ) {
    return this.docenteService.create(createDocenteDto, files);
  }

  @Post('crear-docente-completo')
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: memoryStorage(),
    }),
  )
  createComplete(
    @Body() createDocenteDto: CreateDocenteDto,
    @UploadedFiles()
    files: Array<Express.Multer.File>,
  ) {
    return this.docenteService.create(createDocenteDto, files);
  }

  @Patch(':id/update')
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: memoryStorage(),
    }),
  )
  update(@Param('id') id: string, @Body() updateDocenteDto: CreateDocenteDto, @UploadedFiles() files: Array<Express.Multer.File>) {
    return this.docenteService.update(+id, updateDocenteDto, files);
  }
}
