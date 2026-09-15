<script setup lang="ts">
  import { inject, ref, watchPostEffect } from "vue"
  import { useData } from "vitepress"
  import VPSwitch from "vitepress/dist/client/theme-default/components/VPSwitch.vue"

  const { isDark, theme } = useData()

  const toggleAppearance = inject<() => void>("toggle-appearance", () => {
    isDark.value = !isDark.value
  })

  const switchTitle = ref("")

  watchPostEffect(() => {
    switchTitle.value = isDark.value
      ? theme.value.lightModeSwitchTitle || "Switch to light theme"
      : theme.value.darkModeSwitchTitle || "Switch to dark theme"
  })
</script>

<template>
  <VPSwitch
    :title="switchTitle"
    class="VPSwitchAppearance"
    :aria-label="theme.darkModeSwitchLabel || 'Appearance'"
    :aria-checked="isDark"
    data-allow-mismatch="attribute"
    @click="toggleAppearance"
  >
    <span class="vpi-sun sun" aria-hidden="true" />
    <span class="vpi-moon moon" aria-hidden="true" />
  </VPSwitch>
</template>

<style scoped>
  .sun {
    opacity: 1;
  }

  .moon {
    opacity: 0;
  }

  .dark .sun {
    opacity: 0;
  }

  .dark .moon {
    opacity: 1;
  }

  .VPSwitchAppearance :deep(.check) {
    transition: transform 0.25s ease-in-out !important;
  }

  .dark .VPSwitchAppearance :deep(.check) {
    transform: translateX(1.125rem);
  }
</style>