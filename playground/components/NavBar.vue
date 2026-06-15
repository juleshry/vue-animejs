<script setup lang="ts">
  import { RouterLink } from "vue-router"
  import { composable_routes, directive_routes } from "../router"
</script>

<template>
  <nav>
    <span class="title">vue-animejs</span>

    <div class="section">
      <RouterLink to="/composables" class="section-header">Composables</RouterLink>
      <RouterLink v-for="route in composable_routes" :key="route.path" :to="route.path" class="sub-link">
        {{ route.meta.label }}
      </RouterLink>
    </div>

    <div class="section">
      <RouterLink to="/directives" class="section-header">Directives</RouterLink>
      <RouterLink v-for="route in directive_routes" :key="route.path" :to="route.path" class="sub-link">
        {{ route.meta.label }}
      </RouterLink>
    </div>
  </nav>
</template>

<style lang="postcss" scoped>
  nav {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 200px;
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

  .section {
    display: flex;
    flex-direction: column;
    gap: 1px;
    margin-bottom: 8px;
  }

  .section-header {
    font-size: 13px;
    font-weight: 600;
    color: #aaa;
    text-decoration: none;
    padding: 5px 8px;
    border-radius: 6px;
    margin-bottom: 2px;

    &:hover {
      color: #fff;
      background-color: #1e1e1e;
    }

    &.router-link-active {
      color: #fff;
    }
  }

  .sub-link {
    font-size: 13px;
    color: #666;
    text-decoration: none;
    padding: 4px 8px 4px 16px;
    border-radius: 6px;

    &:hover {
      color: #ccc;
      background-color: #1e1e1e;
    }

    &.router-link-active {
      color: #afaeff;
      background-color: #1e1e1e;
    }
  }
</style>