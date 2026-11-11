<script setup lang="ts">
  import { nextTick, ref, useTemplateRef } from "vue"
  import { AnimeLayout } from "@lib"
  import SectionWrapper from "../../components/SectionWrapper.vue"

  const layout_items = ref([
    { id: 1, color: "#ff6b6b" },
    { id: 2, color: "#ffd93d" },
    { id: 3, color: "#6bcb77" },
    { id: 4, color: "#4d96ff" },
    { id: 5, color: "#c77dff" },
    { id: 6, color: "#ff9f1c" },
  ])
  const duration = ref(250)
  const grid = useTemplateRef("grid")

  // Vue patches the DOM asynchronously, so record → change state → nextTick → animate (not `update()`)
  async function shuffle() {
    if (!grid.value) return

    grid.value.record()
    layout_items.value = [...layout_items.value].sort(() => Math.random() - 0.5)
    await nextTick()
    grid.value.animate()
  }
</script>

<template>
  <SectionWrapper>
    <template #title>AnimeLayout</template>
    <AnimeLayout ref="grid" class="layout_grid" :options="{ duration }">
      <div v-for="item in layout_items" :key="item.id" class="layout_item" :style="{ backgroundColor: item.color }" />
    </AnimeLayout>
    <div class="controls">
      <button @click="shuffle">Shuffle</button>
      <label class="grid_duration">
        Duration
        <input v-model.number="duration" type="range" min="100" max="1500" step="50" />
        {{ duration }}ms
      </label>
    </div>
  </SectionWrapper>
</template>

<style lang="postcss" scoped>
  .layout_grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    width: 290px;
  }

  .layout_item {
    width: 80px;
    height: 80px;
    border-radius: 10px;
  }

  .controls {
    display: flex;
    flex-direction: column;
    gap: 8px;

    & .grid_duration {
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }

  button {
    width: fit-content;
  }
</style>