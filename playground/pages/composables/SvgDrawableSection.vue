<script setup lang="ts">
  import { useTemplateRef } from "vue"
  import { useAnimate, useSvgDrawable } from "@lib"
  import SectionWrapper from "../../components/SectionWrapper.vue"

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
  <SectionWrapper>
    <template #title>useSvgDrawable</template>
    <svg viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg" class="svg-canvas">
      <circle
        ref="circle"
        cx="60"
        cy="60"
        r="40"
        fill="none"
        stroke="#5350ff"
        stroke-width="4"
        stroke-linecap="round"
      />
      <path
        ref="wave"
        d="M120 60 C140 20, 160 100, 180 60 S220 20, 240 60 S270 100, 290 60"
        fill="none"
        stroke="#5350ff"
        stroke-width="4"
        stroke-linecap="round"
        opacity="0.6"
      />
    </svg>
    <button @click="replay">Replay</button>
  </SectionWrapper>
</template>

<style lang="postcss" scoped>
  .svg-canvas {
    width: 100%;
    max-width: 320px;
    height: 120px;
  }

  button {
    width: fit-content;
    cursor: pointer;
  }
</style>