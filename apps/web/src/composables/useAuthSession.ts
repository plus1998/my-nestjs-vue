import { computed, shallowRef } from "vue";

import type { LoginBody, RegisterBody } from "@my-nestjs-vue/api-contract";

import {
  AUTH_ME_QUERY_KEY,
  apiClient,
  queryClient,
  setCurrentUser,
} from "@/lib/api-client";

export function useAuthSession() {
  const loginErrorMessage = shallowRef("");
  const registerErrorMessage = shallowRef("");

  const profileQuery = apiClient.auth.me.useQuery(AUTH_ME_QUERY_KEY, undefined, {
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = apiClient.auth.login.useMutation({
    onError: (error) => {
      loginErrorMessage.value = getErrorMessage(
        error,
        "登录失败，请检查用户名和密码。",
      );
    },
  });

  const registerMutation = apiClient.auth.register.useMutation({
    onError: (error) => {
      registerErrorMessage.value = getErrorMessage(
        error,
        "注册失败，请稍后再试。",
      );
    },
  });

  const logoutMutation = apiClient.auth.logout.useMutation();

  const user = computed(() => profileQuery.data.value?.body.user ?? null);
  const isAuthenticated = computed(() => user.value !== null);
  const isBusy = computed(
    () =>
      loginMutation.isLoading.value ||
      registerMutation.isLoading.value ||
      logoutMutation.isLoading.value,
  );

  async function login(credentials: LoginBody) {
    loginErrorMessage.value = "";

    const response = await loginMutation.mutateAsync({
      body: credentials,
    });
    setCurrentUser(response.body.user);
    return response.body;
  }

  async function register(payload: RegisterBody) {
    registerErrorMessage.value = "";

    const response = await registerMutation.mutateAsync({
      body: payload,
    });

    return response.body;
  }

  async function clearSession() {
    await logoutMutation.mutateAsync({
      body: {},
    });
    setCurrentUser(null);
    loginErrorMessage.value = "";
    registerErrorMessage.value = "";
    queryClient.removeQueries({
      queryKey: AUTH_ME_QUERY_KEY,
    });
  }

  return {
    login,
    register,
    logout: clearSession,
    refreshProfile: () => profileQuery.refetch(),
    profileQuery,
    user,
    isBusy,
    isAuthenticated,
    loginErrorMessage,
    registerErrorMessage,
  };
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "body" in error &&
    typeof error.body === "object" &&
    error.body !== null &&
    "message" in error.body &&
    typeof error.body.message === "string"
  ) {
    return error.body.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "body" in error &&
    typeof error.body === "object" &&
    error.body !== null &&
    "bodyResult" in error.body &&
    typeof error.body.bodyResult === "object" &&
    error.body.bodyResult !== null &&
    "issues" in error.body.bodyResult &&
    Array.isArray(error.body.bodyResult.issues)
  ) {
    const [firstIssue] = error.body.bodyResult.issues as Array<{
      code?: string;
      minimum?: number;
      message?: string;
      path?: string[];
    }>;

    if (!firstIssue) {
      return fallbackMessage;
    }

    const fieldName = getFieldLabel(firstIssue.path?.[0]);

    if (firstIssue.code === "too_small" && typeof firstIssue.minimum === "number") {
      return `${fieldName}至少需要 ${firstIssue.minimum} 个字符`;
    }

    if (typeof firstIssue.message === "string" && firstIssue.message.length > 0) {
      return `${fieldName}${firstIssue.message}`;
    }
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return fallbackMessage;
}

function getFieldLabel(field?: string) {
  switch (field) {
    case "username":
      return "用户名";
    case "password":
      return "密码";
    default:
      return "输入内容";
  }
}
