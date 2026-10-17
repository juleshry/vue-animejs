import { svg, type DrawableSVGGeometry, type DOMTargetSelector } from "animejs"
import { type MaybeComputedElementRef, tryOnUnmounted } from "@vueuse/core"
import { markRaw, type MaybeRef, shallowReadonly, type ShallowRef, shallowRef, unref } from "vue"
import { type AnimationTargets } from "@src/utils/resolve-target.ts"
import { watchTarget } from "@src/utils/watch-target.ts"

export interface UseSvgDrawableReturn {
  /**
   * The Anime.js drawable Proxy for the target element. `undefined` until the element is available.
   * Pass this ref — not the original template ref — as the `useAnimate` target to animate the `draw` property.
   */
  drawable: Readonly<ShallowRef<DrawableSVGGeometry | undefined>>
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

  // `start` / `end` only set the initial draw: changing them later doesn't rebuild the drawable
  const { stop } = watchTarget(target as AnimationTargets, undefined, el => {
    drawable.value = undefined
    if (!el) {
      console.warn("[useSvgDrawable] Target element is null or undefined")
      return
    }
    drawable.value = markRaw(svg.createDrawable(el as DOMTargetSelector, unref(start), unref(end))[0])
  })

  tryOnUnmounted(() => {
    stop()
    drawable.value = undefined
  })

  return { drawable: shallowReadonly(drawable) }
}