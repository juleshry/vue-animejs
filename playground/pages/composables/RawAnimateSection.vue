<script setup lang="ts">
  import { onMounted, useTemplateRef } from "vue"
  import { useRawAnimate, useScroll, type UseRawAnimateReturn } from "@lib"
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

  // useScroll itself is called at the normal top level, same as everywhere else — only the
  // resulting `autoplay` needs to wait for mount, since it's `useRawAnimate` (not useScroll)
  // that requires a real DOM element read synchronously inside onMounted.
  const scrollContainerEl = useTemplateRef<HTMLDivElement>("scrollContainer")
  const scrollTargetEl = useTemplateRef<HTMLDivElement>("scrollTarget")
  const scrollBoxEl = useTemplateRef<HTMLDivElement>("scrollBox")

  const { autoplay: scrollAutoplay } = useScroll(scrollContainerEl, scrollTargetEl, {
    enter: "bottom top",
    leave: "top bottom",
    sync: true,
  })

  onMounted(() => {
    useRawAnimate(scrollBoxEl.value!, {
      translateX: 150,
      backgroundColor: "#9593ff",
      duration: 1000,
      autoplay: scrollAutoplay.value,
    })
  })
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

  <SectionWrapper>
    <template #title>Scroll-linked Raw Animation</template>
    <div ref="scrollContainer" class="scroll-container">
      <div ref="scrollBox" class="scroll-box" />
      <div class="scroll-spacer" />
      <div ref="scrollTarget" class="scroll-target" />
      <div class="scroll-spacer" />
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

  .scroll-container {
    height: 160px;
    overflow-y: auto;
    border: 1px solid #2a2a2a;
    padding: 8px 10px;
  }

  .scroll-box {
    position: sticky;
    top: 8px;
    width: 20px;
    height: 20px;
    background-color: #ff3e00;
  }

  .scroll-target {
    height: 20px;
  }

  .scroll-spacer {
    height: 200px;
  }

  button {
    width: fit-content;
  }
</style>