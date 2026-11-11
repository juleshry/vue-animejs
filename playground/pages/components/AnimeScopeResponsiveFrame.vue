<script setup lang="ts">
  import { onMounted, ref, useTemplateRef } from "vue"
  import { stagger } from "animejs"
  import { AnimeScope, useRawAnimate } from "@lib"

  // Rendered alone in an iframe (route meta `bare`): the scope's media query follows the frame's width
  const stage = useTemplateRef("stage")
  const is_narrow = ref(false)

  // The scope re-runs this whenever "narrow" starts or stops matching, reverting the previous animations first
  onMounted(() => {
    stage.value?.add(scope => {
      is_narrow.value = scope?.matches.narrow ?? false
      if (is_narrow.value) {
        useRawAnimate(".square", { rotate: "1turn", ease: "inOutQuart", delay: stagger(150) })
      } else {
        useRawAnimate(".square", { y: [-24, 24], alternate: true, ease: "inOutSine", delay: stagger(120) })
      }
    })
  })
</script>

<template>
  <div class="frame">
    <p class="label">
      <code>(max-width: 420px)</code> → <strong>{{ is_narrow ? "narrow: spin" : "wide: wave" }}</strong>
    </p>
    <AnimeScope
      ref="stage"
      class="stage"
      :options="{ mediaQueries: { narrow: '(max-width: 420px)' }, defaults: { duration: 900, loop: true } }"
    >
      <span v-for="i in 4" :key="i" class="square" />
    </AnimeScope>
  </div>
</template>

<style lang="postcss" scoped>
  .frame {
    padding: 16px;
  }

  .label {
    margin: 0;
    font-size: 13px;
    color: #888;
  }

  .stage {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    height: 140px;
  }

  .square {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background-color: #c77dff;
  }
</style>