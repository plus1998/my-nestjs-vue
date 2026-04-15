<script setup lang="ts">
import { watch } from "vue";
import { useRouter } from "vue-router";

import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/composables/useAuthSession";

const router = useRouter();
const { user, logout, refreshProfile, isAuthenticated, isProfileLoading } =
  useAuthSession();

watch(
  () => isAuthenticated.value,
  async (authenticated) => {
    if (!authenticated) {
      await router.replace("/login");
    }
  },
  {
    immediate: true,
  },
);

async function handleLogout() {
  await logout();
  await router.replace("/login");
}

async function handleRefresh() {
  try {
    await refreshProfile();
  } catch {
    // Current screen can stay as-is until the next successful refresh.
  }
}
</script>

<template>
  <div class="min-h-screen bg-[linear-gradient(135deg,_#0f172a_0%,_#172554_50%,_#0f766e_100%)] px-6 py-12 text-[var(--foreground)]">
    <div class="mx-auto max-w-2xl">
      <section class="panel space-y-6">
        <div class="space-y-2">
          <h1 class="text-3xl font-semibold tracking-tight">首页</h1>
          <p class="text-sm text-[var(--muted-foreground)]">
            {{ isProfileLoading ? "加载用户信息中..." : "已登录。" }}
          </p>
        </div>

        <div
          v-if="user"
          class="rounded-[24px] border border-white/10 bg-black/10 p-5"
        >
          <p class="text-xl font-semibold">{{ user.username }}</p>
          <p class="mt-2 text-xs text-[var(--muted-foreground)]">{{ user.id }}</p>
        </div>

        <div class="flex gap-3">
          <Button variant="secondary" @click="handleRefresh">刷新</Button>
          <Button @click="handleLogout">退出登录</Button>
        </div>
      </section>
    </div>
  </div>
</template>
