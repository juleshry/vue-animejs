<script setup lang="ts">
  import { computed, useTemplateRef } from "vue"
  import { AnimeScroll, useAnimate } from "@lib"
  import SectionWrapper from "../../components/SectionWrapper.vue"

  const scroller = useTemplateRef<HTMLElement>("scroller")
  const scroll = useTemplateRef("scroll")
  const box = useTemplateRef<HTMLElement>("box")

  useAnimate(box, {
    translateX: 200,
    rotate: 180,
    ease: "linear",
    autoplay: computed(() => scroll.value?.autoplay ?? false),
  })
</script>

<template>
  <SectionWrapper>
    <template #title>AnimeScroll</template>
    <p>Scroll inside the box: the square follows the marked target's progress.</p>
    <div ref="scroller" class="scroller">
      <div ref="box" class="box" />
      <div class="spacer" />
      <AnimeScroll
        ref="scroll"
        class="target"
        :container="scroller"
        :options="{ enter: 'bottom top', leave: 'top bottom', sync: true }"
      >
        target
      </AnimeScroll>
      <div class="spacer" />
    </div>
    <button @click="scroll?.debug()">Show debug markers</button>
  </SectionWrapper>
</template>

<style lang="postcss" scoped>
  .scroller {
    position: relative;
    height: 200px;
    width: 320px;
    overflow-y: auto;
    border: 1px dashed #888;
  }

  .box {
    position: sticky;
    top: 8px;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: #4d96ff;
  }

  .target {
    height: 40px;
    background: #ffd93d33;
  }

  .spacer {
    height: 300px;
  }

  button {
    width: fit-content;
  }
</style>