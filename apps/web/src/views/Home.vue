<script setup lang="ts">
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
} from "lucide-vue-next";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/composables/useAuthSession";

const router = useRouter();
const { user, logout, refreshProfile, isAuthenticated, isProfileLoading } =
  useAuthSession();

const SIDEBAR_KEY = "app-sidebar-collapsed";

const collapsed = ref(false);
const userMenuOpen = ref(false);
const userDropdownRoot = ref<HTMLElement | null>(null);

const userInitials = computed(() => {
  const name = user.value?.username?.trim();
  if (!name) {
    return "…";
  }
  return name.slice(0, 1).toUpperCase();
});

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

function onDocumentClick(ev: MouseEvent) {
  const root = userDropdownRoot.value;
  if (root && !root.contains(ev.target as Node)) {
    userMenuOpen.value = false;
  }
}

onMounted(() => {
  if (localStorage.getItem(SIDEBAR_KEY) === "1") {
    collapsed.value = true;
  }
  document.addEventListener("click", onDocumentClick);
});

onUnmounted(() => {
  document.removeEventListener("click", onDocumentClick);
});

watch(collapsed, (v) => {
  localStorage.setItem(SIDEBAR_KEY, v ? "1" : "0");
});

function toggleUserMenu(ev: MouseEvent) {
  ev.stopPropagation();
  userMenuOpen.value = !userMenuOpen.value;
}

async function handleLogout() {
  userMenuOpen.value = false;
  await logout();
  await router.replace("/login");
}

async function handleMenuRefresh() {
  userMenuOpen.value = false;
  try {
    await refreshProfile();
  } catch {
    // 保持当前界面，等待下次成功刷新
  }
}
</script>

<template>
  <div class="app-shell-bg text-[var(--foreground)]">
    <aside
      :class="[
        'glass-edge fixed bottom-0 left-0 top-0 z-[101] flex flex-col border-r border-slate-200/35 transition-[width] duration-200',
        collapsed ? 'w-20' : 'w-60',
      ]"
    >
      <div
        :class="[
          'flex h-16 shrink-0 items-center border-b border-slate-100',
          collapsed ? 'justify-center px-0' : 'px-6',
        ]"
      >
        <div class="flex items-center gap-3 overflow-hidden">
          <img
            src="/logo.svg"
            alt=""
            class="h-9 w-9 shrink-0 object-contain"
            width="36"
            height="36"
          />
          <div v-if="!collapsed" class="min-w-0">
            <p class="truncate text-base font-semibold text-slate-900">
              应用控制台
            </p>
          </div>
        </div>
      </div>

      <nav class="min-h-0 flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-2">
        <button
          type="button"
          class="flex w-full cursor-default items-center gap-3 rounded-lg bg-indigo-50 py-2.5 text-sm font-medium text-[var(--primary)] transition-colors"
          :class="collapsed ? 'justify-center px-0' : 'px-3'"
          :title="collapsed ? '工作台' : undefined"
        >
          <LayoutDashboard class="h-5 w-5 shrink-0" aria-hidden="true" />
          <span v-if="!collapsed" class="truncate">工作台</span>
        </button>
      </nav>
    </aside>

    <div
      :class="[
        'min-h-screen transition-[margin] duration-200',
        collapsed ? 'ml-20' : 'ml-60',
      ]"
    >
      <header
        class="glass-edge sticky top-0 z-[100] flex h-16 items-center justify-between border-b border-slate-200/35 px-2 shadow-[0_1px_2px_0_rgb(0_0_0/0.03)]"
      >
        <div class="flex min-w-0 flex-1 items-center">
          <button
            type="button"
            class="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100"
            :aria-label="collapsed ? '展开菜单' : '收起菜单'"
            @click="collapsed = !collapsed"
          >
            <PanelLeftClose v-if="!collapsed" class="h-5 w-5" />
            <PanelLeftOpen v-else class="h-5 w-5" />
          </button>

          <nav
            class="hidden min-w-0 items-center gap-2 text-sm text-slate-500 sm:flex"
            aria-label="面包屑"
          >
            <span>首页</span>
            <span class="text-slate-300">/</span>
            <span class="truncate font-medium text-slate-800">工作台</span>
          </nav>
        </div>

        <div ref="userDropdownRoot" class="relative flex shrink-0 items-center pr-2 sm:pr-4">
          <button
            type="button"
            class="flex max-w-[220px] items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-slate-100 sm:px-3"
            @click="toggleUserMenu"
          >
            <span
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700"
            >
              {{ userInitials }}
            </span>
            <span class="hidden min-w-0 flex-1 truncate text-sm font-medium text-slate-800 sm:block">
              {{ user?.username || "未登录" }}
            </span>
            <ChevronDown class="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
          </button>

          <div
            v-if="userMenuOpen"
            class="absolute right-2 top-full z-[110] mt-2 w-52 overflow-hidden rounded-xl border border-white/50 bg-white/85 py-1 shadow-lg backdrop-blur-xl backdrop-saturate-150"
            role="menu"
          >
            <button
              type="button"
              class="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
              role="menuitem"
              @click="handleMenuRefresh"
            >
              <RefreshCw class="h-4 w-4 text-slate-500" />
              {{ isProfileLoading ? "同步中…" : "刷新用户信息" }}
            </button>
            <div class="my-1 h-px bg-slate-100" />
            <button
              type="button"
              class="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
              role="menuitem"
              @click="handleLogout"
            >
              <LogOut class="h-4 w-4" />
              退出登录
            </button>
          </div>
        </div>
      </header>

      <main class="p-6">
        <section class="hero-panel overflow-hidden">
          <div class="space-y-6">
            <div class="space-y-4">
              <p class="eyebrow">工作台</p>
              <div class="space-y-3">
                <h1 class="max-w-2xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  欢迎回来
                </h1>
                <p class="max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                  {{
                    isProfileLoading
                      ? "正在同步账户信息…"
                      : "当前会话已就绪，可在下方查看账户摘要或刷新资料。"
                  }}
                </p>
              </div>
            </div>

            <div
              v-if="user"
              class="rounded-2xl border border-slate-100 bg-white px-5 py-5 shadow-sm"
            >
              <p class="text-sm text-slate-500">当前账户</p>
              <p class="mt-3 text-xl font-semibold text-slate-900">
                {{ user.username }}
              </p>
              <p class="mt-2 break-all text-xs text-slate-500">
                {{ user.id }}
              </p>
            </div>

            <div class="flex flex-wrap gap-3">
              <Button variant="secondary" @click="handleMenuRefresh">
                刷新
              </Button>
              <Button @click="handleLogout">退出登录</Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>
