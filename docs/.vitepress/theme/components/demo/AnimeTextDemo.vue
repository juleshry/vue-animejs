<script setup lang="ts">
  import { type Target } from "animejs"
  import { ref, useTemplateRef } from "vue"
  import { AnimeText, useAnimate } from "@juleshry/vue-animejs"

  const messages = ["Hello, vue-animejs!", "Split by AnimeText.", "New content, new split."]
  const index = ref(0)
  const text = useTemplateRef("text")

  const { restart } = useAnimate(() => text.value?.chars, {
    translateY: [-24, 0],
    opacity: [0, 1],
    duration: 700,
    delay: (_?: Target, i = 0) => i * 40,
    ease: "outExpo",
  })

  function next() {
    index.value = (index.value + 1) % messages.length
  }
</script>

<template>
  <div class="demo">
    <div class="demo-stage">
      <AnimeText ref="text" as="p" class="demo-text" :options="{ chars: true }">{{ messages[index] }}</AnimeText>
    </div>
    <div class="demo-controls">
      <button class="demo-btn" @click="next">Change text</button>
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

  .demo-text {
    font-size: 22px;
    font-weight: 600;
    margin: 0;
    color: var(--vp-c-text-1);
    letter-spacing: 0.01em;
  }

  .demo-controls {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
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