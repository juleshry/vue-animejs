<script setup lang="ts">
  import { computed, ref } from "vue"
  import { vDraggable } from "@lib"
  import SectionWrapper from "../../components/SectionWrapper.vue"

  const snap_enabled = ref(false)
  const snap_size = ref(50)

  const static_options = { container: ".bounds" }

  const reactive_options = computed(() => ({
    container: ".reactive-bounds",
    ...(snap_enabled.value ? { snap: snap_size.value } : {}),
  }))
</script>

<template>
  <SectionWrapper>
    <template #title>v-draggable</template>

    <p class="label">Static options</p>
    <div class="bounds">
      <div v-draggable="static_options" class="circle">
        <p v-for="i in 3" :key="i">···</p>
      </div>
    </div>

    <p class="label">Reactive options — toggle snap to re-create draggable</p>
    <div class="bounds reactive-bounds">
      <div v-draggable="reactive_options" class="circle">
        <p v-for="i in 3" :key="i">···</p>
      </div>
    </div>
    <div class="controls">
      <label>
        <input type="checkbox" v-model="snap_enabled" />
        Snap
      </label>
      <label>Grid: {{ snap_size }}px</label>
      <input type="range" min="10" max="100" step="10" v-model.number="snap_size" :disabled="!snap_enabled" />
    </div>
  </SectionWrapper>
</template>

<style lang="postcss" scoped>
  .bounds {
    width: 500px;
    height: 250px;
    border: 1px solid #b3b3b3;
    border-radius: 10px;
    background-color: rgba(0, 0, 0, 0.16);
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .circle {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #afaeff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0;

    & p {
      margin: 0;
      line-height: 5px;
      user-select: none;
    }
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

    & input[type="range"] {
      width: 140px;
      accent-color: #afaeff;
    }
  }
</style>