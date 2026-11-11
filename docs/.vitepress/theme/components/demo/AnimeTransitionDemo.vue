<script setup lang="ts">
  import { ref } from "vue"
  import { AnimeTransition } from "@juleshry/vue-animejs"
  import DemoSquare from "./shared/DemoSquare.vue"

  const show = ref(true)
  const variant = ref<0 | 1 | 2>(0)

  function next() {
    variant.value = ((variant.value + 1) % 3) as 0 | 1 | 2
  }
</script>

<template>
  <div class="demo">
    <div class="demo-row">
      <div class="demo-stage">
        <AnimeTransition
          appear
          :enter="{ opacity: [0, 1], translateY: [20, 0], duration: 500, ease: 'outExpo' }"
          :leave="{ opacity: 0, translateY: -20, duration: 250, ease: 'inQuad' }"
        >
          <DemoSquare v-if="show" />
        </AnimeTransition>
      </div>
      <button class="demo-btn" @click="show = !show">{{ show ? "Hide" : "Show" }}</button>
    </div>
    <div class="demo-row">
      <div class="demo-stage">
        <AnimeTransition
          mode="out-in"
          :enter="{ scale: [0.6, 1], opacity: [0, 1], duration: 400, ease: 'outBack' }"
          :leave="{ scale: 0.6, opacity: 0, duration: 200 }"
        >
          <DemoSquare :key="variant" :variant="variant" />
        </AnimeTransition>
      </div>
      <button class="demo-btn" @click="next">Next (out-in)</button>
    </div>
  </div>
</template>

<style scoped>
  .demo {
    display: flex;
    flex-direction: column;
    gap: 16px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
    padding: 24px;
    margin: 24px 0;
  }

  .demo-row {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .demo-stage {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 96px;
    height: 96px;
    border: 1px dashed var(--vp-c-divider);
    border-radius: 6px;
  }

  .demo-btn {
    padding: 6px 16px;
    border-radius: 6px;
    border: 1px solid var(--vp-c-divider);
    background: var(--vp-c-bg-soft);
    color: var(--vp-c-text-1);
    font-size: 14px;
    cursor: pointer;
    transition:
      border-color 0.2s,
      background 0.2s;
  }

  .demo-btn:hover {
    border-color: var(--vp-c-brand-1);
    background: var(--vp-c-bg-mute);
  }
</style>