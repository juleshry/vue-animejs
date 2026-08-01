<script setup lang="ts">
  import { stagger } from "animejs"
  import { vTextSplit } from "@juleshry/vue-animejs"

  const options = {
    chars: true,
    animation: {
      translateY: [-24, 0],
      opacity: [0, 1],
      duration: 700,
      delay: stagger(50),
      ease: "inOutExpo",
      loop: true,
      alternate: true,
      loopDelay: 100,
    },
  }
</script>

<template>
  <div class="demo">
    <div class="demo-stage">
      <p v-text-split="options" class="demo-text">Hello, vue-animejs!</p>
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
  }

  .demo-text {
    font-size: 22px;
    font-weight: 600;
    margin: 0;
    color: var(--vp-c-text-1);
    letter-spacing: 0.01em;
  }
</style>