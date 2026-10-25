<script setup lang="ts">
  import { ref } from "vue"
  import { AnimeTransitionGroup } from "@lib"

  const items = ref(["a", "b", "c"])

  function removeB() {
    items.value = items.value.filter(item => item !== "b")
  }

  function removeAB() {
    items.value = items.value.filter(item => item !== "a" && item !== "b")
  }

  function add() {
    items.value = [...items.value, String.fromCharCode(97 + items.value.length)]
  }
</script>

<template>
  <AnimeTransitionGroup
    tag="ul"
    appear
    :stagger="100"
    :enter="{ opacity: [0, 1], translateY: [20, 0], duration: 600, delay: 300 }"
    :leave="{ opacity: 0, duration: 200 }"
  >
    <li v-for="(item, i) in items" :key="item" :data-test="i === 0 ? 'target' : `item-${item}`">{{ item }}</li>
  </AnimeTransitionGroup>
  <button data-test="add" @click="add">Add</button>
  <button data-test="remove-b" @click="removeB">Remove b</button>
  <button data-test="remove-a-b" @click="removeAB">Remove a and b</button>
</template>