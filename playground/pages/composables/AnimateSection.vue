<script setup lang="ts">
  import { useTemplateRef, ref, computed } from "vue"
  import { useAnimate } from "@lib"
  import SectionWrapper from "../../components/SectionWrapper.vue"

  const box = useTemplateRef("box")

  const { restart } = useAnimate(box, {
    translateX: 250,
    rotate: "1turn",
    backgroundColor: "#5350ff",
    duration: 2000,
    autoplay: true,
  })

  const reactiveBox = useTemplateRef("reactiveBox")
  const distance = ref(100)

  const options = computed(() => ({
    translateX: distance.value,
    duration: 600,
    ease: "outExpo",
    loop: true,
    alternate: true,
  }))

  useAnimate(reactiveBox, options)

  function increase() {
    distance.value += 50
  }
</script>

<template>
  <SectionWrapper>
    <template #title>Animation</template>
    <div ref="box" class="box" />
    <button @click="restart">Restart animation</button>
  </SectionWrapper>

  <SectionWrapper>
    <template #title>Reactive Animation</template>
    <div ref="reactiveBox" class="reactive-box" />
    <button @click="increase">Increase animation</button>
    <p>Distance: {{ distance }}</p>
  </SectionWrapper>
</template>

<style lang="postcss" scoped>
  .box {
    width: 100px;
    height: 100px;
    background-color: #ff3e00;
  }

  .reactive-box {
    width: 20px;
    aspect-ratio: 1;
    background-color: red;
  }

  button {
    width: fit-content;
  }
</style>