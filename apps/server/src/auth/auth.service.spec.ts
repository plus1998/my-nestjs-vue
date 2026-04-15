import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import type { Repository } from 'typeorm';

import { AuthService } from './auth.service';
import { UserEntity } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: {
    create: jest.Mock;
    findOne: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(async () => {
    usersRepository = {
      create: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: usersRepository,
        },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  it('throws when registering an existing username', async () => {
    usersRepository.findOne.mockResolvedValue({
      id: 'existing-id',
      username: 'alice',
    });

    await expect(
      service.register({
        username: 'alice',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('throws when login password is invalid', async () => {
    usersRepository.findOne.mockResolvedValue({
      id: 'user-id',
      username: 'alice',
      passwordHash: await hash('correct-password', 10),
    } satisfies Partial<UserEntity>);

    await expect(
      service.login({
        username: 'alice',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('returns sanitized user data on successful register', async () => {
    usersRepository.findOne.mockResolvedValue(null);
    usersRepository.create.mockImplementation((payload) => ({
      id: 'user-id',
      ...payload,
    }));
    usersRepository.save.mockImplementation(
      async (user: Partial<UserEntity>) => user,
    );

    const result = await service.register({
      username: 'alice',
      password: 'password123',
    });

    expect(result).toEqual({
      id: 'user-id',
      username: 'alice',
    });
    expect(result).not.toHaveProperty('passwordHash');
    expect(usersRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'alice',
        passwordHash: expect.any(String),
      }),
    );
  });
});
