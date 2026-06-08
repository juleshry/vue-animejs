<script setup lang="ts">
  import DefaultTheme from "vitepress/theme"
  import { useData } from "vitepress"
  import BareLayout from "../../layouts/BareLayout.vue"

  const { Layout } = DefaultTheme
  const { frontmatter } = useData()
</script>

<template>
  <BareLayout v-if="frontmatter.layout === 'bare'" />
  <Layout v-else>
    <template #layout-top>
      <div :class="$style.warningBanner">
        ⚠️ This library is a work in progress. The API is not stable and may change at any time.
      </div>
    </template>
  </Layout>
</template>

<style module>
  .warningBanner {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: calc(var(--vp-z-index-nav) + 1);
    text-align: center;
    padding: 8px 16px;
    background: #fef3c7;
    color: var(--vp-custom-block-warning-text);
    font-size: 14px;
    line-height: 1.4;
    border-bottom: 1px solid var(--vp-custom-block-warning-border);
  }

  :global(.dark) .warningBanner {
    background: #2d2004;
  }
</style>