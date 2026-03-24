import { initContract } from "@ts-rest/core";

import { authContract } from "./contracts/auth.contract";

const c = initContract();

export const contract = c.router({
  auth: authContract,
});

export * from "./contracts/auth.contract";
