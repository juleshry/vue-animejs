<script setup lang="ts">
  import { onMounted, ref, useTemplateRef } from "vue"
  import { useAnimate, useTimer, useTimeline } from "@lib"

  const box = useTemplateRef("box")

  const { restart } = useAnimate(box, {
    translateX: 250,
    rotate: "1turn",
    backgroundColor: "#5350ff",
    duration: 2000,
    autoplay: true,
  })

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

  const timeline_el = useTemplateRef("timeline")

  const { add, play: playTimeline } = useTimeline({ autoplay: false })

  onMounted(() => {
    if (!timeline_el.value) return
    add(timeline_el.value.children[0], {
      x: 250,
      rotate: "1turn",
      backgroundColor: "#dbdaff",
      duration: 2000,
    })
      .add(
        timeline_el.value.children[1],
        {
          x: 250,
          y: 50,
          backgroundColor: "#9593ff",
          duration: 2000,
        },
        "<<"
      )
      .add(
        timeline_el.value.children[2],
        {
          x: 100,
          y: -50,
          width: 50,
          height: 50,
          backgroundColor: "#d089ff",
          duration: 1000,
        },
        "<<+20"
      )
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
      <div style="display: flex; gap: 10px">
        <button @click="play">Start timer</button>
        <button @click="pause">Pause timer</button>
      </div>
    </div>

    <div>
      <h2>Timeline</h2>
      <div ref="timeline" class="timeline">
        <div class="box small"></div>
        <div class="box small"></div>
        <div class="box small"></div>
      </div>
      <button @click="playTimeline">Start Timeline</button>
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

        &.small {
          width: 20px;
          height: 20px;
        }
      }

      button {
        width: fit-content;
      }

      .timeline {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
    }
  }
</style>
