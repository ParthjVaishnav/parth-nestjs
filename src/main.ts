import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Response } from 'express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configure upload directory
  const uploadDir = join(process.cwd(), 'src/uploads');
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  // Serve static assets from src/uploads
  app.useStaticAssets(uploadDir, {
    prefix: '/uploads/',
  });

  // Configure assets directory
  const assetsDir = join(process.cwd(), 'public/assets');
  if (!existsSync(assetsDir)) {
    mkdirSync(assetsDir, { recursive: true });
  }
  app.useStaticAssets(assetsDir, {
    prefix: '/assets/',
  });

  // Configure CORS
  app.enableCors({
    origin: [
      'http://192.168.3.77:8000',
      'http://127.0.0.1:3000',
      'http://192.168.3.77:3000',
      'http://127.0.0.1:8000',
      'http://localhost:3000',
      'http://localhost:8000',
    ],
    methods: 'GET,POST,PUT,PATCH,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  });

  // Apply global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Add request logging middleware
  app.use((req, res, next) => {
    logger.log(`Incoming request: ${req.method} ${req.url}`);
    next();
  });

  // Add a health check endpoint
  app.getHttpAdapter().get('/health', (req: any, res: Response) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
  });

  // Listen on all network interfaces
  const port = 3001;
  const host = '0.0.0.0';
  await app.listen(port, host);
  logger.log(`Application is running on: http://192.168.3.77:${port}`);
  logger.log(`Health check available at: http://192.168.3.77:${port}/health`);
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error(`Failed to start application: ${error.message}`, error.stack);
  process.exit(1);
});