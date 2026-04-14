<script setup lang="ts">
  import { onMounted, useTemplateRef } from "vue"
  import { useAnimatable } from "@lib"
  import { clamp } from "animejs"

  const circle = useTemplateRef("circle")
  const bounds = useTemplateRef("bounds")

  const { animatable } = useAnimatable(circle, { x: 250, y: 250 })

  onMounted(() => {
    if (!bounds.value) return

    let { left, top, width, height } = bounds.value.getBoundingClientRect()

    window.addEventListener("scroll", () => {
      const new_bounds = bounds.value?.getBoundingClientRect()
      if (!new_bounds) return
      left = new_bounds.left
      top = new_bounds.top
      width = new_bounds.width
      height = new_bounds.height
    })

    window.addEventListener("mousemove", e => {
      const new_x = clamp(e.clientX - left - 50 / 2, left - 50, left + width - 50)
      const new_y = clamp(e.clientY - top - 50 / 2, -50 / 2, height - 50 / 2)
      animatable.value?.x(new_x)
      animatable.value?.y(new_y)
    })
  })
</script>

<template>
  <div class="section">
    <h2>Animatable</h2>
    <div ref="bounds" class="bounds">
      <div ref="circle" class="circle" />
    </div>
  </div>
</template>

<style lang="postcss" scoped>
  .section {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
  }

  .bounds {
    width: 500px;
    height: 250px;
    border: 1px solid #b3b3b3;
    border-radius: 10px;
    background-color: rgba(0, 0, 0, 0.16);
    overflow: hidden;
  }

  .circle {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #afaeff;
  }
</style>