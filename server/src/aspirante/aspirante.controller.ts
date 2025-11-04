import {
  Controller,
  Get,
  Post,
  Param,
  Put,
  ParseIntPipe,
  NotFoundException,
  UploadedFiles,
  UseInterceptors,
  Body,
  BadRequestException,
  InternalServerErrorException,
  Res,
  Query,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { AspiranteService } from './aspirante.service';
import { Response } from 'express';
import { CreateAspiranteDto } from './dto/create-aspirante.dto';
import { UpdateAspiranteDto } from './dto/update-aspirante.dto';
import { plainToInstance } from 'class-transformer';
import { DetalleAspiranteDto } from './dto/detalle-aspirante.dto';

@Controller('aspirante')
export class AspiranteController {
  constructor(private readonly aspiranteService: AspiranteService) {}

  @Get('reportes/preinscriptos')
  async generatePreinscriptosReport(
    @Res() res: Response,
    @Query('carreraId', new ParseIntPipe({ optional: true }))
    carreraId?: number,
    @Query('estado') estado?: string,
  ) {
    const pdfBuffer = await this.aspiranteService.generatePreinscriptosPdf(
      carreraId,
      estado,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=reporte-preinscriptos.pdf',
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

  @Get('reportes/matriculados')
  async generateMatriculadosReport(
    @Res() res: Response,
    @Query('carreraId', new ParseIntPipe({ optional: true }))
    carreraId?: number,
    @Query('estado') estado?: string,
  ) {
    const pdfBuffer = await this.aspiranteService.generateMatriculadosPdf(
      carreraId,
      estado,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=reporte-matriculados.pdf',
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }
  
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'dniFrente', maxCount: 1 },
        { name: 'dniDorso', maxCount: 1 },
      ],
      {
        storage: memoryStorage(), // Usar memoria en lugar de disco
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
    // Simplificamos el manejo de errores. Dejamos que los pipes de validación de NestJS hagan su trabajo.
    // Si hay un error de validación, NestJS automáticamente lanzará un BadRequestException con detalles.
    
    // Validar acá si los archivos son requeridos
    if (!files.dniFrente?.length || !files.dniDorso?.length) {
      throw new BadRequestException('Se requieren ambas imágenes del DNI.');
    }

    // El método `create` del servicio ahora se encarga de todo.
    const aspirante = await this.aspiranteService.create(
      createAspiranteDto,
      files,
    );

    return {
      aspirante,
      mensaje: 'Aspirante y documentos recibidos correctamente.',
    };
  }

  @Get()
  async findAll() {
    return this.aspiranteService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const aspirante = await this.aspiranteService.findOne(id);

    if (!aspirante) {
      throw new NotFoundException(`Aspirante con ID ${id} no encontrado`);
    }

    const preinscripcion = aspirante.preinscripciones?.[0];
    const carrera = preinscripcion?.carrera?.nombre || 'Sin carrera';
    const estado_preinscripcion = preinscripcion?.estado || 'Sin estado';
    const matricula = aspirante.matriculas?.[0];
    const estado_matriculacion = matricula?.estado || 'No matriculado';

    const aspiranteLegible = plainToInstance(
      DetalleAspiranteDto,
      {
        ...aspirante,
        carrera,
        estado_preinscripcion,
        estado_matriculacion,
      },
      {
        excludeExtraneousValues: true,
      },
    );

    return aspiranteLegible;
  }

  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
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
        storage: memoryStorage(),
      },
    ),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAspiranteDto: UpdateAspiranteDto,
    @UploadedFiles()
    files?: { [fieldname: string]: Express.Multer.File[] },
  ) {
    const updated = await this.aspiranteService.update(
      id,
      updateAspiranteDto,
      files,
    );

    if (!updated) {
      throw new NotFoundException('Aspirante no encontrado');
    }
    return this.findOne(id);
  }
}
