import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Middleware de seguridad recomendado
  app.use(helmet());

  // Necesario para leer cookies (por ejemplo, extraer el JWT)
  app.use(cookieParser());

  // Configuración CORS — IMPORTANTE para cookies
  app.enableCors({
    origin: configService.get('CORS_ORIGIN'), // Ej: https://isaui-web.vercel.app
    credentials: true, // 👈 permite el envío de cookies entre frontend y backend
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch(err => {
  // Asegurarnos de que cualquier error en el arranque se imprima en la consola.
  // Esto es crucial para la depuración en entornos como Vercel.
  console.error('Error fatal durante el arranque de la aplicación:', err);
  process.exit(1);
});
