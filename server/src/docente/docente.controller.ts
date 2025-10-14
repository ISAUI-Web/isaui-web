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
import { diskStorage } from 'multer';
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
      storage: diskStorage({
        destination: './uploads', // Carpeta donde se guardan los archivos
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          // Si es un archivo de curso, usamos un nombre genérico.
          // Si no, usamos el fieldname como antes.
          const prefix = file.fieldname.startsWith('cursos[')
            ? 'curso-certificado'
            : file.fieldname.replace(/\s/g, '_');
          cb(null, `${prefix}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  create(
    @Body() createDocenteDto: CreateDocenteDto,
    @UploadedFiles()
    files: Array<Express.Multer.File>,
  ) {
    return this.docenteService.create(createDocenteDto, files);
  }

  @Patch(':id/update')
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const prefix = file.fieldname.startsWith('cursos[') ? 'curso-certificado' : file.fieldname.replace(/\s/g, '_');
          cb(null, `${prefix}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  update(@Param('id') id: string, @Body() updateDocenteDto: CreateDocenteDto, @UploadedFiles() files: Array<Express.Multer.File>) {
    return this.docenteService.update(+id, updateDocenteDto, files);
  }
}
