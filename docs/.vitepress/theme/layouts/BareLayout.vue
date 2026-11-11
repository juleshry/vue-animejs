<script setup lang="ts">
  import { onMounted } from "vue"
  import { Content, useRoute } from "vitepress"
  import { demoParent } from "../demo-parents"

  const route = useRoute()

  // An iframe demo opened on its own: send it to the page that embeds it
  onMounted(() => {
    if (window.self === window.top) {
      window.location.replace(demoParent(route.path) ?? "/")
    }
  })
</script>

<template>
  <Content />
</template>