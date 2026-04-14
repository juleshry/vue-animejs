<script setup lang="ts">
  import { useTemplateRef } from "vue"
  import { useAnimate } from "@lib"

  const box = useTemplateRef("box")

  const { restart } = useAnimate(box, {
    translateX: 250,
    rotate: "1turn",
    backgroundColor: "#5350ff",
    duration: 2000,
    autoplay: true,
  })
</script>

<template>
  <div class="section">
    <h2>Animation</h2>
    <div ref="box" class="box" />
    <button @click="restart">Restart animation</button>
  </div>
</template>

<style lang="postcss" scoped>
  .section {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
  }

  .box {
    width: 100px;
    height: 100px;
    background-color: #ff3e00;
  }

  button {
    width: fit-content;
  }
</style>