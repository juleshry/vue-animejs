<script setup lang="ts">
  import { useTemplateRef } from "vue"
  import { useEventListener } from "@vueuse/core"
  import { utils } from "animejs"
  import { useAnimatable } from "@juleshry/vue-animejs"
  import DemoSquare from "./shared/DemoSquare.vue"

  const stage = useTemplateRef("stage")
  const box = useTemplateRef<InstanceType<typeof DemoSquare>>("box")

  const { animatable } = useAnimatable(box, {
    x: 500,
    y: 500,
    ease: "out(3)",
  })

  let bounds = { width: 0, height: 0, left: 0, top: 0 }

  useEventListener("mousemove", (e: MouseEvent) => {
    if (!animatable.value) return
    const { width, height, left, top } = bounds
    const hw = width / 2
    const hh = height / 2
    animatable.value.x(utils.clamp(e.clientX - left - hw, -hw, hw))
    animatable.value.y(utils.clamp(e.clientY - top - hh, -hh, hh))
  })

  useEventListener("scroll", refreshBounds, { capture: true })

  function refreshBounds() {
    bounds = stage.value?.getBoundingClientRect() ?? bounds
  }
</script>

<template>
  <div class="demo">
    <div ref="stage" class="demo-stage" @vue:mounted="refreshBounds">
      <DemoSquare ref="box" style="pointer-events: none" />
    </div>
    <div class="demo-label">Move cursor around</div>
  </div>
</template>

<style scoped>
  .demo {
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
    margin: 24px 0;
    overflow: hidden;
  }

  .demo-stage {
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--vp-c-bg-soft);
  }

  .demo-label {
    padding: 10px;
    text-align: center;
    font-size: 13px;
    color: var(--vp-c-text-3);
  }
</style>