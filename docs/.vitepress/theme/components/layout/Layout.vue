<script setup lang="ts">
  import DefaultTheme from "vitepress/theme"
  import { useData } from "vitepress"
  import BareLayout from "../../layouts/BareLayout.vue"

  const { Layout } = DefaultTheme
  const { frontmatter } = useData()
</script>

<template>
  <BareLayout v-if="frontmatter.layout === 'bare'" />
  <Layout v-else />
</template>