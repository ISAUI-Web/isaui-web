import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static'; // 👈 Importar esto
import { join } from 'path';

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
    // 📂 Servir carpeta de documentos
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads', // URL base para acceder
    }),

    ConfigModule.forRoot({
      isGlobal: true, // Permite que ConfigService esté disponible en toda la app sin reimportar
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: Number(configService.get<string>('DB_PORT', '3306')),
        username: configService.get<string>('DB_USERNAME', 'root'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_NAME', 'isaui_web'),
        autoLoadEntities: true,
        synchronize: true, // ⚠️ Solo en desarrollo
      }),
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

    // CarreraModule, etc.
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
