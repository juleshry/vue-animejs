<script setup lang="ts">
  import { vTextSplit } from "@lib"
</script>

<template>
  <p
    data-test="target"
    v-text-split="{ words: true, ssrHidden: true, animation: { opacity: [0, 1], duration: 600, delay: 300 } }"
  >
    Hello world, split me
  </p>
  <p
    data-test="lines"
    v-text-split="{ lines: true, ssrHidden: true, animation: { opacity: [0, 1], duration: 600, delay: 300 } }"
  >
    Split into lines
  </p>
</template>