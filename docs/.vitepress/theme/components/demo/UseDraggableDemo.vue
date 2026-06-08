<script setup lang="ts">
  import { computed, useTemplateRef } from "vue"
  import { useDraggable } from "@juleshry/vue-animejs"
  import DemoSquare from "./shared/DemoSquare.vue"

  const box = useTemplateRef<InstanceType<typeof DemoSquare>>("box")
  const container = useTemplateRef<HTMLDivElement>("container")

  const options = computed(() => ({
    container: container.value,
    containerPadding: 10,
  }))

  const { disable, enable, reset } = useDraggable(box, options)
</script>

<template>
  <div class="demo">
    <div ref="container" class="demo-stage">
      <DemoSquare ref="box" />
    </div>
    <div class="demo-controls">
      <button class="demo-btn" @click="enable">Enable</button>
      <button class="demo-btn" @click="disable">Disable</button>
      <button class="demo-btn" @click="reset">Reset</button>
    </div>
  </div>
</template>

<style scoped>
  .demo {
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
    padding: 24px;
    margin: 24px 0;
  }

  .demo-stage {
    height: 160px;
    border: 1px dashed var(--vp-c-divider);
    border-radius: 6px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .demo-controls {
    display: flex;
    gap: 8px;
  }

  .demo-btn {
    padding: 6px 16px;
    border-radius: 6px;
    border: 1px solid var(--vp-c-divider);
    background: var(--vp-c-bg-soft);
    color: var(--vp-c-text-1);
    font-size: 14px;
    cursor: pointer;
    transition:
      border-color 0.2s,
      background 0.2s;
  }

  .demo-btn:hover {
    border-color: var(--vp-c-brand-1);
    background: var(--vp-c-bg-mute);
  }
</style>