<script setup lang="ts">
  import { RouterLink } from "vue-router"
  import { composable_routes } from "../router"
</script>

<template>
  <div class="page">
    <h1>Composables</h1>
    <div class="grid">
      <RouterLink v-for="route in composable_routes" :key="route.path" :to="route.path" class="card">
        <span class="name">{{ route.meta.label }}</span>
        <span class="desc">{{ route.meta.description }}</span>
      </RouterLink>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
  .page {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  h1 {
    font-size: 22px;
    font-weight: 600;
    color: #fff;
    margin: 0;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }

  .card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 16px;
    border: 1px solid #2a2a2a;
    border-radius: 10px;
    text-decoration: none;
    background-color: #111;
    transition:
      border-color 0.15s,
      background-color 0.15s;

    &:hover {
      border-color: #444;
      background-color: #1a1a1a;
    }
  }

  .name {
    font-size: 14px;
    font-weight: 500;
    color: #afaeff;
  }

  .desc {
    font-size: 12px;
    color: #666;
    line-height: 1.4;
  }
</style>