import { waapi, type WAAPIAnimationParams, type WAAPIAnimation } from "animejs"
import type { Directive } from "vue"

interface Entry {
  animation: WAAPIAnimation
  originalStyle: string
}

const instances = new WeakMap<HTMLElement, Entry>()

/**
 * Declarative WAAPI animation directive. Applies an Anime.js WAAPI animation to the element on
 * mount, re-creates it when the binding value changes, and reverts it on unmount.
 *
 * @example
 * <div v-waapi="{ translateX: 250, duration: 800 }" />
 * <div v-waapi="reactiveOptions" />
 */
export const vWaapi: Directive<HTMLElement, WAAPIAnimationParams> = {
  mounted(el, binding) {
    if (binding.value) {
      instances.set(el, {
        animation: waapi.animate(el, binding.value),
        originalStyle: el.style.cssText,
      })
    }
  },
  updated(el, binding) {
    if (binding.value === binding.oldValue) return
    const entry = instances.get(el)
    if (entry) {
      entry.animation.cancel()
      el.style.cssText = entry.originalStyle
      instances.delete(el)
    }

    if (binding.value) {
      instances.set(el, {
        animation: waapi.animate(el, binding.value),
        originalStyle: el.style.cssText,
      })
    }
  },
  unmounted(el) {
    const entry = instances.get(el)
    if (entry) {
      entry.animation.cancel()
      el.style.cssText = entry.originalStyle
      instances.delete(el)
    }
  },
}