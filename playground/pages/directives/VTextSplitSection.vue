<script setup lang="ts">
  import { computed, ref } from "vue"
  import { stagger } from "animejs"
  import { vTextSplit } from "@lib"
  import SectionWrapper from "../../components/SectionWrapper.vue"

  const char_options = {
    chars: true,
    animation: {
      translateY: [-20, 0],
      opacity: [0, 1],
      duration: 600,
      ease: "outExpo",
      delay: stagger(40),
    },
  }

  const word_duration = ref(500)
  const word_options = computed(() => ({
    words: true,
    animation: {
      translateY: [30, 0],
      opacity: [0, 1],
      duration: word_duration.value,
      ease: "outBack(1.5)",
      delay: stagger(80),
    },
  }))

  const line_options = {
    lines: true,
    animation: {
      translateX: [-40, 0],
      opacity: [0, 1],
      duration: 700,
      ease: "outCubic",
      delay: stagger(120),
    },
  }
</script>

<template>
  <SectionWrapper>
    <template #title>v-text-split</template>

    <p class="label">By character</p>
    <div class="demo-box">
      <p v-text-split="char_options" class="demo-text">Vue + Anime.js</p>
    </div>

    <p class="label">By word — reactive duration</p>
    <div class="demo-box">
      <p v-text-split="word_options" class="demo-text large">Animate every word</p>
    </div>
    <div class="controls">
      <label>Duration: {{ word_duration }}ms</label>
      <input type="range" min="100" max="1200" step="50" v-model.number="word_duration" />
    </div>

    <p class="label">By line</p>
    <div class="demo-box demo-box--narrow">
      <p v-text-split="line_options" class="demo-text multiline">
        Split text into lines. Each line slides in. Powered by Anime.js.
      </p>
    </div>
  </SectionWrapper>
</template>

<style lang="postcss" scoped>
  .demo-box--narrow .demo-text {
    max-width: 220px;
  }

  .demo-box {
    background: #1a1a2e;
    border: 1px solid #2a2a4a;
    border-radius: 8px;
    padding: 24px 20px;
    overflow: hidden;
  }

  .demo-text {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
    color: #afaeff;
    line-height: 1.4;

    &.large {
      font-size: 28px;
    }

    &.multiline {
      font-size: 18px;
    }
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