import { Test, TestingModule } from '@nestjs/testing';
import { AvatarsService } from './avatars.service';
import { getModelToken } from '@nestjs/mongoose';
import { Avatar } from './schemas/avatar.schema';
import { Model } from 'mongoose';
import { CreateUserAvatarDto } from './dto/user-avatar.dto';
import { NotFoundException } from '@nestjs/common';
import * as fs from 'fs/promises';
import { HttpModule, HttpService } from '@nestjs/axios';
import { AvatarsController } from './avatars.controller';

describe('AvatarsService', () => {
  let service: AvatarsService;
  let controller: AvatarsController;
  let avatarModel: Model<Avatar>;

  const mockavatarService = {
    getAvatar: jest.fn(),
    deleteAvatar: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvatarsService,
        {
          provide: getModelToken(Avatar.name),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            deleteOne: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },

        HttpModule,
      ],
      controllers: [AvatarsController],
    }).compile();

    service = module.get<AvatarsService>(AvatarsService);
    controller = module.get<AvatarsController>(AvatarsController);
    avatarModel = module.get(getModelToken(Avatar.name));
  });

  const mockUserAvatarDto: CreateUserAvatarDto = {
    userId: 2,
    avatarHash: '',
    avatarUrl: '',
  };

  const mockAvatarResult = {
    _id: '664fa05ae09d8c790a62e804',
    userId: 2,
    avatarUrl: 'https://reqres.in/img/faces/2-image.jpg',
    avatarHash: '608637556ef5ee652d1b896967213c52',
  };

  const mockBase64 = 'bW9jay1pbWFnZS1idWZmZXI=';

  describe('getAvatar', () => {
    it('should fetch and return avatar for existing user', async () => {
      jest
        .spyOn(fs, 'readFile')
        .mockResolvedValue(Buffer.from('mock-image-buffer'));

      jest.spyOn(avatarModel, 'findOne').mockResolvedValue({
        _id: '664fa05ae09d8c790a62e804',
        userId: 2,
        avatarUrl: 'https://reqres.in/img/faces/2-image.jpg',
        avatarHash: '608637556ef5ee652d1b896967213c52',
      });

      const result = await service.getAvatar(2, { ...mockUserAvatarDto });

      expect(avatarModel.findOne).toHaveBeenCalledWith({
        userId: 2,
      });

      expect(result).toEqual(mockBase64);
    });
  });

  describe('deleteAvatar', () => {
    it('should delete avatar for existing user', async () => {
      jest
        .spyOn(avatarModel, 'deleteOne')
        .mockResolvedValue({ acknowledged: true, deletedCount: 1 });
      const result = await service.deleteAvatar(2);

      expect(avatarModel.deleteOne).toHaveBeenCalledWith({ userId: 2 });
      expect(result).toEqual({
        message: `Avatar for userId deleted successfully`,
      });
    });

    it('should throw NotFoundException for non-existing user', async () => {
      await expect(service.deleteAvatar(1)).rejects.toThrow(Error);
    });
  });
});
