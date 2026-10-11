<script setup lang="ts">
  import { animate, type AnimationParams } from "animejs"
  import type { Directive } from "vue"
  import { getInitialStyle } from "@src/utils/initial-style.ts"
  import { toSSRProps } from "@src/utils/ssr-props.ts"

  // Negative control: a server style without a `created` hook. Vue checks the node and warns about
  // the style mismatch, which the e2e hydration-warning check must detect.
  const vNoCreated: Directive<HTMLElement, AnimationParams> = {
    getSSRProps(binding) {
      return toSSRProps({ style: getInitialStyle(binding.value) })
    },
    mounted(el, binding) {
      animate(el, binding.value)
    },
  }
</script>

<template>
  <div data-test="target" :style="{ color: 'red' }" v-no-created="{ opacity: [0, 1], duration: 600, delay: 300 }">
    control
  </div>
</template>