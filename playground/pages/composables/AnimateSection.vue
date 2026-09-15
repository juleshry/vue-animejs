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

  const groupBox1 = useTemplateRef("groupBox1")
  const groupBox2 = useTemplateRef("groupBox2")
  const groupBox3 = useTemplateRef("groupBox3")

  const { restart: restartGroup } = useAnimate([groupBox1, groupBox2, groupBox3], {
    translateY: -20,
    backgroundColor: "#00c48c",
    duration: 800,
    ease: "outExpo",
    loop: true,
    alternate: true,
  })
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

  <SectionWrapper>
    <template #title>Array of Targets</template>
    <div class="group">
      <div ref="groupBox1" class="group-box" />
      <div ref="groupBox2" class="group-box" />
      <div ref="groupBox3" class="group-box" />
    </div>
    <button @click="restartGroup">Restart animation</button>
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

  .group {
    display: flex;
    gap: 12px;
  }

  .group-box {
    width: 60px;
    height: 60px;
    background-color: #00c48c;
  }

  button {
    width: fit-content;
  }
</style>