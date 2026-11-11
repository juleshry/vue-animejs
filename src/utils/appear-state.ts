import { type AnimationParams } from "animejs"
import { type ObjectDirective } from "vue"
import { deferMount } from "./deferred-mount.ts"
import { getInitialStyle } from "./initial-style.ts"
import { stripSSRProps, toSSRProps } from "./ssr-props.ts"

/** The binding of `vAppearState`. */
export interface AppearState {
  /** The enter animation, whose starting values are rendered on the server. */
  enter: AnimationParams | undefined
  /** Plays the enter animation on `el`, once it has been hydrated. */
  start: (el: Element) => void
}

// Elements that were already in the document when they mounted, i.e. hydrated from server HTML
const hydrated = new WeakSet<Element>()

const deferred = deferMount<Element, AppearState>((el, binding, vnode) => {
  if (!hydrated.delete(el)) return
  // Put the user's own style back first, or Anime.js would record the server one as the element's original
  if (el instanceof HTMLElement || el instanceof SVGElement) stripSSRProps(el, vnode.props)
  binding.value.start(el)
})

/**
 * Internal directive behind the `appear` of the transition components. Vue's `<Transition>` never runs its appear
 * hooks on a hydrated element, so a server-rendered element would neither animate in nor lose its server style.
 *
 * On the server, it renders `enter`'s starting values, like `v-animate`, so the element doesn't flash its final state
 * before hydration. On a hydrated element, it strips them and calls `start` once the hydration flush has finished.
 * On a client-only mount it does nothing: `<Transition>` runs its own appear hook there.
 */
export const vAppearState: ObjectDirective<Element, AppearState> = {
  getSSRProps(binding) {
    return toSSRProps({ style: getInitialStyle(binding.value.enter) })
  },
  // Must exist (and stay empty): its presence makes Vue skip the hydration mismatch check for the node (vuejs/core#11189)
  created() {},
  // During hydration the element is already in the document here; on a client mount, Vue inserts it afterwards
  beforeMount(el) {
    if (el.isConnected) hydrated.add(el)
  },
  mounted: deferred.mounted,
  updated(el, binding, vnode) {
    deferred.reschedule(el, binding, vnode)
  },
  unmounted(el) {
    deferred.cancel(el)
    hydrated.delete(el)
  },
}