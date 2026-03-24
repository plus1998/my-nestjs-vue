import { Controller, Req } from "@nestjs/common";
import {
  TsRestException,
  TsRestHandler,
  tsRestHandler,
} from "@ts-rest/nest";

import { authContract } from "@my-nestjs-vue/api-contract";

import type { RequestWithUser } from "../common/types/request-with-user.interface";
import { Public } from "./decorators/public.decorator";
import { AuthService } from "./auth.service";

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @TsRestHandler(authContract.register)
  async register(): Promise<unknown> {
    return tsRestHandler(authContract.register, async ({ body }) => {
      try {
        return {
          status: 201,
          body: await this.authService.register(body),
        };
      } catch (error) {
        throw new TsRestException(authContract.register, {
          status: 409,
          body: {
            message: error instanceof Error ? error.message : "注册失败",
          },
        });
      }
    });
  }

  @Public()
  @TsRestHandler(authContract.login)
  async login(): Promise<unknown> {
    return tsRestHandler(authContract.login, async ({ body }) => {
      try {
        return {
          status: 200,
          body: await this.authService.login(body),
        };
      } catch (error) {
        throw new TsRestException(authContract.login, {
          status: 401,
          body: {
            message: error instanceof Error ? error.message : "登录失败",
          },
        });
      }
    });
  }

  @TsRestHandler(authContract.me)
  async me(@Req() request: RequestWithUser): Promise<unknown> {
    return tsRestHandler(authContract.me, async () => ({
      status: 200,
      body: {
        user: request.user,
      },
    }));
  }
}
