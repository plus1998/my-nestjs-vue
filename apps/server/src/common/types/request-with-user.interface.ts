import type { Request } from 'express';
import type { Session, SessionData } from 'express-session';

import type { AuthUser } from '../../auth/auth.types';

type AuthSession = Session &
  Partial<SessionData> & {
    userId?: string;
  };

export interface RequestWithUser extends Request {
  user: AuthUser;
  session: AuthSession;
}
