import { waapi, type WAAPIAnimationParams, type WAAPIAnimation } from "animejs"
import type { Directive } from "vue"
import { getInitialStyle } from "@src/utils/initial-style.ts"
import { stripSSRProps, toSSRProps } from "@src/utils/ssr-props.ts"

interface Entry {
  animation: WAAPIAnimation
  originalStyle: string
}

const instances = new WeakMap<HTMLElement, Entry>()

function create(el: HTMLElement, params: WAAPIAnimationParams): Entry {
  // Read before `waapi.animate()`, which writes its own inline styles (e.g. `transform: translateX(var(--translateX))`)
  const original_style = el.style.cssText
  return { animation: waapi.animate(el, params), originalStyle: original_style }
}

/**
 * Declarative WAAPI animation directive. Applies an Anime.js WAAPI animation to the element on
 * mount, re-creates it when the binding value changes, and reverts it on unmount.
 *
 * During SSR, renders the animation's "from" state as an inline style (see `getInitialStyle`) so the
 * element doesn't flash its final state before hydration.
 *
 * @example
 * <div v-waapi="{ translateX: 250, duration: 800 }" />
 * <div v-waapi="reactiveOptions" />
 */
export const vWaapi: Directive<HTMLElement, WAAPIAnimationParams> = {
  getSSRProps(binding) {
    return toSSRProps({ style: getInitialStyle(binding.value) })
  },
  created(el, _, vnode) {
    // Also disables Vue's hydration style-mismatch check for this node (vuejs/core#11189)
    stripSSRProps(el, vnode.props)
  },
  mounted(el, binding) {
    if (binding.value) instances.set(el, create(el, binding.value))
  },
  updated(el, binding) {
    if (binding.value === binding.oldValue) return
    const entry = instances.get(el)
    if (entry) {
      entry.animation.cancel()
      el.style.cssText = entry.originalStyle
      instances.delete(el)
    }

    if (binding.value) instances.set(el, create(el, binding.value))
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