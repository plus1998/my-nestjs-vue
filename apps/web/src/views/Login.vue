<script setup lang="ts">
import { reactive, shallowRef } from "vue";
import { useRouter } from "vue-router";
import { LockKeyhole, MessageSquare, UserRound } from "lucide-vue-next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuthSession } from "@/composables/useAuthSession";
import type { LoginPayload, RegisterPayload } from "@/lib/auth-api";
import { useToast } from "@/composables/useToast";

const router = useRouter();
const {
  login,
  register,
  isBusy,
  loginErrorMessage,
  registerErrorMessage,
} = useAuthSession();
const { toast } = useToast();

const mode = shallowRef<"login" | "register">("login");

const loginForm = reactive<LoginPayload>({
  username: "",
  password: "",
});

const registerForm = reactive<RegisterPayload>({
  username: "",
  password: "",
});

async function handleRegister() {
  try {
    await register({
      username: registerForm.username.trim(),
      password: registerForm.password,
    });

    loginForm.username = registerForm.username.trim();
    loginForm.password = registerForm.password;
    mode.value = "login";
    toast({
      title: "注册成功",
      description: "请使用刚刚创建的账户登录。",
      variant: "success",
    });
  } catch {
    // 错误文案由 useAuthSession 维护
  }
}

async function handleLogin() {
  try {
    await login({
      username: loginForm.username.trim(),
      password: loginForm.password,
    });

    await router.push("/");
  } catch {
    // 错误文案由 useAuthSession 维护
  }
}
</script>

<template>
  <div class="auth-page-gradient text-slate-800">
    <div class="auth-glass-card px-6 pb-8 pt-10 sm:px-8">
      <div class="mb-8 text-center">
        <div
          class="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary)] text-white shadow-md"
        >
          <MessageSquare class="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 class="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          应用控制台
        </h1>
        <p class="mt-2 text-[15px] text-slate-500">
          登录后可管理账户与系统入口
        </p>
      </div>

      <TabsRoot v-model:model-value="mode">
        <TabsList class="w-full">
          <TabsTrigger value="login">登录</TabsTrigger>
          <TabsTrigger value="register">注册</TabsTrigger>
        </TabsList>

        <TabsContent class="auth-fade-in space-y-4 pt-6" value="register">
          <form class="space-y-4" @submit.prevent="handleRegister">
            <label class="block space-y-2">
              <span class="text-sm font-medium text-slate-700">用户名</span>
              <div class="relative">
                <UserRound
                  class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <Input
                  v-model="registerForm.username"
                  class="h-12 pl-10"
                  placeholder="请输入用户名"
                />
              </div>
            </label>

            <label class="block space-y-2">
              <span class="text-sm font-medium text-slate-700">密码</span>
              <div class="relative">
                <LockKeyhole
                  class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <Input
                  v-model="registerForm.password"
                  class="h-12 pl-10"
                  placeholder="请输入密码"
                  type="password"
                />
              </div>
            </label>

            <p
              v-if="registerErrorMessage"
              class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {{ registerErrorMessage }}
            </p>

            <Button class="h-12 w-full shadow-md" :disabled="isBusy" size="lg" type="submit">
              {{ isBusy ? "提交中..." : "创建账户" }}
            </Button>
          </form>
        </TabsContent>

        <TabsContent class="auth-fade-in space-y-4 pt-6" value="login">
          <form class="space-y-4" @submit.prevent="handleLogin">
            <label class="block space-y-2">
              <span class="text-sm font-medium text-slate-700">用户名</span>
              <div class="relative">
                <UserRound
                  class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <Input
                  v-model="loginForm.username"
                  class="h-12 pl-10"
                  placeholder="请输入用户名"
                />
              </div>
            </label>

            <label class="block space-y-2">
              <span class="text-sm font-medium text-slate-700">密码</span>
              <div class="relative">
                <LockKeyhole
                  class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <Input
                  v-model="loginForm.password"
                  class="h-12 pl-10"
                  placeholder="请输入密码"
                  type="password"
                />
              </div>
            </label>

            <p
              v-if="loginErrorMessage"
              class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {{ loginErrorMessage }}
            </p>

            <Button class="h-12 w-full shadow-md" :disabled="isBusy" size="lg" type="submit">
              {{ isBusy ? "登录中..." : "立即登录" }}
            </Button>
          </form>
        </TabsContent>
      </TabsRoot>
    </div>
  </div>
</template>
