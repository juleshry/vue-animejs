import { createRouter, createWebHashHistory } from "vue-router"
import ComposablesPage from "./pages/ComposablesPage.vue"
import DirectivesPage from "./pages/DirectivesPage.vue"
import AnimateSection from "./pages/composables/AnimateSection.vue"
import TimerSection from "./pages/composables/TimerSection.vue"
import TimelineSection from "./pages/composables/TimelineSection.vue"
import AnimatableSection from "./pages/composables/AnimatableSection.vue"
import DraggableSection from "./pages/composables/DraggableSection.vue"
import LayoutSection from "./pages/composables/LayoutSection.vue"
import TextSection from "./pages/composables/TextSection.vue"
import WaapiSection from "./pages/composables/WaapiSection.vue"
import ScopeSection from "./pages/composables/ScopeSection.vue"
import SvgSection from "./pages/composables/SvgSection.vue"
import SvgDrawableSection from "./pages/composables/SvgDrawableSection.vue"
import VAnimatableSection from "./pages/directives/VAnimatableSection.vue"
import VAnimateSection from "./pages/directives/VAnimateSection.vue"
import VDraggableSection from "./pages/directives/VDraggableSection.vue"
import VSvgDrawableSection from "./pages/directives/VSvgDrawableSection.vue"
import VWaapiSection from "./pages/directives/VWaapiSection.vue"
import VTextSplitSection from "./pages/directives/VTextSplitSection.vue"

export const composable_routes = [
  {
    path: "/composables/animate",
    component: AnimateSection,
    meta: { label: "useAnimate", description: "Basic animation with play/restart controls" },
  },
  {
    path: "/composables/timer",
    component: TimerSection,
    meta: { label: "useTimer", description: "Timer with frame rate and loop controls" },
  },
  {
    path: "/composables/timeline",
    component: TimelineSection,
    meta: { label: "useTimeline", description: "Chain multiple animations in sequence" },
  },
  {
    path: "/composables/animatable",
    component: AnimatableSection,
    meta: { label: "useAnimatable", description: "Prepare elements as optimized animation targets" },
  },
  {
    path: "/composables/draggable",
    component: DraggableSection,
    meta: { label: "useDraggable", description: "Drag interactions with inertia and snapping" },
  },
  {
    path: "/composables/layout",
    component: LayoutSection,
    meta: { label: "useLayout", description: "FLIP-based layout transition animations" },
  },
  {
    path: "/composables/text",
    component: TextSection,
    meta: { label: "useText", description: "Split text into chars/words for staggered animations" },
  },
  {
    path: "/composables/waapi",
    component: WaapiSection,
    meta: { label: "useWaapi", description: "Web Animations API integration" },
  },
  {
    path: "/composables/scope",
    component: ScopeSection,
    meta: { label: "useScope", description: "Media-query-aware animation scopes" },
  },
  {
    path: "/composables/svg",
    component: SvgSection,
    meta: { label: "useSvg", description: "SVG morphing and motion path utilities" },
  },
  {
    path: "/composables/svg-drawable",
    component: SvgDrawableSection,
    meta: { label: "useSvgDrawable", description: "Animate SVG stroke draw with a drawable proxy" },
  },
]

export const directive_routes = [
  {
    path: "/directives/v-animate",
    component: VAnimateSection,
    meta: { label: "v-animate", description: "Declarative animation applied via template attribute" },
  },
  {
    path: "/directives/v-animatable",
    component: VAnimatableSection,
    meta: { label: "v-animatable", description: "Animate element properties directly from reactive binding value" },
  },
  {
    path: "/directives/v-draggable",
    component: VDraggableSection,
    meta: { label: "v-draggable", description: "Declarative drag interaction applied via template attribute" },
  },
  {
    path: "/directives/v-svg-drawable",
    component: VSvgDrawableSection,
    meta: { label: "v-svg-drawable", description: "Prepare an SVG geometry element as a drawable stroke" },
  },
  {
    path: "/directives/v-waapi",
    component: VWaapiSection,
    meta: { label: "v-waapi", description: "Declarative WAAPI animation applied via template attribute" },
  },
  {
    path: "/directives/v-text-split",
    component: VTextSplitSection,
    meta: { label: "v-text-split", description: "Split text into chars/words/lines and animate them" },
  },
]

export const routes = [
  { path: "/composables", component: ComposablesPage },
  ...composable_routes,
  { path: "/directives", component: DirectivesPage },
  ...directive_routes,
  { path: "/", redirect: "/composables" },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})