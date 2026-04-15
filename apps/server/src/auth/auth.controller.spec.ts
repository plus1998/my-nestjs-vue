import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type { RequestWithUser } from '../common/types/request-with-user.interface';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    login: jest.Mock;
  };
  let configService: {
    getOrThrow: jest.Mock;
  };

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
    };
    configService = {
      getOrThrow: jest.fn().mockReturnValue('sid'),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    controller = moduleRef.get(AuthController);
  });

  it('stores user id in session on login', async () => {
    authService.login.mockResolvedValue({
      id: 'user-id',
      username: 'alice',
    });
    const request = {
      session: {},
    } as RequestWithUser;

    const result = await controller.login(
      {
        username: 'alice',
        password: 'password123',
      },
      request,
    );

    expect(request.session.userId).toBe('user-id');
    expect(result).toEqual({
      user: {
        id: 'user-id',
        username: 'alice',
      },
    });
  });

  it('destroys session and clears the auth cookie on logout', async () => {
    const request = {
      session: {
        destroy: jest.fn((callback: (error?: Error) => void) => callback()),
      },
    } as unknown as RequestWithUser;
    const response = {
      clearCookie: jest.fn(),
    } as unknown as Response;

    const result = await controller.logout(request, response);

    expect(configService.getOrThrow).toHaveBeenCalledWith('SESSION_COOKIE_NAME');
    expect(request.session.destroy).toHaveBeenCalled();
    expect(response.clearCookie).toHaveBeenCalledWith('sid');
    expect(result).toEqual({
      success: true,
    });
  });

  it('wraps the current user in the me response', () => {
    const request = {
      user: {
        id: 'user-id',
        username: 'alice',
      },
    } as RequestWithUser;

    expect(controller.me(request)).toEqual({
      user: {
        id: 'user-id',
        username: 'alice',
      },
    });
  });
});
