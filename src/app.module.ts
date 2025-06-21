import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

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

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',         // Reemplazar por tu usuario si es otro
      password: 'G9r#2!xLp@V7zTqM',     // Reemplazar por tu contraseña
      database: 'isaui_web',
      autoLoadEntities: true,
      synchronize: true,        // ⚠️ Solo usar en desarrollo. NO activar en producción
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

    // CarreraModule, etc.
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
