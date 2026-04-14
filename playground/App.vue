<script setup lang="ts">
  import { nextTick, onMounted, ref, useTemplateRef, watch } from "vue"
  import { useAnimate, useTimer, useTimeline, useAnimatable, useDraggable, useLayout, useText } from "@lib"
  import { clamp, stagger, Target } from "animejs"

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

  const layout_root = useTemplateRef("layout_root")
  const { record, animate: animateLayout } = useLayout(layout_root, {})

  const layout_items = ref([
    { id: 1, color: "#ff6b6b" },
    { id: 2, color: "#ffd93d" },
    { id: 3, color: "#6bcb77" },
    { id: 4, color: "#4d96ff" },
    { id: 5, color: "#c77dff" },
    { id: 6, color: "#ff9f1c" },
  ])

  async function shuffleLayout() {
    record()
    layout_items.value = [...layout_items.value].sort(() => Math.random() - 0.5)
    await nextTick()
    animateLayout({ duration: 250 })
  }

  const text = useTemplateRef("text")

  const { words } = useText(text, {
    words: { wrap: "clip" },
    chars: true,
  })

  useAnimate(words, {
    y: [($el: Target) => (+$el.dataset.line % 2 ? "100%" : "-100%"), "0%"],
    loop: true,
    duration: 500,
    alternate: true,
    delay: stagger(200),
    ease: "inOut(3)",
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
          <p v-for="i in 3" :key="i">···</p>
        </div>
      </div>
    </div>

    <div>
      <h2>Layout</h2>
      <div ref="layout_root" class="layout_grid">
        <div v-for="item in layout_items" :key="item.id" class="layout_item" :style="{ backgroundColor: item.color }" />
      </div>
      <button @click="shuffleLayout">Shuffle</button>
    </div>

    <div>
      <h2>Text</h2>
      <p ref="text" style="color: #afaeff">
        All-in-one text splitter<br />
        テキストスプリッター<br />
        Ceci est un text
      </p>
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

      .layout_grid {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        width: 290px;

        .layout_item {
          width: 80px;
          height: 80px;
          border-radius: 10px;
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

            user-select: none;
          }
        }
      }
    }
  }
</style>
