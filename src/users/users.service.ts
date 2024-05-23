import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { AxiosResponse } from 'axios';
import { response } from 'express';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly httpService: HttpService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<any> {
    const createdUser = new this.userModel(createUserDto);
    const savedUser = await createdUser.save();

    const reqresResponse: AxiosResponse<any> = await this.httpService
      .post('https://reqres.in/api/users', {
        first_name: savedUser.first_name,
        last_name: savedUser.last_name,
        email: savedUser.email,
        avatar: savedUser.avatar,
      })
      .toPromise();

    return {
      localUser: savedUser,
      reqresUser: reqresResponse.data,
    };
  }

  async findOne(userId: number): Promise<AxiosResponse<any>> {
    const url = `https://reqres.in/api/users/${userId}`;
    return this.httpService
      .get(url)
      .toPromise()
      .then((response) => response.data);
  }
}
