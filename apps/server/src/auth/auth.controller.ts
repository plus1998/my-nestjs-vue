import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

import type { RequestWithUser } from '../common/types/request-with-user.interface';
import { Public } from './decorators/public.decorator';
import { AuthService } from './auth.service';
import { AuthSessionResponseDto } from './dto/auth-session-response.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  async register(
    @Body() payload: RegisterDto,
  ): Promise<AuthSessionResponseDto> {
    const user = await this.authService.register(payload);

    return new AuthSessionResponseDto(user);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() credentials: LoginDto,
    @Req() request: RequestWithUser,
  ): Promise<AuthSessionResponseDto> {
    const user = await this.authService.login(credentials);
    request.session.userId = user.id;

    return new AuthSessionResponseDto(user);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @Req() request: RequestWithUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LogoutResponseDto> {
    await destroySession(request);
    response.clearCookie(
      this.configService.getOrThrow<string>('SESSION_COOKIE_NAME'),
    );

    return new LogoutResponseDto();
  }

  @HttpCode(HttpStatus.OK)
  @Get('me')
  me(@Req() request: RequestWithUser): AuthSessionResponseDto {
    return new AuthSessionResponseDto(request.user);
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
