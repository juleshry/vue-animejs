<script setup lang="ts">
  import { useTemplateRef } from "vue"
  import { useAnimate } from "@lib"
  import SectionWrapper from "./SectionWrapper.vue"

  const box = useTemplateRef("box")

  const { restart } = useAnimate(box, {
    translateX: 250,
    rotate: "1turn",
    backgroundColor: "#5350ff",
    duration: 2000,
    autoplay: true,
  })
</script>

<template>
  <SectionWrapper>
    <template #title>Animation</template>
    <div ref="box" class="box" />
    <button @click="restart">Restart animation</button>
  </SectionWrapper>
</template>

<style lang="postcss" scoped>
  .box {
    width: 100px;
    height: 100px;
    background-color: #ff3e00;
  }

  button {
    width: fit-content;
  }
</style>