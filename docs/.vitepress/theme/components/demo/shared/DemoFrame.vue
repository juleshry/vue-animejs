<script setup lang="ts">
  // A horizontally resizable iframe, for demos whose media queries need a viewport of their own
  defineProps<{
    src: string
    height?: string
  }>()
</script>

<template>
  <div class="demo-frame-wrap">
    <iframe :src="src" class="demo-frame" :style="{ height: height ?? '280px' }" />
  </div>
</template>

<style scoped>
  .demo-frame-wrap {
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
    margin: 24px 0;
    overflow: hidden;
    resize: horizontal;
    min-width: 320px;
    max-width: 100%;
    width: 100%;
  }

  .demo-frame {
    display: block;
    width: 100%;
    border: none;
  }
</style>