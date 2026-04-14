<script setup lang="ts">
  import { useTemplateRef } from "vue"
  import { useTimeline } from "@lib"

  const box1 = useTemplateRef("box1")
  const box2 = useTemplateRef("box2")
  const box3 = useTemplateRef("box3")

  const { add, play: playTimeline } = useTimeline({ autoplay: false })

  add(box1, { x: 250, rotate: "1turn", backgroundColor: "#dbdaff", duration: 2000 })
    .add(box2, { x: 250, y: 50, backgroundColor: "#9593ff", duration: 2000 }, "<<")
    .add(box3, { x: 100, y: -50, width: 50, height: 50, backgroundColor: "#d089ff", duration: 1000 }, "<<+20")
</script>

<template>
  <div class="section">
    <h2>Timeline</h2>
    <div class="timeline">
      <div ref="box1" class="box" />
      <div ref="box2" class="box" />
      <div ref="box3" class="box" />
    </div>
    <button @click="playTimeline">Start Timeline</button>
  </div>
</template>

<style lang="postcss" scoped>
  .section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .timeline {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .box {
    width: 20px;
    height: 20px;
    background-color: #ff3e00;
  }

  button {
    width: fit-content;
  }
</style>