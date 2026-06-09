<script setup lang="ts">
  import { computed, ref, useTemplateRef } from "vue"
  import { useScope, useRawAnimate } from "@juleshry/vue-animejs"
  import DemoSquare from "../shared/DemoSquare.vue"

  const square = useTemplateRef<InstanceType<typeof DemoSquare>>("square")
  const is_narrow = ref<boolean>(false)

  const { add, revert, refresh } = useScope({
    mediaQueries: { isNarrow: "(max-width: 380px)" },
    defaults: {
      loop: true,
      duration: 1200,
    },
  })

  add(s => {
    is_narrow.value = s.matches.isNarrow
    if (is_narrow.value) {
      useRawAnimate(square, { rotate: "1turn", ease: "linear" })
    } else {
      useRawAnimate(square, { y: [-30, 30], alternate: true, ease: "linear" })
    }
  })
</script>

<template>
  <div class="demo">
    <p class="demo-mq">
      isNarrow: <code>{{ is_narrow }}</code>
    </p>
    <div class="demo-stage">
      <DemoSquare ref="square" />
    </div>
    <div class="demo-controls">
      <button class="demo-btn" @click="revert">Revert all</button>
      <button class="demo-btn" @click="refresh">Refresh</button>
    </div>
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
    font-size: 13px;
    color: var(--vp-c-text-2);
    margin: 0 0 8px;
  }

  .demo-stage {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    height: 80px;
  }

  .demo-controls {
    display: flex;
    gap: 8px;
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