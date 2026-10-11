<script setup lang="ts">
  import { animate, type AnimationParams } from "animejs"
  import type { Directive } from "vue"

  // Negative control: an animating directive with no server state, as v-animate was before. The
  // element flashes its final state, which the e2e flash check must detect.
  const vNoSSR: Directive<HTMLElement, AnimationParams> = {
    mounted(el, binding) {
      animate(el, binding.value)
    },
  }
</script>

<template>
  <div data-test="target" v-no-s-s-r="{ opacity: [0, 1], translateY: [20, 0], duration: 600, delay: 300 }">control</div>
</template>