import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // CORS 설정 (환경변수 기반)
  const frontendUrl = configService.get<string>('frontendUrl');
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  const PORT = configService.get<number>('port');
  await app.listen(PORT);

  console.log(`🚀 NestJS Signaling server running on http://localhost:${PORT}`);
  console.log(`📡 CORS enabled for: ${frontendUrl}`);
}

bootstrap();
