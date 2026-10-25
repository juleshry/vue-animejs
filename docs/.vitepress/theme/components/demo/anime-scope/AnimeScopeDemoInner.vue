<script setup lang="ts">
  import { onMounted, ref, useTemplateRef } from "vue"
  import { animate, stagger } from "animejs"
  import { AnimeScope } from "@juleshry/vue-animejs"
  import DemoSquare from "../shared/DemoSquare.vue"

  const stage = useTemplateRef("stage")
  const is_narrow = ref(false)

  // Re-run by the scope whenever "narrow" starts or stops matching: the previous animations are reverted first
  onMounted(() => {
    stage.value?.add(scope => {
      is_narrow.value = scope?.matches.narrow ?? false
      if (is_narrow.value) {
        animate(".square", { rotate: "1turn", ease: "inOutQuart", delay: stagger(150) })
      } else {
        animate(".square", { y: [-24, 24], alternate: true, ease: "inOutSine", delay: stagger(120) })
      }
    })
  })
</script>

<template>
  <div class="demo">
    <p class="demo-mq">
      <code>(max-width: 420px)</code> → <strong>{{ is_narrow ? "narrow: spin" : "wide: wave" }}</strong>
      <span class="demo-hint">Drag the bottom-right corner to resize</span>
    </p>
    <AnimeScope
      ref="stage"
      class="demo-stage"
      :options="{ mediaQueries: { narrow: '(max-width: 420px)' }, defaults: { duration: 900, loop: true } }"
    >
      <DemoSquare v-for="i in 4" :key="i" class="square" :variant="((i - 1) % 3) as 0 | 1 | 2" />
    </AnimeScope>
  </div>
</template>

<style>
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    background: var(--vp-c-bg);
    font-family: var(--vp-font-family-base);
  }
</style>

<style scoped>
  .demo {
    padding: 24px;
  }

  .demo-mq {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 12px;
    font-size: 13px;
    color: var(--vp-c-text-2);
    margin: 0 0 8px;
  }

  .demo-hint {
    color: var(--vp-c-text-3);
  }

  .demo-stage {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    height: 140px;
  }
</style>