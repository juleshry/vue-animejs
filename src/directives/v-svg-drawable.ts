import { animate, svg, type AnimationParams, type DrawableSVGGeometry, type JSAnimation } from "animejs"
import type { Directive } from "vue"
import { getInitialDraw } from "@src/utils/initial-draw.ts"
import { stripSSRProps, toSSRProps } from "@src/utils/ssr-props.ts"

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

/**
 * Declarative SVG drawable directive. Wraps the SVG geometry element in an Anime.js drawable
 * Proxy and animates the `draw` property on mount. Re-creates it when the binding value changes
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
  created(el, _, vnode) {
    // Before createDrawable(), which skips its first paint if `pathLength` is already set. Also
    // disables Vue's hydration attribute-mismatch check for this node (vuejs/core#11189)
    stripSSRProps(el, vnode.props)
  },
  mounted(el, binding) {
    instances.set(el, create(el, binding.value))
  },
  updated(el, binding) {
    if (binding.value === binding.oldValue) return
    const entry = instances.get(el)
    entry?.animation?.cancel()
    entry?.animation?.revert()
    instances.set(el, create(el, binding.value))
  },
  unmounted(el) {
    const entry = instances.get(el)
    entry?.animation?.cancel()
    entry?.animation?.revert()
    instances.delete(el)
  },
}