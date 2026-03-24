import type { Request } from 'express';
import type { Session, SessionData } from 'express-session';

import type { AuthUser } from '@my-nestjs-vue/api-contract';

type AuthSession = Session &
  Partial<SessionData> & {
    userId?: string;
  };

export interface RequestWithUser extends Request {
  user: AuthUser;
  session: AuthSession;
}
