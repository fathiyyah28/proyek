import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  console.log('------------------------------------------------');
  console.log('[CONFIG CHECK]');
  console.log('DB_HOST:', configService.get('DB_HOST'));
  console.log('DB_PORT:', configService.get('DB_PORT'));
  console.log('DB_USERNAME:', configService.get('DB_USERNAME'));
  console.log('DB_NAME:', configService.get('DB_NAME'));
  console.log('------------------------------------------------');

  app.enableCors({
    origin: true, // Allow all origins for development
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
  }));
  // Enable Static Assets for Uploads
  // Enable Static Assets for Uploads with Debugging
  const uploadsPath = join(process.cwd(), 'uploads');
  console.log('[STATIC ASSETS] Serving from:', uploadsPath);

  if (!require('fs').existsSync(uploadsPath)) {
    console.warn('[STATIC ASSETS] Uploads folder not found! Creating it...');
    require('fs').mkdirSync(uploadsPath, { recursive: true });
  }

  app.use('/uploads', require('express').static(uploadsPath));

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}`);
}
bootstrap();
