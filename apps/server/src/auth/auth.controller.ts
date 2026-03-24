import {
  ConflictException,
  Controller,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { TsRestException, TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import type { Response } from 'express';

import { authContract } from '@my-nestjs-vue/api-contract';

import { SESSION_COOKIE_NAME } from './constants/session.constants';
import type { RequestWithUser } from '../common/types/request-with-user.interface';
import { Public } from './decorators/public.decorator';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @TsRestHandler(authContract.register)
  register(): unknown {
    return tsRestHandler(authContract.register, async ({ body }) => {
      try {
        const payload = body;

        return {
          status: 201,
          body: await this.authService.register(payload),
        };
      } catch (error) {
        if (!(error instanceof ConflictException)) {
          throw error;
        }

        throw new TsRestException(authContract.register, {
          status: 409,
          body: {
            message: error.message,
          },
        });
      }
    });
  }

  @Public()
  @TsRestHandler(authContract.login)
  login(@Req() request: RequestWithUser): unknown {
    return tsRestHandler(authContract.login, async ({ body }) => {
      try {
        const credentials = body;
        const result = await this.authService.login(credentials);
        request.session.userId = result.user.id;

        return {
          status: 200,
          body: result,
        };
      } catch (error) {
        if (!(error instanceof UnauthorizedException)) {
          throw error;
        }

        throw new TsRestException(authContract.login, {
          status: 401,
          body: {
            message: error.message,
          },
        });
      }
    });
  }

  @Public()
  @TsRestHandler(authContract.logout)
  logout(
    @Req() request: RequestWithUser,
    @Res({ passthrough: true }) response: Response,
  ): unknown {
    return tsRestHandler(authContract.logout, async () => {
      await destroySession(request);
      response.clearCookie(SESSION_COOKIE_NAME);

      return {
        status: 200,
        body: {
          success: true,
        },
      };
    });
  }

  @TsRestHandler(authContract.me)
  me(@Req() request: RequestWithUser): unknown {
    return tsRestHandler(authContract.me, async () =>
      Promise.resolve({
        status: 200,
        body: {
          user: request.user,
        },
      }),
    );
  }
}

async function destroySession(request: RequestWithUser) {
  await new Promise<void>((resolve, reject) => {
    request.session.destroy((error) => {
      if (error) {
        reject(error instanceof Error ? error : new Error('销毁会话失败'));
        return;
      }

      resolve();
    });
  });
}
