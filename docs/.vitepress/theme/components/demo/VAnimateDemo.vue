<script setup lang="ts">
  import { computed } from "vue"
  import { vAnimate } from "@juleshry/vue-animejs"
  import DemoSquare from "./shared/DemoSquare.vue"

  const options = computed(() => ({
    translateX: 200,
    duration: 1000,
    ease: "inOutQuad",
    loop: true,
    alternate: true,
  }))
</script>

<template>
  <div class="demo">
    <div class="demo-stage">
      <DemoSquare v-animate="options" />
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
</style>