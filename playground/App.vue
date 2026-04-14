<script setup lang="ts">
  import { RouterView } from "vue-router"
  import NavBar from "./components/NavBar.vue"
</script>

<template>
  <div class="layout">
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