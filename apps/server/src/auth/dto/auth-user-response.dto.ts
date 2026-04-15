import type { AuthUser } from '../auth.types';

export class AuthUserResponseDto {
  id!: string;
  username!: string;

  constructor(user: AuthUser) {
    this.id = user.id;
    this.username = user.username;
  }
}
