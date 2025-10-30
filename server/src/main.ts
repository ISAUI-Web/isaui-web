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
      const allowedOrigins = [
        configService.get('CORS_ORIGIN'), // URL principal: https://isaui-web-frontend.vercel.app
        /\.vercel\.app$/, // Permite CUALQUIER subdominio de preview que termine en .vercel.app
      ];

      if (
        !origin || // Permite herramientas locales como Postman
        allowedOrigins.some(o =>
          o instanceof RegExp ? o.test(origin) : o === origin,
        )
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
