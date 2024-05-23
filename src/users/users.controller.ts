import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    console.log(`Sending email to ${user.email}`);
    return user;
  }

  @Get(':userId')
  async getUserById(@Param('userId') userId: number) {
    const user = await this.usersService.findOne(userId);
    return user.data;
  }
}
