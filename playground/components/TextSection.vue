<script setup lang="ts">
  import { useTemplateRef } from "vue"
  import { useAnimate, useText } from "@lib"
  import { stagger, type Target } from "animejs"
  import SectionWrapper from "./SectionWrapper.vue"

  const text = useTemplateRef("text")

  const { words } = useText(text, {
    words: { wrap: "clip" },
    chars: true,
  })

  useAnimate(words, {
    y: [($el: Target) => (+$el.dataset.line % 2 ? "100%" : "-100%"), "0%"],
    loop: true,
    duration: 500,
    alternate: true,
    delay: stagger(200),
    ease: "inOut(3)",
  })
</script>

<template>
  <SectionWrapper>
    <template #title>Text</template>
    <p ref="text" class="text">
      All-in-one text splitter<br />
      テキストスプリッター<br />
      Ceci est un text
    </p>
  </SectionWrapper>
</template>

<style lang="postcss" scoped>
  .text {
    color: #afaeff;
  }
</style>