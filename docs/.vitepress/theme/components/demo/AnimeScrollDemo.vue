<script setup lang="ts">
  import { computed, useTemplateRef } from "vue"
  import { AnimeScroll, useAnimate } from "@juleshry/vue-animejs"
  import DemoSquare from "./shared/DemoSquare.vue"

  const scroll = useTemplateRef("scroll")
  const box = useTemplateRef<InstanceType<typeof DemoSquare>>("box")

  useAnimate(box, {
    translateX: 200,
    rotate: 180,
    ease: "linear",
    autoplay: computed(() => scroll.value?.autoplay ?? false),
  })
</script>

<template>
  <!-- No container: the page itself is scrolled -->
  <AnimeScroll ref="scroll" class="demo" :options="{ enter: 'bottom top', leave: 'top bottom', sync: true }">
    <p class="demo-hint">Scroll the page: the square follows this block across the viewport.</p>
    <div class="demo-stage">
      <DemoSquare ref="box" />
    </div>
  </AnimeScroll>
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

  .demo-stage {
    border: 1px dashed var(--vp-c-divider);
    border-radius: 6px;
    padding: 16px;
  }
</style>