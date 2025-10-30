import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const httpsOptions = {
    key: fs.existsSync(path.join(__dirname, '..', process.env.SSL_KEY_PATH || './certs/server.key'))
      ? fs.readFileSync(
          path.join(__dirname, '..', process.env.SSL_KEY_PATH || './certs/server.key'),
        )
      : undefined,
    cert: fs.existsSync(
      path.join(__dirname, '..', process.env.SSL_CERT_PATH || './certs/server.crt'),
    )
      ? fs.readFileSync(
          path.join(__dirname, '..', process.env.SSL_CERT_PATH || './certs/server.crt'),
        )
      : undefined,
  };

  // Create app with HTTPS if certificates are available
  const app =
    httpsOptions.key && httpsOptions.cert
      ? await NestFactory.create(AppModule, { httpsOptions })
      : await NestFactory.create(AppModule);

  // Enable CORS
  const corsOrigin = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:3000', 'https://localhost:3443'];

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // Enable validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: ${await app.getUrl()}`);
  console.log(
    `🔒 HTTPS: ${httpsOptions.key && httpsOptions.cert ? 'Enabled' : 'Disabled (certificates not found)'}`,
  );
  console.log(`📡 WebSocket server is ready`);
}

bootstrap();
