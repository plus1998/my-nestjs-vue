import { initQueryClient } from "@ts-rest/vue-query";
import { QueryClient } from "@tanstack/vue-query";

import { contract } from "@my-nestjs-vue/api-contract";

const API_TOKEN_KEY = "my-nestjs-vue.jwt";
const DEFAULT_API_BASE_URL = "http://localhost:3000";

function getApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (!configuredBaseUrl) {
    return DEFAULT_API_BASE_URL;
  }

  return configuredBaseUrl.replace(/\/+$/, "");
}

export function getStoredToken() {
  return window.localStorage.getItem(API_TOKEN_KEY) ?? "";
}

export function setStoredToken(token: string) {
  if (!token) {
    window.localStorage.removeItem(API_TOKEN_KEY);
    return;
  }

  window.localStorage.setItem(API_TOKEN_KEY, token);
}

export const queryClient = new QueryClient();

export const apiClient = initQueryClient(contract, {
  baseUrl: getApiBaseUrl(),
  credentials: "include",
  baseHeaders: {
    authorization: () => {
      const token = getStoredToken();

      return token ? `Bearer ${token}` : "";
    },
  },
});
