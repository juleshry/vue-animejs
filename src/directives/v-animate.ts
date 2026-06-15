import { animate, type AnimationParams, type JSAnimation } from "animejs"
import type { Directive } from "vue"

const instances = new WeakMap<HTMLElement, JSAnimation>()

/**
 * Declarative animation directive. Applies an Anime.js animation to the element on mount,
 * re-creates it when the binding value changes, and reverts it on unmount.
 *
 * @example
 * <div v-animate="{ translateX: 250, duration: 800 }" />
 * <div v-animate="reactiveOptions" />
 */
export const vAnimate: Directive<HTMLElement, AnimationParams> = {
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