import type { AuthUser } from '../auth.types';
import { AuthUserResponseDto } from './auth-user-response.dto';

export class AuthSessionResponseDto {
  user!: AuthUserResponseDto;

  constructor(user: AuthUser) {
    this.user = new AuthUserResponseDto(user);
  }
}
