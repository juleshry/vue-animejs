import { animate, svg, type AnimationParams, type DrawableSVGGeometry, type JSAnimation } from "animejs"
import type { Directive } from "vue"
import { deferMount } from "@src/utils/deferred-mount.ts"
import { isSameBinding } from "@src/utils/same-binding.ts"
import { getInitialDraw } from "@src/utils/initial-draw.ts"
import { restoreUserProps, stripSSRProps, toSSRProps } from "@src/utils/ssr-props.ts"

interface Entry {
  drawable: DrawableSVGGeometry
  animation: JSAnimation | undefined
}

const instances = new WeakMap<SVGGeometryElement, Entry>()

function create(el: SVGGeometryElement, params: AnimationParams | undefined): Entry {
  const drawable = svg.createDrawable(el)[0]
  const animation = params ? animate(drawable, params) : undefined
  return { drawable, animation }
}

const deferred = deferMount<SVGGeometryElement, AnimationParams | undefined>((el, binding, vnode) => {
  // Before createDrawable(), which skips its first paint if `pathLength` is already set
  stripSSRProps(el, vnode.props)
  instances.set(el, create(el, binding.value))
})

/**
 * Declarative SVG drawable directive. Wraps the SVG geometry element in an Anime.js drawable
 * Proxy and animates the `draw` property on mount (once the mount flush has finished, so components'
 * own `onMounted` hooks still see the rendered DOM). Re-creates it when the binding value changes
 * and reverts on unmount.
 *
 * During SSR, renders the path's starting draw state (see `getInitialDraw`) so it doesn't show fully
 * drawn before hydration.
 *
 * @example
 * <path v-svg-drawable="{ draw: '0 1', duration: 1200 }" />
 * <path v-svg-drawable="{ draw: ['0 0', '0.5 1', '0 1'], ease: 'inOutQuad', loop: true }" />
 */
export const vSvgDrawable: Directive<SVGGeometryElement, AnimationParams | undefined> = {
  getSSRProps(binding) {
    return toSSRProps(getInitialDraw(binding.value))
  },
  created() {
    // Intentionally empty: having a `created` hook makes Vue skip its hydration attribute-mismatch
    // check for this node (vuejs/core#11189). The server attributes are stripped on mount, right
    // before createDrawable() reads the element.
  },
  mounted: deferred.mounted,
  updated(el, binding, vnode) {
    if (isSameBinding(binding.value, binding.oldValue)) return
    if (deferred.reschedule(el, binding, vnode)) return
    const entry = instances.get(el)
    entry?.animation?.cancel()
    entry?.animation?.revert()
    // What createDrawable() wrote: with `pathLength` left set, the new drawable would skip its first
    // paint and start from wherever the previous animation stopped, not from a fresh mount's state
    restoreUserProps(el, vnode.props, ["stroke-linecap"], ["pathLength", "stroke-dasharray", "stroke-dashoffset"])
    instances.set(el, create(el, binding.value))
  },
  unmounted(el) {
    deferred.cancel(el)
    const entry = instances.get(el)
    entry?.animation?.cancel()
    entry?.animation?.revert()
    instances.delete(el)
  },
}