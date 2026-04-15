import { fetchJson } from "@/lib/fetch-client";

export interface AuthUser {
  id: string;
  username: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
}

export interface AuthSessionResponse {
  user: AuthUser;
}

export interface LogoutResponse {
  success: true;
}

export function register(payload: RegisterPayload) {
  return fetchJson<AuthSessionResponse>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function login(payload: LoginPayload) {
  return fetchJson<AuthSessionResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function logout() {
  return fetchJson<LogoutResponse>("/auth/logout", {
    method: "POST",
  });
}

export function getCurrentUser() {
  return fetchJson<AuthSessionResponse>("/auth/me");
}
