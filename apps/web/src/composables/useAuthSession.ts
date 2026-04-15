import { computed, readonly, shallowRef } from "vue";

import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  type AuthSessionResponse,
  type AuthUser,
  type LoginPayload,
  type RegisterPayload,
} from "@/lib/auth-api";
import { ApiError } from "@/lib/fetch-client";

const currentUser = shallowRef<AuthUser | null>(null);
const hasResolvedProfile = shallowRef(false);
const isProfileLoading = shallowRef(false);
const isLoggingIn = shallowRef(false);
const isRegistering = shallowRef(false);
const isLoggingOut = shallowRef(false);
const loginErrorMessage = shallowRef("");
const registerErrorMessage = shallowRef("");

const isAuthenticated = computed(() => currentUser.value !== null);
const isBusy = computed(
  () =>
    isLoggingIn.value || isRegistering.value || isLoggingOut.value,
);

let profileRequest: Promise<AuthUser | null> | null = null;
let profileRequestId = 0;

async function ensureCurrentUser(force = false) {
  if (!force && hasResolvedProfile.value) {
    return currentUser.value;
  }

  if (profileRequest) {
    return profileRequest;
  }

  isProfileLoading.value = true;

  const requestId = ++profileRequestId;
  const request = (async () => {
    try {
      const response = await getCurrentUser();

      if (requestId === profileRequestId) {
        currentUser.value = response.user;
        hasResolvedProfile.value = true;

        return response.user;
      }

      return currentUser.value;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        if (requestId === profileRequestId) {
          currentUser.value = null;
          hasResolvedProfile.value = true;
        }

        return null;
      }

      throw error;
    } finally {
      if (requestId === profileRequestId) {
        isProfileLoading.value = false;
        profileRequest = null;
      }
    }
  })();

  profileRequest = request;
  return request;
}

async function refreshProfile() {
  return ensureCurrentUser(true);
}

async function login(credentials: LoginPayload): Promise<AuthSessionResponse> {
  loginErrorMessage.value = "";
  isLoggingIn.value = true;

  try {
    const response = await loginRequest(credentials);

    currentUser.value = response.user;
    hasResolvedProfile.value = true;

    return response;
  } catch (error) {
    loginErrorMessage.value = getErrorMessage(
      error,
      "登录失败，请检查用户名和密码。",
    );
    throw error;
  } finally {
    isLoggingIn.value = false;
  }
}

async function register(
  payload: RegisterPayload,
): Promise<AuthSessionResponse> {
  registerErrorMessage.value = "";
  isRegistering.value = true;

  try {
    return await registerRequest(payload);
  } catch (error) {
    registerErrorMessage.value = getErrorMessage(
      error,
      "注册失败，请稍后再试。",
    );
    throw error;
  } finally {
    isRegistering.value = false;
  }
}

async function logout() {
  isLoggingOut.value = true;

  try {
    await logoutRequest();
  } finally {
    profileRequestId += 1;
    profileRequest = null;
    isProfileLoading.value = false;
    isLoggingOut.value = false;
    currentUser.value = null;
    hasResolvedProfile.value = true;
    loginErrorMessage.value = "";
    registerErrorMessage.value = "";
  }
}

const authSession = {
  ensureCurrentUser,
  refreshProfile,
  login,
  register,
  logout,
  user: readonly(currentUser),
  isAuthenticated,
  isBusy,
  isProfileLoading: readonly(isProfileLoading),
  loginErrorMessage: readonly(loginErrorMessage),
  registerErrorMessage: readonly(registerErrorMessage),
};

export function useAuthSession() {
  return authSession;
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiError && error.message.length > 0) {
    return error.message;
  }

  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return fallbackMessage;
}
