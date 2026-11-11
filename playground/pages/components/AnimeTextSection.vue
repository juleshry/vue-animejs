<script setup lang="ts">
  import { type Target } from "animejs"
  import { ref, useTemplateRef } from "vue"
  import { AnimeText, useAnimate } from "@lib"
  import SectionWrapper from "../../components/SectionWrapper.vue"

  const message = ref("Hello, vue-animejs!")
  const split_by = ref<"chars" | "words">("chars")
  const text = useTemplateRef("text")

  // A getter target: a new array after every split (new content or options), so the animation is re-created and plays again
  const { restart } = useAnimate(() => (split_by.value === "chars" ? text.value?.chars : text.value?.words), {
    translateY: [-24, 0],
    opacity: [0, 1],
    duration: 700,
    delay: (_?: Target, i = 0) => i * 50,
    ease: "outExpo",
  })
</script>

<template>
  <SectionWrapper>
    <template #title>AnimeText</template>
    <AnimeText ref="text" as="p" class="text" :options="{ [split_by]: true }">{{ message }}</AnimeText>
    <div class="controls">
      <input v-model="message" type="text" />
      <label><input v-model="split_by" type="radio" value="chars" /> Chars</label>
      <label><input v-model="split_by" type="radio" value="words" /> Words</label>
      <button @click="restart">Restart</button>
    </div>
  </SectionWrapper>
</template>

<style lang="postcss" scoped>
  .text {
    font-size: 24px;
    font-weight: 600;
    min-height: 32px;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }
</style>