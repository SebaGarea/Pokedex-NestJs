import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
import { PokemonModule } from './pokemon/pokemon.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { ConfigModule } from '@nestjs/config';
import { EnvConfiguration } from './config/env.config.js';
import { JoiValidationSchema } from './config/joi.valdiation.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvConfiguration],
      validationSchema: JoiValidationSchema, //valida las variables de entorno utilizando Joi y la configuración definida en joi.validation.ts
    }), //carga las variables de entorno desde el archivo .env

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    MongooseModule.forRoot(process.env.MONGODB!),
    PokemonModule,
    CommonModule,
    SeedModule,
  ],
})
export class AppModule {}
