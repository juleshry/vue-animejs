<script setup lang="ts">
  import { ref } from "vue"
  import { AnimeTransition } from "@lib"

  const show = ref(true)
</script>

<template>
  <AnimeTransition
    appear
    :enter="{ opacity: [0, 1], translateY: [20, 0], duration: 600, delay: 300 }"
    :leave="{ opacity: 0, duration: 200 }"
  >
    <div v-if="show" data-test="target" :style="{ color: 'red' }">AnimeTransition</div>
  </AnimeTransition>
  <button data-test="toggle" @click="show = !show">Toggle</button>
</template>