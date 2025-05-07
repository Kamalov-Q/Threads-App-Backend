import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './mongo-validation-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app?.useGlobalPipes(new ValidationPipe())
  app?.useGlobalFilters(new HttpExceptionFilter())
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
}
bootstrap();
