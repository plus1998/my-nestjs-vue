<script setup lang="ts">
import {
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastViewport,
} from "reka-ui";

import { cn } from "@/lib/utils";
import { useToast } from "@/composables/useToast";

const { dismissToast, toasts } = useToast();

function toastClassName(variant: "default" | "success" | "error") {
  switch (variant) {
    case "success":
      return "border-emerald-400/30 bg-emerald-500/12";
    case "error":
      return "border-red-400/30 bg-red-500/12";
    default:
      return "border-white/12 bg-[rgba(8,18,34,0.92)]";
  }
}
</script>

<template>
  <ToastProvider :duration="3200" swipe-direction="right">
    <ToastRoot
      v-for="toast in toasts"
      :key="toast.id"
      :class="
        cn(
          'grid w-[360px] gap-2 rounded-3xl border px-5 py-4 text-[var(--foreground)] shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl data-[state=open]:animate-in data-[state=closed]:animate-out',
          toastClassName(toast.variant),
        )
      "
      :open="toast.open"
      @update:open="(open) => !open && dismissToast(toast.id)"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="space-y-1">
          <ToastTitle class="text-sm font-semibold">
            {{ toast.title }}
          </ToastTitle>
          <ToastDescription
            v-if="toast.description"
            class="text-sm leading-6 text-[var(--muted-foreground)]"
          >
            {{ toast.description }}
          </ToastDescription>
        </div>

        <ToastClose
          class="shrink-0 rounded-full border border-white/10 px-2 py-1 text-xs text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
          aria-label="关闭提示"
        >
          关闭
        </ToastClose>
      </div>
    </ToastRoot>

    <ToastViewport class="fixed right-4 top-4 z-50 flex w-[calc(100vw-2rem)] max-w-[392px] flex-col gap-3 outline-none" />
  </ToastProvider>
</template>
