<script setup lang="ts">
  import { vSvgDrawable } from "@lib"
</script>

<template>
  <svg width="100" height="100" viewBox="0 0 100 100">
    <path
      data-test="target"
      d="M10 10 L90 90"
      stroke-linecap="round"
      v-svg-drawable="{ draw: ['0 0', '0 1'], duration: 600, delay: 300 }"
    />
  </svg>
</template>