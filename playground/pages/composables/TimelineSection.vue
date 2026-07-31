<script setup lang="ts">
  import { useTemplateRef, ref, computed } from "vue"
  import { useTimeline } from "@lib"
  import SectionWrapper from "../../components/SectionWrapper.vue"

  const box1 = useTemplateRef("box1")
  const box2 = useTemplateRef("box2")
  const box3 = useTemplateRef("box3")

  const { add, play: playTimeline } = useTimeline({ autoplay: false })

  add(box1, { x: 250, rotate: "1turn", backgroundColor: "#dbdaff", duration: 2000 })
    .add(box2, { x: 250, y: 50, backgroundColor: "#9593ff", duration: 2000 }, "<<")
    .add(box3, { x: 100, y: -50, width: 50, height: 50, backgroundColor: "#d089ff", duration: 1000 }, "<<+20")

  const rBox1 = useTemplateRef("rBox1")
  const rBox2 = useTemplateRef("rBox2")
  const rBox3 = useTemplateRef("rBox3")

  const loop = ref(false)
  const alternate = ref(false)

  const reactiveOptions = computed(() => ({
    autoplay: false,
    loop: loop.value,
    alternate: alternate.value,
  }))

  const { add: rAdd, play, restart } = useTimeline(reactiveOptions)

  rAdd(rBox1, { translateX: 200, duration: 600, ease: "outExpo" })
    .add(rBox2, { translateX: 200, duration: 600, ease: "outExpo" }, "-=300")
    .add(rBox3, { translateX: 200, duration: 600, ease: "outExpo" }, "-=300")
</script>

<template>
  <SectionWrapper>
    <template #title>Timeline</template>
    <div class="timeline">
      <div ref="box1" class="box" />
      <div ref="box2" class="box" />
      <div ref="box3" class="box" />
    </div>
    <button @click="playTimeline">Start Timeline</button>
  </SectionWrapper>

  <SectionWrapper>
    <template #title>Reactive Timeline</template>

    <div class="boxes">
      <div ref="rBox1" class="box" />
      <div ref="rBox2" class="box" />
      <div ref="rBox3" class="box" />
    </div>

    <div class="controls">
      <label><input v-model="loop" type="checkbox" /> Loop</label>
      <label><input v-model="alternate" type="checkbox" /> Alternate</label>
    </div>

    <div class="controls">
      <button @click="play">Play</button>
      <button @click="restart">Restart</button>
    </div>
  </SectionWrapper>
</template>

<style lang="postcss" scoped>
  .timeline {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .boxes {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .box {
    width: 20px;
    height: 20px;
    background-color: #ff3e00;
  }

  .controls {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  button,
  label {
    width: fit-content;
    cursor: pointer;
  }
</style>