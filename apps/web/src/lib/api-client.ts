import { QueryClient } from "@tanstack/vue-query";
import { initQueryClient } from "@ts-rest/vue-query";

import { contract, type AuthUser } from "@my-nestjs-vue/api-contract";

const DEFAULT_API_BASE_URL = "http://localhost:3000";

export const AUTH_ME_QUERY_KEY = ["auth", "me"] as const;
export const queryClient = new QueryClient();

function getApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (!configuredBaseUrl) {
    return DEFAULT_API_BASE_URL;
  }

  return configuredBaseUrl.replace(/\/+$/, "");
}

export const apiClient = initQueryClient(contract, {
  baseUrl: getApiBaseUrl(),
  fetchOptions: {
    credentials: "include",
  },
});

export function setCurrentUser(user: AuthUser | null) {
  if (!user) {
    queryClient.removeQueries({
      queryKey: AUTH_ME_QUERY_KEY,
    });
    return;
  }

  queryClient.setQueryData(AUTH_ME_QUERY_KEY, {
    status: 200,
    body: {
      user,
    },
    headers: new Headers(),
  });
}

export async function ensureCurrentUser(force = false) {
  if (!force) {
    const cachedResponse = queryClient.getQueryData<{
      status: number;
      body: {
        user: AuthUser;
      };
    }>(AUTH_ME_QUERY_KEY);

    if (cachedResponse?.status === 200) {
      return cachedResponse.body.user;
    }
  }

  const response = await apiClient.auth.me.query();

  if (response.status !== 200) {
    setCurrentUser(null);
    return null;
  }

  setCurrentUser(response.body.user);
  return response.body.user;
}
