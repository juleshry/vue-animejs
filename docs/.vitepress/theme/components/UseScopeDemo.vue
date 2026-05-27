<template>
  <div class="demo-frame-wrap">
    <iframe src="/demos/use-scope" class="demo-frame" />
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
    height: 280px;
    border: none;
  }
</style>