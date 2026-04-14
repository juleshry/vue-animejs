<template>
  <div class="section">
    <h2><slot name="title" /></h2>
    <slot />
  </div>
</template>

<style lang="postcss" scoped>
  .section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
</style>