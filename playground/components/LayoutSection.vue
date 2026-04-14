<script setup lang="ts">
  import { nextTick, ref, useTemplateRef } from "vue"
  import { useLayout } from "@lib"
  import SectionWrapper from "./SectionWrapper.vue"

  const layout_root = useTemplateRef("layout_root")
  const { record, animate: animateLayout } = useLayout(layout_root, {})

  const layout_items = ref([
    { id: 1, color: "#ff6b6b" },
    { id: 2, color: "#ffd93d" },
    { id: 3, color: "#6bcb77" },
    { id: 4, color: "#4d96ff" },
    { id: 5, color: "#c77dff" },
    { id: 6, color: "#ff9f1c" },
  ])

  async function shuffleLayout() {
    record()
    layout_items.value = [...layout_items.value].sort(() => Math.random() - 0.5)
    await nextTick()
    animateLayout({ duration: 250 })
  }
</script>

<template>
  <SectionWrapper>
    <template #title>Layout</template>
    <div ref="layout_root" class="layout_grid">
      <div
        v-for="item in layout_items"
        :key="item.id"
        class="layout_item"
        :style="{ backgroundColor: item.color }"
      />
    </div>
    <button @click="shuffleLayout">Shuffle</button>
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

  button {
    width: fit-content;
  }
</style>