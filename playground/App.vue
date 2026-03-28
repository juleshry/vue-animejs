<script setup lang="ts">
  import { ref, useTemplateRef } from "vue"
  import { useAnimate, useTimer } from "@lib"

  const box = useTemplateRef("box")

  const { restart } = useAnimate(box, {
    translateX: 250,
    rotate: "1turn",
    backgroundColor: "#FFF",
    duration: 2000,
    autoplay: true,
  })

  const time = ref<number>(0)
  const count = ref<number>(0)

  useTimer({
    duration: 1000,
    loop: true,
    frameRate: 30,
    onUpdate: self => (time.value = self.currentTime),
    onLoop: self => (count.value = self._currentIteration),
  })
</script>

<template>
  <div class="container">
    <h1>Vue-Animejs Playground</h1>

    <div>
      <h2>Animation</h2>
      <div ref="box" class="box"></div>
      <button @click="restart">Restart animation</button>
    </div>
    <div>
      <h2>Timer</h2>
      <span>Time: {{ time }} ms</span>
      <span>Count: {{ count }}</span>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
  .container {
    margin: 20px;

    & > div {
      display: flex;
      flex-direction: column;
      gap: 10px;

      margin-bottom: 20px;

      .box {
        width: 100px;
        height: 100px;
        background-color: #ff3e00;
        margin-top: 20px;
      }

      button {
        width: fit-content;
      }
    }
  }
</style>
