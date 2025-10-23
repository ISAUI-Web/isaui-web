import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// Importar aquí los módulos cuando vayas creando (por ahora no hay ninguno)
// import { CarreraModule } from './carrera/carrera.module';
import { CarreraModule } from './carrera/carrera.module';
import { AspiranteModule } from './aspirante/aspirante.module';
import { PreinscripcionModule } from './preinscripcion/preinscripcion.module';
import { MatriculaModule } from './matricula/matricula.module';
import { UsuarioModule } from './usuario/usuario.module';
import { EstudianteModule } from './estudiante/estudiante.module';
import { DocumentoModule } from './documento/documento.module';
import { DocenteModule } from './docente/docente.module';
import { LegajoEstudianteModule } from './legajo-estudiante/legajo-estudiante.module';
import { LegajoDocenteModule } from './legajo-docente/legajo-docente.module';
import { RequisitoModule } from './requisito/requisito.module';
import { ConstanciaModule } from './constancia/constancia.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');

        if (databaseUrl) {
          // Configuración para Railway
          return {
            type: 'mysql',
            url: databaseUrl,
            autoLoadEntities: true,
            synchronize: true, // ⚠️ Solo en desarrollo
            ssl: {
              rejectUnauthorized: false,
            },
          };
        }
        // Configuración de fallback para desarrollo local
        return {
          type: 'mysql',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          autoLoadEntities: true,
          synchronize: true, // ⚠️ Solo en desarrollo
          ssl: configService.get('DB_HOST') !== 'localhost' ? { rejectUnauthorized: false } : undefined,
        };
      },
    }),
    CarreraModule,
    AspiranteModule,
    PreinscripcionModule,
    MatriculaModule,
    UsuarioModule,
    EstudianteModule,
    DocumentoModule,
    DocenteModule,
    LegajoEstudianteModule,
    LegajoDocenteModule,
    RequisitoModule,
    ConstanciaModule,
    CloudinaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
