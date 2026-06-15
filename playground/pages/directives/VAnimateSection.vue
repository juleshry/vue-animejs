<script setup lang="ts">
  import { ref, computed } from "vue"
  import { vAnimate } from "@lib"
  import SectionWrapper from "../../components/SectionWrapper.vue"

  const static_options = {
    translateX: 250,
    rotate: "1turn",
    backgroundColor: "#5350ff",
    duration: 2000,
    loop: true,
    alternate: true,
  }

  const duration = ref(1500)
  const options = computed(() => ({
    translateX: 250,
    backgroundColor: "#5350ff",
    duration: duration.value,
    loop: true,
    alternate: true,
  }))
</script>

<template>
  <SectionWrapper>
    <template #title>v-animate</template>

    <p class="label">Static options</p>
    <div v-animate="static_options" class="box" />

    <p class="label">Reactive options — change duration to re-run</p>
    <div v-animate="options" class="box" />
    <div class="controls">
      <label>Duration: {{ duration }}ms</label>
      <input type="range" min="200" max="3000" step="100" v-model.number="duration" />
    </div>
  </SectionWrapper>
</template>

<style lang="postcss" scoped>
  .box {
    width: 80px;
    height: 80px;
    background-color: #ff3e00;
    border-radius: 6px;
  }

  .label {
    font-size: 13px;
    color: #888;
    margin: 0;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    color: #ccc;
  }

  input[type="range"] {
    width: 160px;
    accent-color: #afaeff;
  }
</style>