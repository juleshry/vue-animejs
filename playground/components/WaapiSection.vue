<script setup lang="ts">
  import { useTemplateRef } from "vue"
  import { useWaapi } from "@lib"
  import SectionWrapper from "./SectionWrapper.vue"

  const waapi_box = useTemplateRef("waapi_box")

  const { play, pause, restart } = useWaapi(waapi_box, {
    translateX: 250,
    rotate: "1turn",
    backgroundColor: "#5350ff",
    duration: 2000,
    loop: true,
    alternate: true,
  })
</script>

<template>
  <SectionWrapper>
    <template #title>WAAPI</template>
    <div ref="waapi_box" class="box" />
    <div class="controls">
      <button @click="play">Play</button>
      <button @click="pause">Pause</button>
      <button @click="restart">Restart</button>
    </div>
  </SectionWrapper>
</template>

<style lang="postcss" scoped>
  .box {
    width: 100px;
    height: 100px;
    background-color: #ff3e00;
  }

  .controls {
    display: flex;
    gap: 10px;
  }

  button {
    width: fit-content;
  }
</style>