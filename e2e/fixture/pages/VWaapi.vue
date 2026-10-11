<script setup lang="ts">
  import { ref } from "vue"
  import type { WAAPIAnimationParams } from "animejs"
  import { vWaapi } from "@lib"

  const params = ref<WAAPIAnimationParams>({ opacity: [0, 1], translateY: [20, 0], duration: 600, delay: 300 })

  function rebind() {
    params.value = { translateX: [0, 50], duration: 200 }
  }
</script>

<template>
  <div data-test="target" v-waapi="params">v-waapi</div>
  <button data-test="rebind" @click="rebind">Rebind</button>
</template>