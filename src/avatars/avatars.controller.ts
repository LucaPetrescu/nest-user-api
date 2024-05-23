import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
import { CreateUserAvatarDto } from './dto/user-avatar.dto';
import { AvatarsService } from './avatars.service';

@Controller('api')
export class AvatarsController {
  constructor(private readonly avatarsSevice: AvatarsService) {}

  @Get('/user/:userId/avatar')
  async getAvatar(@Param('userId') userId: number) {
    const createUserAvatarDto = new CreateUserAvatarDto();
    createUserAvatarDto.userId = userId;
    const base64Avatar = await this.avatarsSevice.getAvatar(
      userId,
      createUserAvatarDto,
    );
    return base64Avatar;
  }

  @Delete('/user/:userId/avatar')
  async deleteAvatar(@Param('userId') userId: number) {
    const result = await this.avatarsSevice.deleteAvatar(userId);
    console.log(result);
    return { message: 'Deleted succesfully' };
  }
}
