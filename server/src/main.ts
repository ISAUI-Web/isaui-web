import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Permite Postman, localhost, etc.
 
      const mainFrontend = configService.get<string>('CORS_ORIGIN'); // https://isaui-web-frontend.vercel.app
 
      // Regex que acepta cualquier subdominio de vercel.app
      const vercelPreviewRegex = /^https:\/\/.*\.vercel\.app$/;
 
      // Regex para localhost y puertos comunes de desarrollo
      const localhostRegex = /^http:\/\/localhost(:\d+)?$/;
 
      if (
        origin === mainFrontend || // frontend de producción
        vercelPreviewRegex.test(origin) || // previews de Vercel
        localhostRegex.test(origin) // desarrollo local
      ) {
        callback(null, true);
      } else {
        console.warn('❌ Bloqueado por CORS:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    credentials: true, // Esencial para que las cookies se envíen y reciban
  });

  // Configura el ValidationPipe global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina campos no definidos en los DTOs
      forbidNonWhitelisted: true, // Lanza error si llegan campos no permitidos
      transform: true, // Convierte los tipos automáticamente según el DTO
    }),
  );

  // Usar cookie-parser para que NestJS pueda leer las cookies de las solicitudes
  app.use(cookieParser());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch(err => {
  // Asegurarnos de que cualquier error en el arranque se imprima en la consola.
  // Esto es crucial para la depuración en entornos como Vercel.
  console.error('Error fatal durante el arranque de la aplicación:', err);
  process.exit(1);
});
