import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { Repository } from 'typeorm';

import { UserEntity } from '../users/entities/user.entity';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import type { AuthUser } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async login(credentials: LoginDto): Promise<AuthUser> {
    const user = await this.usersRepository.findOne({
      where: {
        username: credentials.username,
      },
    });

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const passwordMatches = await compare(
      credentials.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const authUser = this.toAuthUser(user);

    return authUser;
  }

  async register(payload: RegisterDto): Promise<AuthUser> {
    const existingUser = await this.usersRepository.findOne({
      where: {
        username: payload.username,
      },
    });

    if (existingUser) {
      throw new ConflictException('用户名已被占用');
    }

    const user = this.usersRepository.create({
      username: payload.username.trim(),
      passwordHash: await hash(payload.password, 10),
    });

    const savedUser = await this.usersRepository.save(user);

    return this.toAuthUser(savedUser);
  }

  async findAuthUserById(id: string): Promise<AuthUser | null> {
    const user = await this.usersRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      return null;
    }

    return this.toAuthUser(user);
  }

  private toAuthUser(user: UserEntity): AuthUser {
    return {
      id: user.id,
      username: user.username,
    };
  }
}
