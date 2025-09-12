import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 6000, '0.0.0.0');
  console.log(`🚀 App running on port ${process.env.PORT ?? 6000}`);
}
bootstrap();
