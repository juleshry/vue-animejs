<script setup lang="ts">
  import AnimateSection from "./components/AnimateSection.vue"
  import TimerSection from "./components/TimerSection.vue"
  import TimelineSection from "./components/TimelineSection.vue"
  import AnimatableSection from "./components/AnimatableSection.vue"
  import DraggableSection from "./components/DraggableSection.vue"
  import LayoutSection from "./components/LayoutSection.vue"
  import TextSection from "./components/TextSection.vue"
  import WaapiSection from "./components/WaapiSection.vue"
</script>

<template>
  <div class="container">
    <h1>Vue-Animejs Playground</h1>
    <AnimateSection />
    <TimerSection />
    <TimelineSection />
    <AnimatableSection />
    <DraggableSection />
    <LayoutSection />
    <TextSection />
    <WaapiSection />
  </div>
</template>

<style lang="postcss" scoped>
  .container {
    margin: 20px;
  }
</style>