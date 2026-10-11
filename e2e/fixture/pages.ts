import type { Component } from "vue"
import ControlNoCreated from "./pages/ControlNoCreated.vue"
import ControlNoSSR from "./pages/ControlNoSSR.vue"
import VAnimate from "./pages/VAnimate.vue"
import VAnimateUserStyle from "./pages/VAnimateUserStyle.vue"
import VSvgDrawable from "./pages/VSvgDrawable.vue"
import VTextSplit from "./pages/VTextSplit.vue"
import VWaapi from "./pages/VWaapi.vue"

/** Every page the fixture server can render, by URL path (`/v-animate`, …). */
export const pages: Record<string, Component> = {
  "v-animate": VAnimate,
  "v-animate-user-style": VAnimateUserStyle,
  "v-waapi": VWaapi,
  "v-svg-drawable": VSvgDrawable,
  "v-text-split": VTextSplit,
  "control-no-ssr": ControlNoSSR,
  "control-no-created": ControlNoCreated,
}