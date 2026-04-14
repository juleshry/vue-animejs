<script setup lang="ts">
  import { ref } from "vue"
  import { useTimer } from "@lib"

  const time = ref<number>(0)
  const count = ref<number>(0)

  const { play, pause } = useTimer({
    duration: 1000,
    loop: true,
    frameRate: 30,
    autoplay: false,
    onUpdate: self => (time.value = self.currentTime),
    onLoop: self => (count.value = self._currentIteration),
  })
</script>

<template>
  <div class="section">
    <h2>Timer</h2>
    <span>Time: {{ time }} ms</span>
    <span>Count: {{ count }}</span>
    <div class="controls">
      <button @click="play">Start timer</button>
      <button @click="pause">Pause timer</button>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
  .section {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
  }

  .controls {
    display: flex;
    gap: 10px;
  }

  button {
    width: fit-content;
  }
</style>