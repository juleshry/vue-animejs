<script setup lang="ts">
  import { ref } from "vue"
  import type { AnimationParams } from "animejs"
  import { vAnimate } from "@lib"

  // The user's own opacity conflicts with the animation's "from": the server renders the directive's
  const params = ref<AnimationParams>({ opacity: [0, 1], duration: 600, delay: 300 })

  function rebind() {
    params.value = { translateX: [0, 50], duration: 200 }
  }
</script>

<template>
  <div data-test="target" :style="{ opacity: 0.5 }" v-animate="params">v-animate with :style</div>
  <button data-test="rebind" @click="rebind">Rebind</button>
</template>