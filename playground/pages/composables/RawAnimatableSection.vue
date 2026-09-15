<script setup lang="ts">
  import { onMounted, useTemplateRef } from "vue"
  import { useRawAnimatable, type UseRawAnimatableReturn } from "@lib"
  import SectionWrapper from "../../components/SectionWrapper.vue"

  const circle = useTemplateRef<HTMLElement>("circle")
  let animatable: UseRawAnimatableReturn

  onMounted(() => {
    animatable = useRawAnimatable(circle.value!, {
      x: 250,
      ease: "out(3)",
    })
  })

  function move() {
    animatable?.x(250)
  }

  function reset() {
    animatable?.x(0)
  }
</script>

<template>
  <SectionWrapper>
    <template #title>Raw Animatable</template>
    <div ref="circle" class="circle" />
    <div class="controls">
      <button @click="move">Move</button>
      <button @click="reset">Reset</button>
    </div>
  </SectionWrapper>
</template>

<style lang="postcss" scoped>
  .circle {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #afaeff;
  }

  .controls {
    display: flex;
    gap: 8px;
  }

  button {
    width: fit-content;
  }
</style>