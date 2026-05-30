<script setup lang="ts">
  import { computed, useTemplateRef } from "vue"
  import { useAnimate } from "@juleshry/vue-animejs"
  import DemoSquare from "./DemoSquare.vue"

  const box = useTemplateRef<InstanceType<typeof DemoSquare>>("box")

  const { play, pause, restart } = useAnimate(box, {
    translateX: 220,
    duration: 1000,
    ease: "inOutQuad",
    autoplay: false,
  })
</script>

<template>
  <div class="demo">
    <div class="demo-stage">
      <DemoSquare ref="box" />
    </div>
    <div class="demo-controls">
      <button class="demo-btn" @click="play">Play</button>
      <button class="demo-btn" @click="pause">Pause</button>
      <button class="demo-btn" @click="restart">Restart</button>
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
    height: 64px;
    display: flex;
    align-items: center;
    margin-bottom: 16px;
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