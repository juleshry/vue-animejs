<script setup lang="ts">
  import { ref, computed } from "vue"
  import { vAnimatable } from "@lib"
  import SectionWrapper from "../../components/SectionWrapper.vue"

  // Sliders drive x/y directly — animatable smoothly transitions on each change
  const x = ref(0)
  const y = ref(0)
  const duration = ref(600)

  const box_value = computed(() => ({
    x: x.value,
    y: y.value,
    duration: duration.value,
    ease: "out(3)",
  }))

  // Spring demo — toggle between two positions
  const toggled = ref(false)
  const spring_value = computed(() => ({
    x: toggled.value ? 220 : 0,
    duration: 800,
    ease: "spring(1, 80, 10, 0)",
  }))
</script>

<template>
  <SectionWrapper>
    <template #title>v-animatable</template>

    <p class="label">Reactive x / y — drag sliders to animate</p>
    <div class="track">
      <div v-animatable="box_value" class="box" />
    </div>
    <div class="controls">
      <label>x: {{ x }}px</label>
      <input type="range" min="0" max="220" step="1" v-model.number="x" />
      <label>y: {{ y }}px</label>
      <input type="range" min="0" max="100" step="1" v-model.number="y" />
      <label>duration: {{ duration }}ms</label>
      <input type="range" min="100" max="2000" step="100" v-model.number="duration" />
    </div>

    <p class="label">Spring ease — toggle position</p>
    <div class="track">
      <div v-animatable="spring_value" class="box spring-box" />
    </div>
    <div class="controls">
      <button @click="toggled = !toggled">Toggle</button>
    </div>
  </SectionWrapper>
</template>

<style lang="postcss" scoped>
  .track {
    width: 360px;
    height: 130px;
    border: 1px solid #b3b3b3;
    border-radius: 10px;
    background-color: rgba(0, 0, 0, 0.16);
    display: flex;
    align-items: flex-start;
    padding: 16px;
    box-sizing: border-box;
  }

  .box {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    background-color: #afaeff;
    flex-shrink: 0;
  }

  .spring-box {
    background-color: #ff9f6b;
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
    flex-wrap: wrap;

    & input[type="range"] {
      width: 140px;
      accent-color: #afaeff;
    }

    & button {
      padding: 4px 16px;
      border-radius: 6px;
      border: 1px solid #555;
      background: transparent;
      color: #ccc;
      cursor: pointer;

      &:hover {
        background: rgba(255, 255, 255, 0.08);
      }
    }
  }
</style>