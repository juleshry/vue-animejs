<script setup lang="ts">
  import { nextTick, ref, useTemplateRef } from "vue"
  import { useLayout } from "@juleshry/vue-animejs"
  import DemoSquare from "./shared/DemoSquare.vue"
  import type { DemoSquareVariant } from "./shared/Types"

  let next_id = 5
  const items = ref<{ id: number; variant: DemoSquareVariant }[]>([
    { id: 1, variant: 0 },
    { id: 2, variant: 1 },
    { id: 3, variant: 2 },
    { id: 4, variant: 0 },
  ])
  const container = useTemplateRef<HTMLDivElement>("container")
  const { record, animate } = useLayout(container)

  async function shuffle() {
    record()
    items.value = [...items.value].sort(() => Math.random() - 0.5)
    await nextTick()
    animate({ duration: 600, ease: "outExpo" })
  }

  async function addItem() {
    if (items.value.length >= 8) return
    record()
    const variants = [0, 1, 2] as const
    items.value.push({ id: next_id++, variant: variants[items.value.length % 3] })
    await nextTick()
    animate({ duration: 400, ease: "outExpo" })
  }

  async function removeItem() {
    if (items.value.length === 0) return
    record()
    items.value.splice(Math.floor(Math.random() * items.value.length), 1)
    await nextTick()
    animate({ duration: 400, ease: "outExpo" })
  }
</script>

<template>
  <div class="demo">
    <div ref="container" class="demo-stage">
      <DemoSquare v-for="item in items" :key="item.id" :variant="item.variant">{{ item.id }}</DemoSquare>
    </div>
    <div class="demo-controls">
      <button class="demo-btn" @click="shuffle">Shuffle</button>
      <button class="demo-btn" @click="addItem">Add</button>
      <button class="demo-btn" @click="removeItem">Remove</button>
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