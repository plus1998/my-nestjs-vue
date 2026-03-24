<script setup lang="ts">
import { TabsContent } from "reka-ui";

import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: string;
  value: string | number;
  forceMount?: boolean;
}>();
</script>

<template>
  <TabsContent
    :class="
      cn(
        'mt-0 outline-none',
        props.class,
      )
    "
    :force-mount="props.forceMount"
    :value="props.value"
  >
    <slot />
  </TabsContent>
</template>
