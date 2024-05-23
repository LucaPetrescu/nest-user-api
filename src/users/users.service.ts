import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { AxiosResponse } from 'axios';
import { ClientProxy } from '@nestjs/microservices';

import { MailerService } from '../mailer/mailer.service';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly httpService: HttpService,
    @Inject('USERS_SERVICE') private rabbitClient: ClientProxy,
    private readonly mailerService: MailerService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<any> {
    const createdUser = new this.userModel(createUserDto);
    const savedUser = await createdUser.save();

    const reqresResponse: AxiosResponse<any> = await this.httpService
      .post('https://reqres.in/api/users', {
        first_name: savedUser.first_name,
        last_name: savedUser.last_name,
        email: savedUser.email,
        avatarUrl: savedUser.avatarUrl,
      })
      .toPromise();
    this.rabbitClient.emit('user-created', createUserDto);

    // This piece of code sends the email

    // await this.mailerService.sendMail(
    //   savedUser.email,
    //   'Welcome!',
    //   'Welcome to our service!',
    // );
    const result = {
      email: savedUser.email,
      localUser: savedUser,
      reqresUser: reqresResponse.data,
      message: 'User created!',
    };
    return result;
  }

  async findOne(userId: number): Promise<AxiosResponse<any>> {
    const url = `https://reqres.in/api/users/${userId}`;
    const response = await this.httpService.get(url).toPromise();

    return response.data.data;
  }
}
