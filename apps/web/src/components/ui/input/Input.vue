<script setup lang="ts">
import { useAttrs } from "vue";

import { cn } from "@/lib/utils";

defineOptions({
  inheritAttrs: false,
});

const modelValue = defineModel<string>({
  default: "",
});

const props = withDefaults(
  defineProps<{
    class?: string;
    type?: string;
  }>(),
  {
    type: "text",
  },
);

const attrs = useAttrs();
</script>

<template>
  <input
    v-model="modelValue"
    v-bind="attrs"
    :class="
      cn(
        'flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted-foreground)] hover:border-slate-300 focus:border-[var(--primary)] focus:bg-white focus:ring-2 focus:ring-[var(--ring)]',
        props.class,
      )
    "
    :type="props.type"
  />
</template>
