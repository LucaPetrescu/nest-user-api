import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { Model } from 'mongoose';
import { CreateUserAvatarDto } from '../avatars/dto/user-avatar.dto';
import { AxiosResponse } from 'axios';
import { promises as fs } from 'fs';
import * as crypto from 'crypto';
import * as path from 'path';
import { Avatar, AvatarDocument } from '../avatars/schemas/avatar.schema';

@Injectable()
export class AvatarsService {
  constructor(
    @InjectModel(Avatar.name) private avatarModel: Model<AvatarDocument>,
    private readonly httpService: HttpService,
  ) {}
  async getAvatar(
    userId: number,
    createUserAvatarDto: CreateUserAvatarDto,
  ): Promise<string> {
    try {
      const avatar = await this.avatarModel.findOne({ userId: userId });
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

  async deleteAvatar(userId: number): Promise<object> {
    try {
      const avatar = await this.avatarModel.findOneAndDelete({ userId });

      // if (!avatar) {
      //   throw new NotFoundException(`Avatar for userId ${userId} not found`);
      // }

      const filePath = path.join(
        __dirname,
        '../../avatars',
        `${avatar.avatarHash}.png`,
      );
      await fs.unlink(filePath).catch((err) => {
        console.error(`Error deleting file: ${err.message}`);
      });

      await this.avatarModel.deleteOne({ userId });
      return avatar;
    } catch (e) {
      console.error(`Error deleting avatar: ${e.message}`);
      throw new Error('Error deleting avatar');
    }
  }
}
