<script setup lang="ts">
  import { computed, useTemplateRef } from "vue"
  import { AnimeScroll, useAnimate } from "@lib"
  import SectionWrapper from "../../components/SectionWrapper.vue"

  const scroller = useTemplateRef("scroller")
  const box = useTemplateRef<HTMLElement>("box")

  // AnimeScroll has no target of its own: Anime.js observes the box, the first target of the animation it drives
  useAnimate(box, {
    translateX: 200,
    rotate: 180,
    ease: "linear",
    autoplay: computed(() => scroller.value?.autoplay ?? false),
  })
</script>

<template>
  <SectionWrapper>
    <template #title>AnimeScroll</template>
    <p>Scroll inside the box: the square moves as it travels through it.</p>
    <AnimeScroll ref="scroller" class="scroller" :options="{ enter: 'bottom top', leave: 'top bottom', sync: true }">
      <div class="spacer" />
      <div ref="box" class="box" />
      <div class="spacer" />
    </AnimeScroll>
    <button @click="scroller?.debug()">Show debug markers</button>
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
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: #4d96ff;
  }

  .spacer {
    height: 220px;
  }

  button {
    width: fit-content;
  }
</style>