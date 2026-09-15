<script setup lang="ts">
  import { onMounted, useTemplateRef } from "vue"
  import { useRawAnimatable, type UseRawAnimatableReturn } from "@juleshry/vue-animejs"
  import DemoSquare from "./shared/DemoSquare.vue"

  const box_ref = useTemplateRef<InstanceType<typeof DemoSquare>>("box")
  let animatable: UseRawAnimatableReturn

  onMounted(() => {
    animatable = useRawAnimatable(box_ref, {
      x: 220,
      ease: "out(3)",
    })
  })

  function move() {
    animatable?.x(220)
  }

  function reset() {
    animatable?.x(0)
  }
</script>

<template>
  <div class="demo">
    <div class="demo-stage">
      <DemoSquare ref="box" />
    </div>
    <div class="demo-controls">
      <button class="demo-btn" @click="move">Move</button>
      <button class="demo-btn" @click="reset">Reset</button>
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