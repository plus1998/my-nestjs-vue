import { QueryClient } from "@tanstack/vue-query";

import type {
  AuthUser,
  LoginBody,
  LoginResponse,
  LogoutResponse,
  RegisterBody,
} from "@my-nestjs-vue/api-contract";

const DEFAULT_API_BASE_URL = "http://localhost:3000";
export const AUTH_ME_QUERY_KEY = ["auth", "me"] as const;

function getApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (!configuredBaseUrl) {
    return DEFAULT_API_BASE_URL;
  }

  return configuredBaseUrl.replace(/\/+$/, "");
}

export const queryClient = new QueryClient();

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
    fallbackMessage: string,
  ) {
    super(getBodyMessage(body, fallbackMessage));
  }
}

export async function loginRequest(credentials: LoginBody) {
  return requestJson<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function registerRequest(payload: RegisterBody) {
  return requestJson<{ user: AuthUser }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logoutRequest() {
  return requestJson<LogoutResponse>("/auth/logout", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function fetchCurrentUser() {
  const response = await fetch(`${getApiBaseUrl()}/auth/me`, {
    credentials: "include",
  });
  const body = await readJson(response);

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new ApiClientError(response.status, body, "获取登录状态失败");
  }

  return (body as { user: AuthUser }).user;
}

export function getCachedCurrentUser() {
  return queryClient.getQueryData<AuthUser | null>(AUTH_ME_QUERY_KEY);
}

export function setCurrentUser(user: AuthUser | null) {
  queryClient.setQueryData(AUTH_ME_QUERY_KEY, user);
}

export async function ensureCurrentUser(force = false) {
  if (!force) {
    const cachedUser = getCachedCurrentUser();

    if (cachedUser !== undefined) {
      return cachedUser;
    }
  }

  const user = await fetchCurrentUser();
  setCurrentUser(user);
  return user;
}

async function requestJson<T>(path: string, init: RequestInit) {
  const headers = new Headers(init.headers);

  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });
  const body = await readJson(response);

  if (!response.ok) {
    throw new ApiClientError(response.status, body, "请求失败");
  }

  return body as T;
}

async function readJson(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  return (await response.json()) as unknown;
}

function getBodyMessage(body: unknown, fallbackMessage: string) {
  if (
    typeof body === "object" &&
    body !== null &&
    "message" in body &&
    typeof body.message === "string"
  ) {
    return body.message;
  }

  return fallbackMessage;
}
