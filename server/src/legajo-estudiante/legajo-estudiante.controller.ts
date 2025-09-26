import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { LegajoEstudianteService } from './legajo-estudiante.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreateAspiranteDto } from '../aspirante/dto/create-aspirante.dto';

@Controller('legajo-estudiante')
export class LegajoEstudianteController {
  constructor(
    private readonly legajoEstudianteService: LegajoEstudianteService,
  ) {}

  @Post('crear-alumno-completo')
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
      ],
      {
        storage: diskStorage({
          destination: './uploads/documentos',
          filename: (req, file, cb) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
          },
        }),
      },
    ),
  )
  async crearLegajoCompleto(
    @Body() createAspiranteDto: CreateAspiranteDto,
    @UploadedFiles() files: { [fieldname: string]: Express.Multer.File[] },
  ) {
    return this.legajoEstudianteService.crearLegajoCompleto(
      createAspiranteDto,
      files,
    );
  }
}
