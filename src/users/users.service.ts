import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserAvatarDto } from './dto/user-avatar.dto';
import { AxiosResponse } from 'axios';
import { ClientProxy } from '@nestjs/microservices';
import { promises as fs } from 'fs';
import * as crypto from 'crypto';
import * as path from 'path';
import { Avatar, AvatarDocument } from './schemas/avatar.schema';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Avatar.name) private avatarModel: Model<AvatarDocument>,
    private readonly httpService: HttpService,
    @Inject('USERS_SERVICE') private rabbitClient: ClientProxy,
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
    const result = {
      localUser: savedUser,
      reqresUser: reqresResponse.data,
      message: 'User created!',
    };
    return result;
  }

  async findOne(userId: number): Promise<AxiosResponse<any>> {
    const url = `https://reqres.in/api/users/${userId}`;
    return this.httpService
      .get(url)
      .toPromise()
      .then((response) => response.data);
  }

  async getAvatar(
    userId: number,
    createUserAvatarDto: CreateUserAvatarDto,
  ): Promise<string> {
    try {
      const avatar = await this.avatarModel.findOne({ userId: userId }).exec();
      if (!avatar) {
        const url = `https://reqres.in/api/users/${userId}`;
        const response = await this.httpService.get(url).toPromise();
        const avatarUrl = response.data.data.avatar;

        const imageResponse: AxiosResponse<Buffer> = await this.httpService
          .get(avatarUrl, { responseType: 'arraybuffer' })
          .toPromise();
        const imageBuffer = Buffer.from(imageResponse.data);

        const hash = crypto.createHash('md5').update(imageBuffer).digest('hex');
        const filePath = path.join(__dirname, '../../avatars', `${hash}.png`);

        await fs.mkdir(path.join(__dirname, '../../avatars'), {
          recursive: true,
        });
        await fs.writeFile(filePath, imageBuffer);

        createUserAvatarDto.avatarUrl = avatarUrl;
        createUserAvatarDto.avatarHash = hash;

        const newAvatar = new this.avatarModel({
          userId: userId,
          avatarUrl: avatarUrl,
          avatarHash: hash,
        });
        await newAvatar.save();

        return imageBuffer.toString('base64');
      } else {
        const filePath = path.join(
          __dirname,
          '../../avatars',
          `${avatar.avatarHash}.png`,
        );
        const image = await fs.readFile(filePath);
        return image.toString('base64');
      }
    } catch (e) {
      console.error(`Error fetching avatar: ${e.message}`);
      throw new Error('Error fetching avatar');
    }
  }

  async deleteAvatar(userId: number): Promise<void> {
    const avatar = await this.avatarModel.findOne({ userId }).exec();
    if (!avatar) {
      throw new NotFoundException(`Avatar for userId ${userId} not found`);
    }
    const filePath = path.join(
      __dirname,
      '../../avatars',
      `${avatar.avatarHash}.png`,
    );
    await fs.unlink(filePath).catch((err) => {
      console.error(`Error deleting file: ${err.message}`);
    });
    await this.avatarModel.deleteOne({ userId }).exec();
  }
}
