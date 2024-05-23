import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/nestjs-api'),
    UsersModule,
    // HttpModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
