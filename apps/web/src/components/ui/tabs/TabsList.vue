<script setup lang="ts">
import { TabsList } from "reka-ui";

import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: string;
}>();
</script>

<template>
  <TabsList
    :class="
      cn(
        'flex w-full gap-1 rounded-[var(--radius-tab)] border border-white/50 bg-slate-100/55 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-md backdrop-saturate-150',
        props.class,
      )
    "
  >
    <slot />
  </TabsList>
</template>
