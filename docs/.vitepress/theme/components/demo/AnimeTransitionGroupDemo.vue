<script setup lang="ts">
  import { ref } from "vue"
  import { AnimeTransitionGroup } from "@juleshry/vue-animejs"
  import DemoSquare from "./shared/DemoSquare.vue"

  let next_id = 4
  const items = ref([1, 2, 3])

  // Each new item goes in at a random position
  function addThree() {
    let add_number = 3
    if (items.value.length > 6) add_number = 9 - items.value.length
    const next = [...items.value]
    for (let n = 0; n < add_number; n++) next.splice(randomIndex(next.length + 1), 0, next_id++)
    items.value = next
  }

  // Three items picked at random (or all of them, when fewer are left)
  function removeThree() {
    const next = [...items.value]
    for (let n = 0; n < 3 && next.length > 0; n++) next.splice(randomIndex(next.length), 1)
    items.value = next
  }

  function randomIndex(length: number): number {
    return Math.floor(Math.random() * length)
  }

  function removeOne() {
    const i = randomIndex(items.value.length)
    items.value = items.value.filter((_, j) => j !== i)
  }
</script>

<template>
  <div class="demo">
    <AnimeTransitionGroup
      tag="div"
      appear
      :stagger="80"
      :enter="{ opacity: [0, 1], scale: [0.5, 1], duration: 500, ease: 'outBack' }"
      :leave="{ opacity: 0, scale: 0.5, duration: 250, ease: 'inQuad' }"
      class="demo-stage"
    >
      <DemoSquare v-for="item in items" :key="item" :variant="(item % 3) as 0 | 1 | 2">{{ item }}</DemoSquare>
    </AnimeTransitionGroup>
    <div class="demo-controls">
      <button class="demo-btn" @click="addThree">Add 3</button>
      <button class="demo-btn" @click="removeThree">Remove 3</button>
      <button class="demo-btn" @click="removeOne">Remove one</button>
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
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    min-height: 82px;
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