<script setup lang="ts">
  import { computed, ref, useTemplateRef } from "vue"
  import { vDraggable } from "@juleshry/vue-animejs"
  import DemoSquare from "./shared/DemoSquare.vue"

  const container = useTemplateRef<HTMLDivElement>("container")

  const lockX = ref(false)
  const lockY = ref(false)

  const options = computed(() => ({
    container: container.value,
    containerPadding: 10,
    x: !lockX.value,
    y: !lockY.value,
  }))
</script>

<template>
  <div class="demo">
    <div ref="container" class="demo-stage">
      <DemoSquare v-draggable="options" />
    </div>
    <div class="demo-controls">
      <button class="demo-btn" :class="{ active: lockX }" @click="lockX = !lockX">Lock X</button>
      <button class="demo-btn" :class="{ active: lockY }" @click="lockY = !lockY">Lock Y</button>
    </div>
    <div class="demo-label">Drag the box around</div>
  </div>
</template>

<style scoped>
  .demo {
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
    margin: 24px 0;
    overflow: hidden;
  }

  .demo-stage {
    height: 160px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--vp-c-bg-soft);
  }

  .demo-label {
    padding: 10px;
    text-align: center;
    font-size: 13px;
    color: var(--vp-c-text-3);
  }

  .demo-controls {
    display: flex;
    gap: 8px;
    justify-content: center;
    padding: 10px 10px 0;
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

  .demo-btn.active {
    border-color: var(--vp-c-brand-1);
    background: var(--vp-c-brand-1);
    color: var(--vp-c-white);
  }
</style>