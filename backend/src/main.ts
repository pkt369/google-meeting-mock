import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  const PORT = process.env.PORT || 3001;
  await app.listen(PORT);

  console.log(`🚀 NestJS Signaling server running on http://localhost:${PORT}`);
}

bootstrap();
