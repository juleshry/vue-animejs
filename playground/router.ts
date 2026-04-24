import { createRouter, createWebHashHistory } from "vue-router"
import AnimateSection from "./components/AnimateSection.vue"
import TimerSection from "./components/TimerSection.vue"
import TimelineSection from "./components/TimelineSection.vue"
import AnimatableSection from "./components/AnimatableSection.vue"
import DraggableSection from "./components/DraggableSection.vue"
import LayoutSection from "./components/LayoutSection.vue"
import TextSection from "./components/TextSection.vue"
import WaapiSection from "./components/WaapiSection.vue"
import ScopeSection from "./components/ScopeSection.vue"

export const routes = [
  { path: "/animate", component: AnimateSection, meta: { label: "Animation" } },
  { path: "/timer", component: TimerSection, meta: { label: "Timer" } },
  { path: "/timeline", component: TimelineSection, meta: { label: "Timeline" } },
  { path: "/animatable", component: AnimatableSection, meta: { label: "Animatable" } },
  { path: "/draggable", component: DraggableSection, meta: { label: "Draggable" } },
  { path: "/layout", component: LayoutSection, meta: { label: "Layout" } },
  { path: "/text", component: TextSection, meta: { label: "Text" } },
  { path: "/waapi", component: WaapiSection, meta: { label: "WAAPI" } },
  { path: "/scope", component: ScopeSection, meta: { label: "Scope" } },
  { path: "/", redirect: "/animate" },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
