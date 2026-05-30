<script setup lang="ts">
  import { useTemplateRef } from "vue"
  import { useTimeline } from "@juleshry/vue-animejs"
  import DemoSquare from "./DemoSquare.vue"

  const box1 = useTemplateRef<InstanceType<typeof DemoSquare>>("box1")
  const box2 = useTemplateRef<InstanceType<typeof DemoSquare>>("box2")
  const box3 = useTemplateRef<InstanceType<typeof DemoSquare>>("box3")

  const { add, play, pause, restart } = useTimeline({ autoplay: false })

  add(box1, { translateX: 220, duration: 600, ease: "outExpo" })
    .add(box2, { translateX: 220, duration: 600, ease: "outExpo" }, "-=400")
    .add(box3, { translateX: 220, duration: 600, ease: "outExpo" }, "-=400")
</script>

<template>
  <div class="demo">
    <div class="demo-stage">
      <DemoSquare ref="box1" :variant="0" />
      <DemoSquare ref="box2" :variant="1" />
      <DemoSquare ref="box3" :variant="2" />
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