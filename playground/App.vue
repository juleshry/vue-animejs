<script setup lang="ts">
  import { onMounted, ref, useTemplateRef } from "vue"
  import { useAnimate, useTimer, useTimeline, useAnimatable, useDraggable } from "@lib"
  import { clamp } from "animejs"

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

  const box1 = useTemplateRef("box1")
  const box2 = useTemplateRef("box2")
  const box3 = useTemplateRef("box3")

  const { add, play: playTimeline } = useTimeline({ autoplay: false })

  add(box1, {
    x: 250,
    rotate: "1turn",
    backgroundColor: "#dbdaff",
    duration: 2000,
  })
    .add(
      box2,
      {
        x: 250,
        y: 50,
        backgroundColor: "#9593ff",
        duration: 2000,
      },
      "<<"
    )
    .add(
      box3,
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

  onMounted(() => {
    if (!animatable_bounds.value) return

    let { left, top, width, height } = animatable_bounds.value.getBoundingClientRect()

    window.addEventListener("scroll", () => {
      const new_bounds = animatable_bounds.value?.getBoundingClientRect()

      if (!new_bounds) return

      left = new_bounds.left
      top = new_bounds.top
      width = new_bounds.width
      height = new_bounds.height
    })

    window.addEventListener("mousemove", e => {
      const new_x = clamp(e.clientX - left - 50 / 2, left - 50, left + width - 50)
      const new_y = clamp(e.clientY - top - 50 / 2, -50 / 2, height - 50 / 2)

      animatable.value?.x(new_x)
      animatable.value?.y(new_y)
    })
  })

  const circle = useTemplateRef("circle")
  const animatable_bounds = useTemplateRef("animatable_bounds")

  const { animatable } = useAnimatable(circle, { x: 250, y: 250 })

  const draggable = useTemplateRef("draggable")

  useDraggable(draggable, { container: ".draggable_bounds" })
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
      <div class="timeline">
        <div ref="box1" class="box small"></div>
        <div ref="box2" class="box small"></div>
        <div ref="box3" class="box small"></div>
      </div>
      <button @click="playTimeline">Start Timeline</button>
    </div>

    <div>
      <h2>Animatable</h2>
      <div ref="animatable_bounds" class="animatable_bounds">
        <div ref="circle" class="circle" />
      </div>
    </div>

    <div>
      <h2>Draggable</h2>
      <div class="draggable_bounds">
        <div ref="draggable" class="circle">
          <p v-for="i in 3">···</p>
        </div>
      </div>
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

      .animatable_bounds {
        width: 500px;
        height: 250px;
        border: 1px solid #b3b3b3;
        border-radius: 10px;
        background-color: rgba(0, 0, 0, 0.16);

        overflow: hidden;

        & .circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: #afaeff;
        }
      }

      .draggable_bounds {
        width: 500px;
        height: 250px;
        border: 1px solid #b3b3b3;
        border-radius: 10px;
        background-color: rgba(0, 0, 0, 0.16);

        overflow: hidden;

        & .circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: #afaeff;

          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 0;

          & p {
            margin: 0;
            line-height: 5px;
          }
        }
      }
    }
  }
</style>
