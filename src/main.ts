import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/winston/winston.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
