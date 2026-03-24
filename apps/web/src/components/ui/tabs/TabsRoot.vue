<script setup lang="ts">
import { TabsRoot } from "reka-ui";

const props = defineProps<{
  class?: string;
  modelValue?: string;
  defaultValue?: string;
  orientation?: "horizontal" | "vertical";
  activationMode?: "automatic" | "manual";
  dir?: "ltr" | "rtl";
  disabled?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <TabsRoot
    :activation-mode="props.activationMode"
    :class="props.class"
    :default-value="props.defaultValue"
    :dir="props.dir"
    :disabled="props.disabled"
    :model-value="props.modelValue"
    :orientation="props.orientation"
    @update:model-value="(value) => emit('update:modelValue', value)"
  >
    <slot />
  </TabsRoot>
</template>
