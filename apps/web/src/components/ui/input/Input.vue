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
        'flex h-11 w-full rounded-2xl border border-white/12 bg-white/6 px-4 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)] focus:bg-white/10',
        props.class,
      )
    "
    :type="props.type"
  />
</template>
