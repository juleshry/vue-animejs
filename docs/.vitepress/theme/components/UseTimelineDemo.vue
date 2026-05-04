<script setup lang="ts">
  import { useTemplateRef } from "vue"
  import { useTimeline } from "vue-animejs"

  const box1 = useTemplateRef("box1")
  const box2 = useTemplateRef("box2")
  const box3 = useTemplateRef("box3")

  const { add, play, pause, restart } = useTimeline({ autoplay: false })

  add(box1, { translateX: 220, duration: 600, easing: "easeOutExpo" })
    .add(box2, { translateX: 220, duration: 600, easing: "easeOutExpo" }, "-=400")
    .add(box3, { translateX: 220, duration: 600, easing: "easeOutExpo" }, "-=400")
</script>

<template>
  <div class="demo">
    <div class="demo-stage">
      <div class="demo-track">
        <div ref="box1" class="demo-box box-1" />
      </div>
      <div class="demo-track">
        <div ref="box2" class="demo-box box-2" />
      </div>
      <div class="demo-track">
        <div ref="box3" class="demo-box box-3" />
      </div>
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

  .demo-track {
    height: 44px;
    display: flex;
    align-items: center;
  }

  .demo-box {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    flex-shrink: 0;
  }

  .box-1 {
    background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  }

  .box-2 {
    background: linear-gradient(135deg, var(--vp-c-brand-2), var(--vp-c-brand-3));
    opacity: 0.85;
  }

  .box-3 {
    background: linear-gradient(135deg, var(--vp-c-brand-3), var(--vp-c-brand-1));
    opacity: 0.7;
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