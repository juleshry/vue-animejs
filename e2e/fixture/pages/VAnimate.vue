<script setup lang="ts">
  import { ref } from "vue"
  import type { AnimationParams } from "animejs"
  import { vAnimate } from "@lib"

  const params = ref<AnimationParams>({ opacity: [0, 1], translateY: [20, 0], duration: 600, delay: 300 })

  function rebind() {
    params.value = { translateX: [0, 50], duration: 200 }
  }
</script>

<template>
  <div data-test="target" :style="{ color: 'red' }" v-animate="params">v-animate</div>
  <button data-test="rebind" @click="rebind">Rebind</button>
</template>