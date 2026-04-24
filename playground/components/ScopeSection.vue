<script setup lang="ts">
  import { ref, useTemplateRef } from "vue"
  import { useRawAnimate, useScope } from "@lib"
  import SectionWrapper from "./SectionWrapper.vue"

  const box1 = useTemplateRef<HTMLElement>("box1")
  const box2 = useTemplateRef<HTMLElement>("box2")
  const box3 = useTemplateRef<HTMLElement>("box3")

  const is_narrow = ref(false)

  const { add, revert, refresh } = useScope({
    defaults: { autoplay: true, loop: true, alternate: true },
    mediaQueries: { isNarrow: "(max-width: 768px)" },
  })

  add(s => {
    is_narrow.value = s.matches.isNarrow
    const tx = s.matches.isNarrow ? [80, 60, 40] : [220, 160, 100]
    const colors = s.matches.isNarrow ? ["#ff6b35", "#ff9f1c", "#ffbf69"] : ["#5350ff", "#9593ff", "#d089ff"]
    useRawAnimate(box1, { translateX: tx[0], backgroundColor: colors[0], duration: 1200 })
    useRawAnimate(box2, { translateX: tx[1], backgroundColor: colors[1], duration: 900, delay: 150 })
    useRawAnimate(box3, { translateX: tx[2], backgroundColor: colors[2], duration: 700, delay: 300 })
  })
</script>

<template>
  <SectionWrapper>
    <template #title>Scope</template>
    <p :class="$style.hint">Resize below 768px to see the scope refresh with different values.</p>
    <p :class="$style.mqState"
      >isNarrow: <code>{{ is_narrow }}</code></p
    >
    <div :class="$style.boxes">
      <div ref="box1" :class="$style.box" />
      <div ref="box2" :class="$style.box" />
      <div ref="box3" :class="$style.box" />
    </div>
    <div :class="$style.controls">
      <button @click="revert">Revert</button>
      <button @click="refresh">Refresh</button>
    </div>
  </SectionWrapper>
</template>

<style module lang="postcss">
  .hint {
    font-size: 13px;
    color: #888;
    margin: 0;
  }

  .mqState {
    font-size: 13px;
    margin: 0;
    color: #ccc;
  }

  .boxes {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .box {
    width: 40px;
    height: 40px;
    background-color: #ff3e00;
  }

  .controls {
    display: flex;
    gap: 8px;
  }

  button {
    width: fit-content;
  }
</style>
