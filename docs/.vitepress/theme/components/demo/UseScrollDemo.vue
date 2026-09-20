<script setup lang="ts">
  import { useTemplateRef } from "vue"
  import { useScroll, useTimeline } from "@juleshry/vue-animejs"
  import DemoSquare from "./shared/DemoSquare.vue"

  const container = useTemplateRef<HTMLDivElement>("container")
  const target = useTemplateRef<HTMLDivElement>("target")
  const box = useTemplateRef<InstanceType<typeof DemoSquare>>("box")

  const { autoplayComputed } = useScroll(container, target, {
    enter: "bottom top",
    leave: "top bottom",
    sync: true,
  })

  const { add } = useTimeline(autoplayComputed)

  add(box, { translateX: 200, duration: 1000 })
</script>

<template>
  <div class="demo">
    <p class="demo-hint">Scroll inside the box below — the square stays in view the whole time.</p>
    <div ref="container" class="demo-stage">
      <DemoSquare ref="box" class="demo-scroll-box" />
      <div class="demo-scroll-spacer" />
      <div ref="target" class="demo-scroll-target" />
      <div class="demo-scroll-spacer" />
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

  .demo-hint {
    margin: 0 0 16px;
    color: var(--vp-c-text-2);
    font-size: 14px;
  }

  .demo-stage {
    height: 160px;
    overflow-y: auto;
    border: 1px dashed var(--vp-c-divider);
    border-radius: 6px;
    padding: 8px 10px;
  }

  .demo-scroll-box {
    position: sticky;
    top: 8px;
  }

  .demo-scroll-target {
    height: 20px;
  }

  .demo-scroll-spacer {
    height: 200px;
  }
</style>