<script setup lang="ts">
  import { computed, useTemplateRef } from "vue"
  import { AnimeScroll, useAnimate } from "@juleshry/vue-animejs"
  import DemoSquare from "./shared/DemoSquare.vue"

  const scroller = useTemplateRef("scroller")
  const box = useTemplateRef<InstanceType<typeof DemoSquare>>("box")

  useAnimate(box, {
    translateX: 200,
    rotate: 180,
    ease: "linear",
    autoplay: computed(() => scroller.value?.autoplay ?? false),
  })
</script>

<template>
  <div class="demo">
    <p class="demo-hint">Scroll inside the box: the square moves as it travels through it.</p>
    <AnimeScroll
      ref="scroller"
      class="demo-scroller"
      :options="{ enter: 'bottom top', leave: 'top bottom', sync: true }"
    >
      <div class="demo-spacer" />
      <DemoSquare ref="box" />
      <div class="demo-spacer" />
    </AnimeScroll>
  </div>
</template>

<style scoped>
  .demo {
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
    padding: 24px;
    margin: 24px 0;
  }

  .demo-hint {
    margin: 0 0 16px;
    color: var(--vp-c-text-2);
    font-size: 14px;
  }

  .demo-scroller {
    height: 200px;
    overflow-y: auto;
    border: 1px dashed var(--vp-c-divider);
    border-radius: 6px;
    padding: 0 16px;
  }

  .demo-spacer {
    height: 220px;
  }
</style>