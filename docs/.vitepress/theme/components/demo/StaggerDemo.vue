<script setup lang="ts">
  import { ref, useTemplateRef } from "vue"
  import { stagger as animeStagger } from "animejs"
  import { stagger, useAnimate } from "@juleshry/vue-animejs"

  const count = ref(6)
  const ours = useTemplateRef<HTMLElement>("ours")
  const theirs = useTemplateRef<HTMLElement>("theirs")

  // Read `count` so the getter re-runs (after the DOM update) when the list changes
  function dotsOf(row: HTMLElement | null): HTMLElement[] | undefined {
    return row && count.value ? (Array.from(row.children) as HTMLElement[]) : undefined
  }

  const options = { scale: [0, 1], opacity: [0, 1], duration: 500, ease: "outBack" }
  const { restart: restartOurs } = useAnimate(() => dotsOf(ours.value), { ...options, delay: stagger(80) })
  const { restart: restartTheirs } = useAnimate(() => dotsOf(theirs.value), { ...options, delay: animeStagger(80) })

  function replay() {
    restartOurs()
    restartTheirs()
  }
</script>

<template>
  <div class="demo">
    <div class="demo-row">
      <span class="demo-label">vue-animejs <code>stagger</code></span>
      <div ref="ours" class="demo-dots">
        <span v-for="i in count" :key="i" class="demo-dot" />
      </div>
    </div>
    <div class="demo-row">
      <span class="demo-label">Anime.js <code>stagger</code></span>
      <div ref="theirs" class="demo-dots">
        <span v-for="i in count" :key="i" class="demo-dot" />
      </div>
    </div>
    <div class="demo-controls">
      <button class="demo-btn" :disabled="count <= 2" @click="count -= 2">− 2 dots</button>
      <button class="demo-btn" :disabled="count >= 14" @click="count += 2">+ 2 dots</button>
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

  .demo-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    min-height: 32px;
    margin-bottom: 12px;
  }

  .demo-label {
    width: 170px;
    font-size: 14px;
    color: var(--vp-c-text-2);
  }

  .demo-dots {
    display: flex;
    gap: 8px;
  }

  .demo-dot {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--vp-c-brand-1);
  }

  .demo-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 16px;
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

  .demo-btn:hover:not(:disabled) {
    border-color: var(--vp-c-brand-1);
    background: var(--vp-c-bg-mute);
  }

  .demo-btn:disabled {
    opacity: 0.5;
    cursor: default;
  }
</style>