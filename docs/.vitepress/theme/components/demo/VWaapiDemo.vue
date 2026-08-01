<script setup lang="ts">
  import { computed } from "vue"
  import { vWaapi } from "@juleshry/vue-animejs"
  import DemoSquare from "./shared/DemoSquare.vue"

  const options = computed(() => ({
    translate: "200px",
    duration: 1000,
    ease: "ease-in-out",
    loop: true,
    alternate: true,
  }))
</script>

<template>
  <div class="demo">
    <div class="demo-stage">
      <DemoSquare v-waapi="options" />
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