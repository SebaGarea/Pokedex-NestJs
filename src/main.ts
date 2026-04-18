import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v2'); //le agrega el prefijo api/v2 a todas las rutas

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true, // convierte el objeto recibido a la instancia del DTO
      transformOptions: {
        enableImplicitConversion: true, // infiere el tipo de cada propiedad según su tipo en TypeScript (evita usar @Type())
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
