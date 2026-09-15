<script setup lang="ts">
  import { onMounted, useTemplateRef } from "vue"
  import { useRawAnimate, type UseRawAnimateReturn } from "@lib"
  import SectionWrapper from "../../components/SectionWrapper.vue"

  const box = useTemplateRef<HTMLElement>("box")
  let animation: UseRawAnimateReturn

  onMounted(() => {
    animation = useRawAnimate(box.value!, {
      translateX: 250,
      rotate: "1turn",
      backgroundColor: "#5350ff",
      duration: 1500,
      autoplay: false,
    })
  })

  function play() {
    animation?.play()
  }

  function pause() {
    animation?.pause()
  }

  function restart() {
    animation?.restart()
  }
</script>

<template>
  <SectionWrapper>
    <template #title>Raw Animation</template>
    <div ref="box" class="box" />
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
    gap: 8px;
  }

  button {
    width: fit-content;
  }
</style>