import { createRouter, createWebHashHistory } from "vue-router"
import ComposablesPage from "./pages/ComposablesPage.vue"
import DirectivesPage from "./pages/DirectivesPage.vue"
import AnimateSection from "./pages/composables/AnimateSection.vue"
import ReactiveAnimateSection from "./pages/composables/ReactiveAnimateSection.vue"
import TimerSection from "./pages/composables/TimerSection.vue"
import TimelineSection from "./pages/composables/TimelineSection.vue"
import ReactiveTimelineSection from "./pages/composables/ReactiveTimelineSection.vue"
import AnimatableSection from "./pages/composables/AnimatableSection.vue"
import DraggableSection from "./pages/composables/DraggableSection.vue"
import LayoutSection from "./pages/composables/LayoutSection.vue"
import TextSection from "./pages/composables/TextSection.vue"
import WaapiSection from "./pages/composables/WaapiSection.vue"
import ScopeSection from "./pages/composables/ScopeSection.vue"
import VAnimateSection from "./pages/directives/VAnimateSection.vue"

export const composable_routes = [
  {
    path: "/composables/animate",
    component: AnimateSection,
    meta: { label: "useAnimate", description: "Basic animation with play/restart controls" },
  },
  {
    path: "/composables/reactive-animate",
    component: ReactiveAnimateSection,
    meta: { label: "useAnimate (reactive)", description: "Re-runs animation when options change" },
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
    path: "/composables/reactive-timeline",
    component: ReactiveTimelineSection,
    meta: { label: "useTimeline (reactive)", description: "Timeline with reactive parameters" },
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
]

export const directive_routes = [
  {
    path: "/directives/v-animate",
    component: VAnimateSection,
    meta: { label: "v-animate", description: "Declarative animation applied via template attribute" },
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