<script setup lang="ts">
  import { onMounted, useTemplateRef } from "vue"
  import { useRawAnimate } from "@juleshry/vue-animejs"

  const box = useTemplateRef<HTMLElement>("box")
  let animation: ReturnType<typeof useRawAnimate> | null = null

  onMounted(() => {
    animation = useRawAnimate(box.value!, {
      translateX: 220,
      duration: 1000,
      easing: "easeInOutQuad",
      autoplay: false,
    })
  })

  function play() {
    animation?.play()
  }

  function pause() {
    animation?.pause()
  }

  function restart() {
    animation?.restart()
  }
</script>

<template>
  <div class="demo">
    <div class="demo-stage">
      <div ref="box" class="demo-box" />
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

  .demo-box {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
    flex-shrink: 0;
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