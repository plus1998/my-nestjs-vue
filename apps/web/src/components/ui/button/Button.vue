<script setup lang="ts">
import type { ButtonHTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { buttonVariants, type ButtonVariants } from "./button-variants";

interface ButtonProps extends /* @vue-ignore */ ButtonHTMLAttributes {
  class?: string;
  variant?: ButtonVariants["variant"];
  size?: ButtonVariants["size"];
}

const props = withDefaults(defineProps<ButtonProps>(), {
  type: "button",
  variant: "default",
  size: "default",
});
</script>

<template>
  <button
    :class="cn(buttonVariants({ variant: props.variant, size: props.size }), props.class)"
    :disabled="props.disabled"
    :type="props.type"
  >
    <slot />
  </button>
</template>
