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
        'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] transition-all outline-none data-[state=active]:bg-[var(--primary)] data-[state=active]:text-[var(--primary-foreground)]',
        props.class,
      )
    "
    :value="props.value"
  >
    <slot />
  </TabsTrigger>
</template>
