<script setup lang="ts">
  import { useTemplateRef, ref, computed } from "vue"
  import { useAnimate } from "@lib"
  import SectionWrapper from "./SectionWrapper.vue"

  const box = useTemplateRef("box")
  const distance = ref(100)

  const options = computed(() => ({
    translateX: distance.value,
    duration: 600,
    easing: "easeOutExpo",
    loop: true,
    alternate: true,
  }))

  useAnimate(box, options)

  function increase() {
    distance.value += 50
  }
</script>

<template>
  <SectionWrapper>
    <template #title>Reactive Animation</template>
    <div ref="box" class="box" />
    <button @click="increase">Increase animation</button>
    <p>Distance: {{ distance }}</p>
  </SectionWrapper>
</template>

<style lang="postcss" scoped>
  .box {
    width: 20px;
    aspect-ratio: 1;

    background-color: red;
  }
</style>