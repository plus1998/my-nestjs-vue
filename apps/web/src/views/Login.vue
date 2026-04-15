<script setup lang="ts">
import { reactive, shallowRef } from "vue";
import { useRouter } from "vue-router";
import { LockKeyhole, UserRound } from "lucide-vue-next";

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
    // Error state is managed by the auth composable.
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
    // Error state is managed by the auth composable.
  }
}
</script>

<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,185,66,0.16),_transparent_28%),linear-gradient(135deg,_#08111d_0%,_#13233d_52%,_#113b3a_100%)] px-6 py-12 text-[var(--foreground)]">
    <div class="mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl items-center justify-center">
      <section class="grid w-full overflow-hidden rounded-[36px] border border-white/10 bg-[rgba(4,12,24,0.72)] shadow-[0_36px_100px_rgba(0,0,0,0.38)] backdrop-blur-[18px] lg:grid-cols-[1.05fr_0.95fr]">
        <div class="hidden flex-col justify-between bg-[linear-gradient(160deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-10 lg:flex">
          <div class="space-y-4">
            <div class="space-y-3">
              <h1 class="text-4xl font-semibold leading-tight tracking-[-0.05em]">
                欢迎登录
              </h1>
              <p class="max-w-sm text-sm leading-7 text-[var(--muted-foreground)]">
                输入用户名和密码即可继续使用。
              </p>
            </div>
          </div>

          <div class="space-y-3 rounded-[28px] border border-white/10 bg-black/10 p-6">
            <p class="text-sm text-[var(--muted-foreground)]">账户访问</p>
            <p class="text-2xl font-semibold tracking-[-0.04em]">安全、直接、清晰</p>
          </div>
        </div>

        <div class="p-6 sm:p-8 lg:p-10">
          <div class="mx-auto max-w-md space-y-8">
            <TabsRoot v-model:model-value="mode" class="space-y-6">
              <div class="space-y-3">
                <TabsList>
                  <TabsTrigger value="login">登录</TabsTrigger>
                  <TabsTrigger value="register">注册</TabsTrigger>
                </TabsList>

                <div class="space-y-1">
                  <h2 class="text-3xl font-semibold tracking-[-0.04em]">
                    {{ mode === "register" ? "创建账户" : "欢迎回来" }}
                  </h2>
                  <p class="text-sm text-[var(--muted-foreground)]">
                    {{ mode === "register" ? "填写信息后即可开始使用。" : "输入账号信息继续访问。" }}
                  </p>
                </div>
              </div>

              <TabsContent class="space-y-4" value="register">
                <form class="space-y-4" @submit.prevent="handleRegister">
                  <label class="block space-y-2">
                    <span class="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                      <UserRound class="h-4 w-4" />
                      用户名
                    </span>
                    <Input
                      v-model="registerForm.username"
                      placeholder="请输入用户名"
                    />
                  </label>

                  <label class="block space-y-2">
                    <span class="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                      <LockKeyhole class="h-4 w-4" />
                      密码
                    </span>
                    <Input
                      v-model="registerForm.password"
                      placeholder="请输入密码"
                      type="password"
                    />
                  </label>

                  <p
                    v-if="registerErrorMessage"
                    class="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100"
                  >
                    {{ registerErrorMessage }}
                  </p>

                  <Button class="w-full" :disabled="isBusy" size="lg" type="submit">
                    {{ isBusy ? "提交中..." : "立即注册" }}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent class="space-y-4" value="login">
                <form class="space-y-4" @submit.prevent="handleLogin">
                  <label class="block space-y-2">
                    <span class="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                      <UserRound class="h-4 w-4" />
                      用户名
                    </span>
                    <Input
                      v-model="loginForm.username"
                      placeholder="请输入用户名"
                    />
                  </label>

                  <label class="block space-y-2">
                    <span class="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                      <LockKeyhole class="h-4 w-4" />
                      密码
                    </span>
                    <Input
                      v-model="loginForm.password"
                      placeholder="请输入密码"
                      type="password"
                    />
                  </label>

                  <p
                    v-if="loginErrorMessage"
                    class="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100"
                  >
                    {{ loginErrorMessage }}
                  </p>

                  <Button class="w-full" :disabled="isBusy" size="lg" type="submit">
                    {{ isBusy ? "登录中..." : "登录" }}
                  </Button>
                </form>
              </TabsContent>
            </TabsRoot>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
