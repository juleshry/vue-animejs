<script setup lang="ts">
  import { useTemplateRef } from "vue"

  import type { DemoSquareVariant } from "./Types"

  withDefaults(
    defineProps<{
      variant?: DemoSquareVariant
    }>(),
    { variant: 0 }
  )

  const el = useTemplateRef<HTMLDivElement>("el")

  defineExpose({
    get $el() {
      return el.value
    },
  })
</script>

<template>
  <div ref="el" class="demo-square" :class="`variant-${variant}`">
    <slot />
  </div>
</template>

<style scoped>
  .demo-square {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    color: white;
  }

  .variant-0 {
    background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  }

  .variant-1 {
    background: linear-gradient(135deg, var(--vp-c-brand-2), var(--vp-c-brand-3));
    opacity: 0.85;
  }

  .variant-2 {
    background: linear-gradient(135deg, var(--vp-c-brand-3), var(--vp-c-brand-1));
    opacity: 0.7;
  }
</style>