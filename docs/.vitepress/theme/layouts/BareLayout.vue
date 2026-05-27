<script setup lang="ts">
  import { onMounted } from "vue"
  import { Content } from "vitepress"

  onMounted(() => {
    if (window.self === window.top) {
      window.location.replace("/composables/use-scope")
    }
  })
</script>

<template>
  <Content />
</template>