import { animate, type AnimationParams, type JSAnimation } from "animejs"
import type { Directive } from "vue"
import { deferMount } from "@src/utils/deferred-mount.ts"
import { getInitialStyle } from "@src/utils/initial-style.ts"
import { stripSSRProps, toSSRProps } from "@src/utils/ssr-props.ts"

const instances = new WeakMap<HTMLElement, JSAnimation>()

const deferred = deferMount<HTMLElement, AnimationParams>((el, binding, vnode) => {
  stripSSRProps(el, vnode.props)
  if (binding.value) instances.set(el, animate(el, binding.value))
})

/**
 * Declarative animation directive. Applies an Anime.js animation to the element on mount (once the
 * mount flush has finished, so components' own `onMounted` hooks still see the rendered DOM),
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
  created() {
    // Intentionally empty: having a `created` hook makes Vue skip its hydration style-mismatch check
    // for this node (vuejs/core#11189). The server style is stripped on mount, right before Anime.js
    // reads the element.
  },
  mounted: deferred.mounted,
  updated(el, binding, vnode) {
    if (binding.value === binding.oldValue) return
    if (deferred.reschedule(el, binding, vnode)) return
    const prev = instances.get(el)
    prev?.cancel()
    prev?.revert()

    if (binding.value) instances.set(el, animate(el, binding.value))
  },
  unmounted(el) {
    deferred.cancel(el)
    const animation = instances.get(el)
    animation?.cancel()
    animation?.revert()
    instances.delete(el)
  },
}