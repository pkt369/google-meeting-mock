import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MeetingModule } from './meeting/meeting.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MeetingModule,
  ],
})
export class AppModule {}
