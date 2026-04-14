<script setup lang="ts">
  import { useTemplateRef } from "vue"
  import { useDraggable } from "@lib"

  const draggable = useTemplateRef("draggable")

  useDraggable(draggable, { container: ".draggable_bounds" })
</script>

<template>
  <div class="section">
    <h2>Draggable</h2>
    <div class="draggable_bounds">
      <div ref="draggable" class="circle">
        <p v-for="i in 3" :key="i">···</p>
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
  .section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .draggable_bounds {
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
</style>