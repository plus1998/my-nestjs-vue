import type { Request } from "express";

import type { AuthUser } from "@my-nestjs-vue/api-contract";

export interface RequestWithUser extends Request {
  user: AuthUser;
}
