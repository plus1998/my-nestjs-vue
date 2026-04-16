<script setup lang="ts">
import { TabsTrigger } from "reka-ui";

import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: string;
  value: string | number;
  disabled?: boolean;
}>();
</script>

<template>
  <TabsTrigger
    :disabled="props.disabled"
    :class="
      cn(
        'flex h-10 min-h-10 flex-1 basis-0 items-center justify-center rounded-[var(--radius-tab)] px-3 text-sm font-medium text-slate-600 outline-none transition-colors data-[state=active]:bg-white/92 data-[state=active]:text-[var(--primary)] data-[state=active]:shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_4px_14px_-4px_rgb(15_23_42/0.12)]',
        props.class,
      )
    "
    :value="props.value"
  >
    <slot />
  </TabsTrigger>
</template>
