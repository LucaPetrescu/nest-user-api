import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ClientsModule } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = {
    email: 'email@email.com',
    localUser: {
      userId: 345,
      email: 'email@email.com',
      last_name: 'Petrescu',
      first_name: 'Luca',
      avatarUrl: 'avatar',
      _id: '664f48fde3cad99cd9805e35',
      __v: 0,
    },
    reqresUser: {
      first_name: 'Luca',
      last_name: 'Petrescu',
      email: 'email@email.com',
      avatarUrl: 'avatar',
      id: '676',
      createdAt: '2024-05-23T13:47:41.334Z',
    },
    message: 'User created!',
  };

  const mockCreateUserDto: CreateUserDto = {
    email: 'email@email.com',
    last_name: 'Petrescu',
    first_name: 'Luca',
    avatarUrl: 'avatar',
    userId: 8656,
  };

  const mockUserFromReqRes = {
    id: 2,
    email: 'janet.weaver@reqres.in',
    first_name: 'Janet',
    last_name: 'Weaver',
    avatar: 'https://reqres.in/img/faces/2-image.jpg',
  };

  const mockUsersService = {
    create: jest.fn().mockResolvedValue(mockUser),
    findOne: jest.fn().mockResolvedValue(mockUserFromReqRes),
  };

  const mockHash =
    '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';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: getModelToken(User.name),
          useValue: {},
        },
        HttpModule,
      ],
      imports: [ClientsModule],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const result = await controller.create(mockCreateUserDto);

      expect(service.create).toHaveBeenCalledWith(mockCreateUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const result = await controller.getUserById(2);
      console.log(result);
      expect(service.findOne).toHaveBeenCalledWith(2);
      expect(result).toEqual(mockUserFromReqRes);
    });
  });
});
