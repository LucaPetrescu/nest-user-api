import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';
import { Avatar, AvatarSchema } from './schemas/avatar.schema';
import { MailerModule } from '../mailer/mail.module';
import { HttpModule } from '@nestjs/axios';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Avatar.name, schema: AvatarSchema }]),
    HttpModule,
    ClientsModule.register([
      {
        name: 'USERS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'users-queue',
        },
      },
    ]),
    MailerModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
