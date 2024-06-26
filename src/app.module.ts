import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from './mailer/mail.module';
import { AvatarsModule } from './avatars/avatars.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/nestjs-api'),
    UsersModule,
    MailerModule,
    AvatarsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
