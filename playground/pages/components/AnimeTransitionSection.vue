<script setup lang="ts">
  import { ref } from "vue"
  import { AnimeTransition } from "@lib"
  import SectionWrapper from "../../components/SectionWrapper.vue"

  const show = ref(true)
  const colors = ["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff"]
  const index = ref(0)
</script>

<template>
  <SectionWrapper>
    <template #title>AnimeTransition</template>

    <h3>Toggle (v-if, appear)</h3>
    <div class="stage">
      <AnimeTransition
        appear
        :enter="{ opacity: [0, 1], translateY: [20, 0], duration: 500, ease: 'outExpo' }"
        :leave="{ opacity: 0, translateY: -20, duration: 250, ease: 'inQuad' }"
      >
        <div v-if="show" class="box" />
      </AnimeTransition>
    </div>
    <button @click="show = !show">{{ show ? "Hide" : "Show" }}</button>

    <h3>Swap (key, out-in)</h3>
    <div class="stage">
      <AnimeTransition
        mode="out-in"
        :enter="{ scale: [0.6, 1], opacity: [0, 1], duration: 400 }"
        :leave="{ opacity: 0, translateY: -20, duration: 250, ease: 'inQuad' }"
      >
        <div :key="index" class="box" :style="{ backgroundColor: colors[index] }" />
      </AnimeTransition>
    </div>
    <button @click="index = (index + 1) % colors.length">Next</button>
  </SectionWrapper>
</template>

<style lang="postcss" scoped>
  h3 {
    margin: 8px 0 0;
    font-size: 15px;
  }

  .stage {
    display: flex;
    align-items: center;
    height: 100px;
  }

  .box {
    width: 80px;
    height: 80px;
    border-radius: 10px;
    background-color: #c77dff;
  }

  button {
    width: fit-content;
  }
</style>