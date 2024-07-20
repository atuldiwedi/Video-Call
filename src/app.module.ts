import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VideosModule } from './videos/videos.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SignalingModule } from './signaling/signaling.module';

@Module({
  imports: [
    VideosModule,
    MongooseModule.forRoot('mongodb://localhost:27017/videoStream'),
    SignalingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
