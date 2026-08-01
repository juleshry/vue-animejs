<script setup lang="ts">
  import { vSvgDrawable } from "@juleshry/vue-animejs"

  const circle_options = {
    draw: ["0 0", "0.5 1", "0 1"],
    duration: 1200,
    ease: "inOutQuad",
    direction: "alternate",
    loop: true,
  }

  const wave_options = {
    draw: "0 1",
    duration: 1800,
    ease: "outExpo",
    delay: 400,
    direction: "alternate",
    loop: true,
  }
</script>

<template>
  <div class="demo">
    <div class="demo-stage">
      <svg viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg" class="svg-canvas">
        <circle
          v-svg-drawable="circle_options"
          cx="60"
          cy="60"
          r="40"
          fill="none"
          stroke="var(--vp-c-brand-1)"
          stroke-width="4"
          stroke-linecap="round"
        />
        <path
          v-svg-drawable="wave_options"
          d="M120 60 C140 20, 160 100, 180 60 S220 20, 240 60 S270 100, 290 60"
          fill="none"
          stroke="var(--vp-c-brand-2)"
          stroke-width="4"
          stroke-linecap="round"
        />
      </svg>
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
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .svg-canvas {
    width: 100%;
    max-width: 320px;
    height: 120px;
  }
</style>