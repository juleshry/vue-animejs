<script setup lang="ts">
  import { nextTick, ref, useTemplateRef } from "vue"
  import { AnimeLayout } from "@juleshry/vue-animejs"
  import DemoSquare from "./shared/DemoSquare.vue"
  import type { DemoSquareVariant } from "./shared/Types"

  let next_id = 5
  const items = ref<{ id: number; variant: DemoSquareVariant }[]>([
    { id: 1, variant: 0 },
    { id: 2, variant: 1 },
    { id: 3, variant: 2 },
    { id: 4, variant: 0 },
  ])

  const stage = useTemplateRef("stage")

  async function change(mutate: () => void) {
    stage.value?.record()
    mutate()
    await nextTick()
    stage.value?.animate()
  }

  function shuffle() {
    items.value = [...items.value].sort(() => Math.random() - 0.5)
  }

  function addItem() {
    if (items.value.length >= 8) return
    const variants = [0, 1, 2] as const
    items.value.push({ id: next_id++, variant: variants[items.value.length % 3] })
  }

  function removeItem() {
    if (items.value.length === 0) return
    items.value.splice(Math.floor(Math.random() * items.value.length), 1)
  }
</script>

<template>
  <div class="demo">
    <AnimeLayout ref="stage" class="demo-stage" :options="{ duration: 600, ease: 'outExpo' }">
      <DemoSquare v-for="item in items" :key="item.id" :variant="item.variant">{{ item.id }}</DemoSquare>
    </AnimeLayout>
    <div class="demo-controls">
      <button class="demo-btn" @click="change(shuffle)">Shuffle</button>
      <button class="demo-btn" @click="change(addItem)">Add</button>
      <button class="demo-btn" @click="change(removeItem)">Remove</button>
    </div>
  </div>
</template>

<style scoped>
  .demo {
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
    padding: 24px;
    margin: 24px 0;
  }

  .demo-stage {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    min-height: 80px;
    border: 1px dashed var(--vp-c-divider);
    border-radius: 6px;
    padding: 16px;
    margin-bottom: 16px;
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