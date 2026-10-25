<script setup lang="ts">
  import { ref } from "vue"
  import { AnimeTransitionGroup } from "@lib"
  import SectionWrapper from "../../components/SectionWrapper.vue"

  const colors = ["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#c77dff", "#ff9f1c"]
  let next_id = 4
  const items = ref([1, 2, 3])

  const MAX_ITEMS = 9

  // Up to three new items (without going over MAX_ITEMS), each at a random position
  function addThree() {
    const next = [...items.value]
    const count = Math.min(3, MAX_ITEMS - next.length)
    for (let n = 0; n < count; n++) next.splice(randomIndex(next.length + 1), 0, next_id++)
    items.value = next
  }

  // Three items picked at random (or all of them, when fewer are left)
  function removeThree() {
    const next = [...items.value]
    for (let n = 0; n < 3 && next.length > 0; n++) next.splice(randomIndex(next.length), 1)
    items.value = next
  }

  function removeRandom() {
    const i = randomIndex(items.value.length)
    items.value = items.value.filter((_, j) => j !== i)
  }

  function randomIndex(length: number): number {
    return Math.floor(Math.random() * length)
  }
</script>

<template>
  <SectionWrapper>
    <template #title>AnimeTransitionGroup</template>
    <AnimeTransitionGroup
      tag="div"
      class="list"
      appear
      :stagger="80"
      :enter="{ opacity: [0, 1], scale: [0.5, 1], duration: 500, ease: 'outBack' }"
      :leave="{ opacity: 0, scale: 0.5, duration: 250, ease: 'inQuad' }"
    >
      <div v-for="item in items" :key="item" class="item" :style="{ backgroundColor: colors[item % colors.length] }">
        {{ item }}
      </div>
    </AnimeTransitionGroup>
    <div class="controls">
      <button @click="addThree">Add 3</button>
      <button @click="removeThree">Remove 3</button>
      <button @click="removeRandom">Remove random</button>
    </div>
  </SectionWrapper>
</template>

<style lang="postcss" scoped>
  .list {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    width: 380px;
    min-height: 60px;
  }

  .item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    border-radius: 10px;
    color: #111;
    font-weight: 600;
  }

  .controls {
    display: flex;
    gap: 8px;
  }
</style>