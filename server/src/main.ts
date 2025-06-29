import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

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
void bootstrap();
