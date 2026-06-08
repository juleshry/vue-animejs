<script setup lang="ts">
  import { ref } from "vue"
  import { useTimer } from "@juleshry/vue-animejs"

  const elapsed = ref(0)
  const progress = ref(0)

  const { play, pause, restart } = useTimer({
    duration: 3000,
    autoplay: false,
    onUpdate: timer => {
      elapsed.value = Math.round(timer.currentTime)
      progress.value = timer.progress
    },
    onComplete: () => {
      progress.value = 1
    },
  })
</script>

<template>
  <div class="demo">
    <div class="demo-stage">
      <div class="timer-bar-track">
        <div class="timer-bar-fill" :style="{ width: `${progress * 100}%` }" />
      </div>
      <span class="timer-label">{{ elapsed }} ms / 3000 ms</span>
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
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 16px;
  }

  .timer-bar-track {
    height: 10px;
    border-radius: 9999px;
    background: var(--vp-c-bg-mute);
    overflow: hidden;
  }

  .timer-bar-fill {
    height: 100%;
    border-radius: 9999px;
    background: linear-gradient(90deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
    transition: width 16ms linear;
  }

  .timer-label {
    font-size: 13px;
    color: var(--vp-c-text-2);
    font-variant-numeric: tabular-nums;
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