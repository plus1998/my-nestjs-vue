import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

export const registerBodySchema = z.object({
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8).max(128),
});

export const loginBodySchema = z.object({
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8).max(128),
});

export const authUserSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(32),
});

export const loginResponseSchema = z.object({
  accessToken: z.string().min(1),
  user: authUserSchema,
});

export const authContract = c.router({
  register: {
    method: "POST",
    path: "/auth/register",
    summary: "Register a new user account",
    body: registerBodySchema,
    responses: {
      201: z.object({
        user: authUserSchema,
      }),
      409: z.object({
        message: z.string(),
      }),
    },
  },
  login: {
    method: "POST",
    path: "/auth/login",
    summary: "Authenticate user and issue a JWT",
    body: loginBodySchema,
    responses: {
      200: loginResponseSchema,
      401: z.object({
        message: z.string(),
      }),
    },
  },
  me: {
    method: "GET",
    path: "/auth/me",
    summary: "Get current user profile",
    responses: {
      200: z.object({
        user: authUserSchema,
      }),
      401: z.object({
        message: z.string(),
      }),
    },
  },
});

export type RegisterBody = z.infer<typeof registerBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
