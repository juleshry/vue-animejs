<script setup lang="ts">
  import { RouterView, useRoute } from "vue-router"
  import NavBar from "./components/NavBar.vue"

  const route = useRoute()
</script>

<template>
  <RouterView v-if="route.meta.bare" />
  <div v-else class="layout">
    <NavBar />
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style lang="postcss" scoped>
  .layout {
    display: flex;
    min-height: 100vh;
  }

  main {
    flex: 1;
    padding: 20px;
  }
</style>