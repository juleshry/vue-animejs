<script setup lang="ts">
  import { useAnimate, useSvgDrawable } from "@juleshry/vue-animejs"
  import { useTemplateRef } from "vue"

  const circle_el = useTemplateRef<SVGCircleElement>("circle")
  const wave_el = useTemplateRef<SVGPathElement>("wave")

  const { drawable: drawable_circle } = useSvgDrawable(circle_el)
  const { drawable: drawable_wave } = useSvgDrawable(wave_el)

  const { restart: restartCircle } = useAnimate(drawable_circle, {
    draw: ["0 0", "0.5 1", "0 1"],
    duration: 1200,
    ease: "inOutQuad",
    autoplay: true,
    direction: "alternate",
  })

  const { restart: restartWave } = useAnimate(drawable_wave, {
    draw: "0 1",
    duration: 1800,
    ease: "outExpo",
    delay: 400,
    autoplay: true,
    direction: "alternate",
  })

  function replay() {
    restartCircle()
    restartWave()
  }
</script>

<template>
  <div class="demo">
    <div class="demo-stage">
      <svg viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg" class="svg-canvas">
        <circle
          ref="circle"
          cx="60"
          cy="60"
          r="40"
          fill="none"
          stroke="var(--vp-c-brand-1)"
          stroke-width="4"
          stroke-linecap="round"
        />
        <path
          ref="wave"
          d="M120 60 C140 20, 160 100, 180 60 S220 20, 240 60 S270 100, 290 60"
          fill="none"
          stroke="var(--vp-c-brand-2)"
          stroke-width="4"
          stroke-linecap="round"
        />
      </svg>
    </div>
    <div class="demo-controls">
      <button class="demo-btn" @click="replay">Replay</button>
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
    margin-bottom: 16px;
  }

  .svg-canvas {
    width: 100%;
    max-width: 320px;
    height: 120px;
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