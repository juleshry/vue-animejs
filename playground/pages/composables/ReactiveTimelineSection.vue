<script setup lang="ts">
  import { ref, computed } from "vue"
  import { useTemplateRef } from "vue"
  import { useTimeline } from "@lib"
  import SectionWrapper from "../../components/SectionWrapper.vue"

  const box1 = useTemplateRef("box1")
  const box2 = useTemplateRef("box2")
  const box3 = useTemplateRef("box3")

  const loop = ref(false)
  const alternate = ref(false)

  const options = computed(() => ({
    autoplay: false,
    loop: loop.value,
    alternate: alternate.value,
  }))

  const { add, play, restart } = useTimeline(options)

  add(box1, { translateX: 200, duration: 600, ease: "outExpo" })
    .add(box2, { translateX: 200, duration: 600, ease: "outExpo" }, "-=300")
    .add(box3, { translateX: 200, duration: 600, ease: "outExpo" }, "-=300")
</script>

<template>
  <SectionWrapper>
    <template #title>Reactive Timeline</template>

    <div class="boxes">
      <div ref="box1" class="box" />
      <div ref="box2" class="box" />
      <div ref="box3" class="box" />
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