<script setup lang="ts">
  import { ref, useTemplateRef } from "vue"
  import { stagger as animeStagger } from "animejs"
  import { stagger, useAnimate } from "@lib"
  import SectionWrapper from "../../components/SectionWrapper.vue"

  const count = ref(5)
  const ours = useTemplateRef<HTMLElement>("ours")
  const theirs = useTemplateRef<HTMLElement>("theirs")

  // Read `count` so the getter re-runs (after the DOM update) when the list changes
  function dotsOf(row: HTMLElement | null): HTMLElement[] | undefined {
    return row && count.value ? (Array.from(row.children) as HTMLElement[]) : undefined
  }

  const options = { translateY: [-20, 0], opacity: [0, 1], duration: 400 }
  useAnimate(() => dotsOf(ours.value), { ...options, delay: stagger(100, { from: "center" }) })
  useAnimate(() => dotsOf(theirs.value), { ...options, delay: animeStagger(100, { from: "center" }) })
</script>

<template>
  <SectionWrapper>
    <template #title>stagger</template>
    <p>Ours (top) recomputes the spread for every animation; Anime.js's (bottom) keeps the first one.</p>
    <div ref="ours" class="row">
      <span v-for="i in count" :key="i" class="dot" />
    </div>
    <div ref="theirs" class="row">
      <span v-for="i in count" :key="i" class="dot" />
    </div>
    <div class="controls">
      <button :disabled="count <= 1" @click="count--">Remove</button>
      <button @click="count++">Add</button>
    </div>
  </SectionWrapper>
</template>

<style lang="postcss" scoped>
  .row {
    display: flex;
    gap: 8px;
    min-height: 24px;
    margin-bottom: 12px;
  }

  .dot {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #4d96ff;
  }

  .controls {
    display: flex;
    gap: 8px;
  }
</style>