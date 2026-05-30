import { svg, type DrawableSVGGeometry, type DOMTargetSelector } from "animejs"
import { type MaybeComputedElementRef, tryOnUnmounted } from "@vueuse/core"
import { isRef, type MaybeRef, readonly, type DeepReadonly, type ShallowRef, shallowRef, unref, watch } from "vue"
import { type AnimationTargets, resolveTarget } from "@src/utils/resolve-target.ts"

export interface UseSvgDrawableReturn {
  /**
   * The Anime.js drawable Proxy for the target element. `undefined` until the element is available.
   * Pass this ref — not the original template ref — as the `useAnimate` target to animate the `draw` property.
   */
  drawable: DeepReadonly<ShallowRef<DrawableSVGGeometry | undefined>>
}

/**
 * Wraps an SVG geometry element in Anime.js's drawable Proxy. The proxy intercepts `setAttribute('draw', …)` calls and translates normalised `draw` values (`0`–`1`) into the correct `stroke-dasharray` / `stroke-dashoffset` updates. Pass the returned `drawable` ref as the target to `useAnimate`.
 *
 * @param target - The SVG element to make drawable. Accepts a template ref, a CSS selector, or a reactive ref to either.
 * @param start - Initial draw start position (`0`–`1`). Defaults to `0`.
 * @param end - Initial draw end position (`0`–`1`). Defaults to `0` (fully hidden).
 */
export function useSvgDrawable(
  target: MaybeRef<DOMTargetSelector> | MaybeComputedElementRef,
  start: MaybeRef<number> = 0,
  end: MaybeRef<number> = 0
): UseSvgDrawableReturn {
  const drawable = shallowRef<DrawableSVGGeometry | undefined>()

  const { stop } = watch(
    () => resolveTarget(target as AnimationTargets),
    el => {
      drawable.value = undefined
      if (!el) {
        console.warn("[useSvgDrawable] Target element is null or undefined")
        return
      }
      drawable.value = svg.createDrawable(el as DOMTargetSelector, unref(start), unref(end))[0]
    },
    { flush: "post", immediate: !isRef(target) }
  )

  tryOnUnmounted(() => {
    stop()
    drawable.value = undefined
  })

  return { drawable: readonly(drawable) }
}