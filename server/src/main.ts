import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get('CORS_ORIGIN'),
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Configura el ValidationPipe global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina campos no definidos en los DTOs
      forbidNonWhitelisted: true, // Lanza error si llegan campos no permitidos
      transform: true, // Convierte los tipos automáticamente según el DTO
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
