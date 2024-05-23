import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserAvatarDto } from './dto/user-avatar.dto';

@Controller('api')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/users')
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    console.log(`Sending email to ${user}`);

    return user;
  }

  @Get('/user/:userId')
  async getUserById(@Param('userId') userId: number) {
    const user = await this.usersService.findOne(userId);
    return user.data;
  }

  @Get('/user/:userId/avatar')
  async getAvatar(@Param('userId') userId: number) {
    const createUserAvatarDto = new CreateUserAvatarDto();
    createUserAvatarDto.userId = userId;
    const base64Avatar = await this.usersService.getAvatar(
      userId,
      createUserAvatarDto,
    );
    return base64Avatar;
  }

  @Delete('/user/:userId/avatar')
  async deleteAvatar(@Param('userId') userId: number) {
    await this.usersService.deleteAvatar(userId);
    return { message: `Avatar for userId deleted successfully` };
  }
}
