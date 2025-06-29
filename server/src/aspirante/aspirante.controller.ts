import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  Body,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AspiranteService } from './aspirante.service';
import { CreateAspiranteDto } from './dto/create-aspirante.dto';
import { DocumentoService } from 'src/documento/documento.service';

@Controller('aspirante')
export class AspiranteController {
  constructor(
    private readonly aspiranteService: AspiranteService,
    private readonly documentoService: DocumentoService,
  ) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'dniFrente', maxCount: 1 },
        { name: 'dniDorso', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads/documentos',
          filename: (
            req: any,
            file: Express.Multer.File,
            cb: (error: Error | null, filename: string) => void,
          ) => {
            if (
              'originalname' in file &&
              typeof file.originalname === 'string'
            ) {
              const uniqueSuffix =
                Date.now() + '-' + Math.round(Math.random() * 1e9);
              const ext = extname(file.originalname);
              cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
            } else {
              cb(new Error('Archivo inválido'), ''); // <-- línea válida para tipado
            }
          },
        }),
        limits: {
          fileSize: 5 * 1024 * 1024, // 5MB
        },
        fileFilter: (req, file, cb) => {
          const allowed = /jpg|jpeg|png/;
          const ext = extname(file.originalname).toLowerCase();
          if (allowed.test(ext)) {
            cb(null, true);
          } else {
            cb(new Error('Solo se permiten archivos JPG o PNG'), false);
          }
        },
      },
    ),
  )
  async create(
    @Body() createAspiranteDto: CreateAspiranteDto,
    @UploadedFiles()
    files: {
      dniFrente?: Express.Multer.File[];
      dniDorso?: Express.Multer.File[];
    },
  ) {
    try {
      // Podrías validar aquí si los archivos son requeridos
      if (!files.dniFrente?.length || !files.dniDorso?.length) {
        throw new BadRequestException('Se requieren ambas imágenes del DNI.');
      }

      const aspirante = await this.aspiranteService.create(createAspiranteDto);

      await this.documentoService.guardarDocumentosAspirante(aspirante, files);

      return {
        aspirante,
        mensaje: 'Aspirante y documentos recibidos correctamente.',
      };
    } catch (error: unknown) {
      console.error(' Error en AspiranteController.create:', error);

      if (error instanceof Error) {
        if (
          error instanceof BadRequestException ||
          error.message.includes('Solo se permiten archivos JPG o PNG') ||
          error.message.includes('Archivo inválido') ||
          error.message.includes('Se requieren ambas imágenes del DNI.')
        ) {
          throw new BadRequestException({
            mensaje: error.message,
            detalle: error.stack || error.message,
          });
        }

        throw new InternalServerErrorException({
          mensaje:
            'Error interno en el servidor. Intente nuevamente más tarde.',
          detalle: error.stack || error.message,
        });
      }

      throw new InternalServerErrorException({
        mensaje: 'Ocurrió un error inesperado.',
      });
    }
  }
}
