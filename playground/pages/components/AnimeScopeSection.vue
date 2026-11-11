<script setup lang="ts">
  import { onMounted, useTemplateRef } from "vue"
  import { stagger } from "animejs"
  import { AnimeScope, useRawAnimate } from "@lib"
  import SectionWrapper from "../../components/SectionWrapper.vue"

  const bouncy = useTemplateRef("bouncy")
  const smooth = useTemplateRef("smooth")

  // Same method, same ".dot" selector: each scope only animates its own dots, with its own defaults
  onMounted(() => {
    for (const scope of [bouncy.value, smooth.value]) {
      scope?.registerMethod("pulse", () => {
        useRawAnimate(".dot", { scale: [1, 1.6, 1], delay: stagger(80) })
      })
    }
  })
</script>

<template>
  <SectionWrapper>
    <template #title>AnimeScope</template>
    <div class="cards">
      <div class="card">
        <AnimeScope ref="bouncy" class="dots" :options="{ defaults: { duration: 900, ease: 'outElastic(1, .4)' } }">
          <span v-for="i in 5" :key="i" class="dot bouncy" />
        </AnimeScope>
        <button @click="bouncy?.scope?.methods.pulse()">Pulse (elastic)</button>
      </div>
      <div class="card">
        <AnimeScope ref="smooth" class="dots" :options="{ defaults: { duration: 600, ease: 'inOutSine' } }">
          <span v-for="i in 5" :key="i" class="dot smooth" />
        </AnimeScope>
        <button @click="smooth?.scope?.methods.pulse()">Pulse (sine)</button>
      </div>
    </div>
    <h3>Media queries</h3>
    <p class="hint">Drag the bottom-right corner: the scope switches animations at 420px.</p>
    <div class="frame-wrap">
      <iframe src="#/frames/anime-scope" />
    </div>
  </SectionWrapper>
</template>

<style lang="postcss" scoped>
  .cards {
    display: flex;
    gap: 24px;
  }

  .card {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .dots {
    display: flex;
    gap: 12px;
    padding: 16px;
    border: 1px dashed #333;
    border-radius: 10px;
  }

  .dot {
    width: 20px;
    height: 20px;
    border-radius: 50%;
  }

  .bouncy {
    background-color: #ff6b6b;
  }

  .smooth {
    background-color: #4d96ff;
  }

  button {
    width: fit-content;
  }

  h3 {
    margin: 16px 0 0;
    font-size: 15px;
  }

  .hint {
    margin: 0;
    font-size: 13px;
    color: #888;
  }

  .frame-wrap {
    overflow: hidden;
    resize: horizontal;
    width: 640px;
    min-width: 240px;
    max-width: 100%;
    border: 1px dashed #333;
    border-radius: 10px;
  }

  iframe {
    display: block;
    width: 100%;
    height: 200px;
    border: none;
  }
</style>