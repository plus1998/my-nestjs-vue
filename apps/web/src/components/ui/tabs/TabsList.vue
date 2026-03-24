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
        'grid h-auto grid-cols-2 rounded-full bg-white/6 p-1',
        props.class,
      )
    "
  >
    <slot />
  </TabsList>
</template>
