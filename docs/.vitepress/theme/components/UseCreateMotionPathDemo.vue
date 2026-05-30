<script setup lang="ts">
  import { useSvg, useTimeline } from "@juleshry/vue-animejs"
  import { stagger } from "animejs"
  import { computed, ref, useTemplateRef } from "vue"

  const dot_a = useTemplateRef<SVGCircleElement>("dot-a")
  const dot_b = useTemplateRef<SVGCircleElement>("dot-b")
  const dot_c = useTemplateRef<SVGCircleElement>("dot-c")
  const track = useTemplateRef<SVGPathElement>("track")

  const { createMotionPath } = useSvg()

  const { add, restart } = useTimeline({
    loop: true,
    alternate: true,
    autoplay: true,
    defaults: { duration: 2400, ease: "inOutSine" },
  })

  add(
    computed(() => [dot_a.value, dot_b.value, dot_c.value]),
    computed(() => ({ ...createMotionPath(track), delay: stagger(300) }))
  )
</script>

<template>
  <div class="demo">
    <div class="demo-stage">
      <svg viewBox="0 0 300 80" class="track-svg" xmlns="http://www.w3.org/2000/svg">
        <path
          ref="track"
          d="M0 60 C60 0, 120 80, 180 20 C220 -10, 260 50, 300 20"
          fill="none"
          stroke="var(--vp-c-divider)"
          stroke-width="2"
          stroke-dasharray="6 4"
        />
        <g>
          <circle ref="dot-a" cx="0" cy="0" r="7" fill="var(--vp-c-brand-1)" />
          <circle ref="dot-b" cx="0" cy="0" r="7" fill="var(--vp-c-brand-2)" fill-opacity="0.75" />
          <circle ref="dot-c" cx="0" cy="0" r="7" fill="var(--vp-c-brand-1)" fill-opacity="0.5" />
        </g>
      </svg>
    </div>
    <div class="demo-controls">
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
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }

  .track-svg {
    width: 300px;
    height: 80px;
    overflow: visible;
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

  circle {
    transform: translateY(60px);
  }
</style>