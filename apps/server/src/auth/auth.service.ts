import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { compare, hash } from "bcryptjs";
import { Repository } from "typeorm";

import type {
  AuthUser,
  LoginBody,
  RegisterBody,
} from "@my-nestjs-vue/api-contract";

import { UserEntity } from "../users/entities/user.entity";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async login(credentials: LoginBody) {
    const user = await this.usersRepository.findOne({
      where: {
        username: credentials.username,
      },
    });

    if (!user) {
      throw new UnauthorizedException("用户名或密码错误");
    }

    const passwordMatches = await compare(credentials.password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException("用户名或密码错误");
    }

    const authUser = this.toAuthUser(user);

    return {
      accessToken: await this.jwtService.signAsync(authUser),
      user: authUser,
    };
  }

  async register(payload: RegisterBody) {
    const existingUser = await this.usersRepository.findOne({
      where: {
        username: payload.username,
      },
    });

    if (existingUser) {
      throw new ConflictException("用户名已被占用");
    }

    const user = this.usersRepository.create({
      username: payload.username.trim(),
      passwordHash: await hash(payload.password, 10),
    });

    const savedUser = await this.usersRepository.save(user);

    return {
      user: this.toAuthUser(savedUser),
    };
  }

  toAuthUser(user: UserEntity): AuthUser {
    return {
      id: user.id,
      username: user.username,
    };
  }
}
