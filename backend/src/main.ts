import 'dotenv/config';
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { PrismaClientExceptionFilter } from './prisma-client-exception/prisma-client-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    // Allow local dev (PWA on 3002) from localhost and common LAN ranges
    origin: [
      /^http:\/\/localhost:3002$/,
      /^http:\/\/127\.0\.0\.1:3002$/,
      /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:3002$/,
      /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:3002$/,
      /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}:3002$/,
      // Keep generic localhost allowance for other frontends (admin, etc.)
      /^(http:\/\/localhost:\d{4,5})$/,
      /^(http:\/\/127\.0\.0\.1:\d{4,5})$/,
    ],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const config = new DocumentBuilder()
    .setTitle('MusicSwipe API')
    .setDescription('The MusicSwipe API description')
    .setVersion('0.1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  await app.listen(3000);
}
bootstrap();
