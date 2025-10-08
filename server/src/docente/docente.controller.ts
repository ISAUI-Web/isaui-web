import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { DocenteService } from './docente.service';
import { CreateDocenteDto } from './dto/create-docente.dto';

@Controller('docente')
export class DocenteController {
  constructor(private readonly docenteService: DocenteService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'dniFrente', maxCount: 1 },
        { name: 'dniDorso', maxCount: 1 },
        { name: 'titulo_secundario', maxCount: 1 },
        { name: 'titulo_terciario', maxCount: 1 },
        { name: 'examen_psicofisico', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads', // Carpeta donde se guardan los archivos
          filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            const originalName = file.fieldname.replace(/\s/g, '_');
            cb(null, `${originalName}-${uniqueSuffix}${ext}`);
          },
        }),
      },
    ),
  )
  create(
    @Body() createDocenteDto: CreateDocenteDto,
    @UploadedFiles()
    files: {
      dniFrente?: Express.Multer.File[];
      dniDorso?: Express.Multer.File[];
      titulo_secundario?: Express.Multer.File[];
      titulo_terciario?: Express.Multer.File[];
      examen_psicofisico?: Express.Multer.File[];
    },
  ) {
    return this.docenteService.create(createDocenteDto, files);
  }
}
