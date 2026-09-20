<script setup lang="ts">
  import { ref, computed, watch, useTemplateRef } from "vue"
  import { useTimer } from "@lib"
  import SectionWrapper from "../../components/SectionWrapper.vue"

  const time = ref<number>(0)
  const count = ref<number>(0)

  const { play, pause } = useTimer({
    duration: 1000,
    loop: true,
    frameRate: 30,
    autoplay: false,
    onUpdate: self => (time.value = self.currentTime),
    onLoop: self => (count.value = self._currentIteration),
  })

  // Regression demo: `options` resolves via a template ref, which is `null` during setup()
  // and populated right before mount — the exact transition that used to trigger two
  // independent createTimer() calls (one from the mount-time watch tick, one from the
  // unconditional tryOnMounted creation). `creationCount` should stay at 1.
  const anchorEl = useTemplateRef<HTMLDivElement>("anchorEl")
  const creationCount = ref(0)

  const mountAwareOptions = computed(() =>
    anchorEl.value ? { duration: 1000, autoplay: false } : { duration: 0, autoplay: false }
  )

  const { timer: regressionTimer } = useTimer(mountAwareOptions)

  watch(regressionTimer, instance => {
    if (instance) creationCount.value++
  })
</script>

<template>
  <SectionWrapper>
    <template #title>Timer</template>
    <span>Time: {{ time }} ms</span>
    <span>Count: {{ count }}</span>
    <div class="controls">
      <button @click="play">Start timer</button>
      <button @click="pause">Pause timer</button>
    </div>
  </SectionWrapper>

  <SectionWrapper>
    <template #title>Mount-time options (regression)</template>
    <div ref="anchorEl" class="box" />
    <span>Instance created: {{ creationCount }} time(s) — should stay 1</span>
  </SectionWrapper>
</template>

<style lang="postcss" scoped>
  .controls {
    display: flex;
    gap: 10px;
  }

  button {
    width: fit-content;
  }

  .box {
    width: 20px;
    height: 20px;
    background-color: #ff3e00;
  }
</style>