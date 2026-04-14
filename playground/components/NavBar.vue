<script setup lang="ts">
  import { RouterLink } from "vue-router"
  import { routes } from "../router"

  const nav_routes = routes.filter((r): r is typeof r & { meta: { label: string } } => !!r.meta?.label)
</script>

<template>
  <nav>
    <span class="title">vue-animejs</span>
    <RouterLink v-for="route in nav_routes" :key="route.path" :to="route.path">
      {{ route.meta.label }}
    </RouterLink>
  </nav>
</template>

<style lang="postcss" scoped>
  nav {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 160px;
    flex-shrink: 0;
    padding: 20px 16px;
    border-right: 1px solid #2a2a2a;
    min-height: 100vh;
  }

  .title {
    font-size: 13px;
    font-weight: 600;
    color: #888;
    margin-bottom: 12px;
    letter-spacing: 0.04em;
  }

  a {
    font-size: 14px;
    color: #ccc;
    text-decoration: none;
    padding: 5px 8px;
    border-radius: 6px;

    &:hover {
      color: #fff;
      background-color: #1e1e1e;
    }

    &.router-link-active {
      color: #afaeff;
      background-color: #1e1e1e;
    }
  }
</style>
