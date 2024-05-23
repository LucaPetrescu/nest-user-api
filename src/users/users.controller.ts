import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('api')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/users')
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    console.dir('Sending email to ' + user.email);

    return user;
  }

  @Get('/user/:userId')
  async getUserById(@Param('userId') userId: number) {
    const user = await this.usersService.findOne(userId);
    return user;
  }
}
