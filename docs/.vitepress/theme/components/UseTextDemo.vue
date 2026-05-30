<script setup lang="ts">
  import { Target } from "animejs"
  import { useTemplateRef } from "vue"
  import { useAnimate, useText } from "@juleshry/vue-animejs"

  const text_el = useTemplateRef<HTMLParagraphElement>("textEl")
  const { chars } = useText(text_el, { chars: true })

  const { restart, pause } = useAnimate(chars, {
    translateY: [-24, 0],
    opacity: [0, 1],
    duration: 700,
    delay: (_: Target, i: number) => i * 50,
    ease: "outExpo",
    autoplay: true,
  })
</script>

<template>
  <div class="demo">
    <div class="demo-stage">
      <p ref="textEl" class="demo-text">Hello, vue-animejs!</p>
    </div>
    <div class="demo-controls">
      <button class="demo-btn" @click="restart">Restart</button>
      <button class="demo-btn" @click="pause">Pause</button>
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

  .demo-text {
    font-size: 22px;
    font-weight: 600;
    margin: 0;
    color: var(--vp-c-text-1);
    letter-spacing: 0.01em;
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