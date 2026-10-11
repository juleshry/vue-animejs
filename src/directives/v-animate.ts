import { animate, type AnimationParams, type JSAnimation } from "animejs"
import type { Directive } from "vue"
import { getInitialStyle } from "@src/utils/initial-style.ts"
import { stripSSRProps, toSSRProps } from "@src/utils/ssr-props.ts"

const instances = new WeakMap<HTMLElement, JSAnimation>()

/**
 * Declarative animation directive. Applies an Anime.js animation to the element on mount,
 * re-creates it when the binding value changes, and reverts it on unmount.
 *
 * During SSR, renders the animation's "from" state as an inline style (see `getInitialStyle`) so the
 * element doesn't flash its final state before hydration.
 *
 * @example
 * <div v-animate="{ translateX: 250, duration: 800 }" />
 * <div v-animate="reactiveOptions" />
 */
export const vAnimate: Directive<HTMLElement, AnimationParams> = {
  getSSRProps(binding) {
    return toSSRProps({ style: getInitialStyle(binding.value) })
  },
  created(el, _, vnode) {
    // Also disables Vue's hydration style-mismatch check for this node (vuejs/core#11189)
    stripSSRProps(el, vnode.props)
  },
  mounted(el, binding) {
    if (binding.value) instances.set(el, animate(el, binding.value))
  },
  updated(el, binding) {
    if (binding.value === binding.oldValue) return
    const prev = instances.get(el)
    prev?.cancel()
    prev?.revert()

    if (binding.value) instances.set(el, animate(el, binding.value))
  },
  unmounted(el) {
    const animation = instances.get(el)
    animation?.cancel()
    animation?.revert()
    instances.delete(el)
  },
}