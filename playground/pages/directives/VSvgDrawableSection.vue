<script setup lang="ts">
  import { computed, ref } from "vue"
  import { vSvgDrawable } from "@lib"
  import SectionWrapper from "../../components/SectionWrapper.vue"

  const circle_static = {
    draw: ["0 0", "0.5 1", "0 1"],
    duration: 1200,
    ease: "inOutQuad",
    direction: "alternate",
    loop: true,
  }

  const wave_static = {
    draw: "0 1",
    duration: 1800,
    ease: "outExpo",
    delay: 400,
    direction: "alternate",
    loop: true,
  }

  const duration = ref(1200)
  const wave_options = computed(() => ({
    draw: "0 1",
    duration: duration.value,
    ease: "outExpo",
    direction: "alternate",
    loop: true,
  }))
</script>

<template>
  <SectionWrapper>
    <template #title>v-svg-drawable</template>

    <p class="label">Static options</p>
    <svg viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg" class="svg-canvas">
      <circle
        v-svg-drawable="circle_static"
        cx="60"
        cy="60"
        r="40"
        fill="none"
        stroke="#5350ff"
        stroke-width="4"
        stroke-linecap="round"
      />
      <path
        v-svg-drawable="wave_static"
        d="M120 60 C140 20, 160 100, 180 60 S220 20, 240 60 S270 100, 290 60"
        fill="none"
        stroke="#5350ff"
        stroke-width="4"
        stroke-linecap="round"
        opacity="0.6"
      />
    </svg>

    <p class="label">Reactive options — change duration to re-create animation</p>
    <svg viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg" class="svg-canvas">
      <path
        v-svg-drawable="wave_options"
        d="M120 60 C140 20, 160 100, 180 60 S220 20, 240 60 S270 100, 290 60"
        fill="none"
        stroke="#5350ff"
        stroke-width="4"
        stroke-linecap="round"
        opacity="0.6"
      />
    </svg>
    <div class="controls">
      <label>Duration: {{ duration }}ms</label>
      <input type="range" min="200" max="3000" step="100" v-model.number="duration" />
    </div>
  </SectionWrapper>
</template>

<style lang="postcss" scoped>
  .svg-canvas {
    width: 100%;
    max-width: 320px;
    height: 120px;
  }

  .label {
    font-size: 13px;
    color: #888;
    margin: 0;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    color: #ccc;

    & input[type="range"] {
      width: 160px;
      accent-color: #afaeff;
    }
  }
</style>