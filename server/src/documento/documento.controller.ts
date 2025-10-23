import {
  Controller,
  Post,
  Param,
  ParseIntPipe,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { DocumentoService } from './documento.service';

// Define los documentos que se esperan para la matriculación
const matriculacionFields = [
  { name: 'cus', maxCount: 1 },
  { name: 'isa', maxCount: 1 },
  { name: 'partida_nacimiento', maxCount: 1 },
  { name: 'analitico', maxCount: 1 },
  { name: 'grupo_sanguineo', maxCount: 1 },
  { name: 'cud', maxCount: 1 },
  { name: 'emmac', maxCount: 1 },
  { name: 'foto_carnet', maxCount: 1 },
];

@Controller('documento')
export class DocumentoController {
  constructor(private readonly documentoService: DocumentoService) {}

  @Post('upload/aspirante/:aspiranteId')
  @UseInterceptors(
    FileFieldsInterceptor(matriculacionFields, {
      storage: memoryStorage(), // <--- CAMBIO CLAVE: de diskStorage a memoryStorage
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        const allowed = /pdf|jpg|jpeg|png/;
        const ext = extname(file.originalname).toLowerCase();
        if (allowed.test(ext)) {
          cb(null, true);
        } else {
          cb(new Error('Solo se permiten archivos PDF, JPG o PNG'), false);
        }
      },
    }),
  )
  async uploadDocumentosMatriculacion(
    @Param('aspiranteId', ParseIntPipe) aspiranteId: number,
    @UploadedFiles()
    files: {
      cus?: Express.Multer.File[];
      isa?: Express.Multer.File[];
      partida_nacimiento?: Express.Multer.File[];
      analitico?: Express.Multer.File[];
      grupo_sanguineo?: Express.Multer.File[];
      cud?: Express.Multer.File[];
      emmac?: Express.Multer.File[];
      foto_carnet?: Express.Multer.File[];
    },
  ) {
    if (!files || Object.keys(files).length === 0) {
      throw new BadRequestException('No se subió ningún archivo.');
    }

    return this.documentoService.guardarDocumentosMatriculacion(
      aspiranteId,
      files,
    );
  }
}
