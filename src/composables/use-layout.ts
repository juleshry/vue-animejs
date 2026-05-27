import { type MaybeComputedElementRef, tryOnUnmounted } from "@vueuse/core"
import { type AnimationTargets, resolveTarget } from "@src/utils/resolve-target.ts"
import {
  type AutoLayout,
  type AutoLayoutParams,
  createLayout,
  type DOMTargetSelector,
  type LayoutAnimationParams,
  type Timeline,
} from "animejs"
import { type DeepReadonly, isRef, type MaybeRef, readonly, type ShallowRef, shallowRef, unref, watch } from "vue"

export interface UseLayoutReturn {
  /** The underlying Anime.js `AutoLayout` instance. `undefined` until the root element is available. */
  layout: DeepReadonly<ShallowRef<AutoLayout | undefined>>
  /** Snapshots the current positions of all tracked children so the next layout change can be animated. */
  record: () => void
  /** Animates all children from their recorded positions to their new positions. */
  animate: (params?: LayoutAnimationParams) => Timeline | undefined
  /** Records, applies the callback (which triggers a layout change), then animates the transition. */
  update: (callback: (layout: AutoLayout) => void, params?: LayoutAnimationParams) => void
  /** Cancels the layout watcher and restores all elements to their original state. */
  revert: () => void
}

/**
 * Wraps Anime.js `createLayout()` into a Vue composable. Reactively re-creates the layout observer when the root element or params change, and reverts it automatically on unmount.
 *
 * @param root - The container element whose children will be tracked. Accepts a template ref, a CSS selector, or a reactive ref to either.
 * @param params - Anime.js auto-layout parameters. Accepts a plain object or a reactive ref / computed.
 */
export function useLayout(
  root: MaybeRef<DOMTargetSelector> | MaybeComputedElementRef,
  params: MaybeRef<AutoLayoutParams>
): UseLayoutReturn {
  const layout = shallowRef<AutoLayout | undefined>()

  const { stop } = watch(
    [() => resolveTarget(root as AnimationTargets), () => unref(params)],
    ([el, opt]) => {
      revert()

      if (!el) {
        console.warn("Target element is null or undefined")
        layout.value = undefined
        return
      }

      layout.value = createLayout(el as DOMTargetSelector, opt)
    },
    { flush: "post", immediate: !isRef(root) }
  )

  tryOnUnmounted(() => {
    revert()
    stop()
  })

  function record() {
    return layout.value?.record()
  }

  function animate(params?: LayoutAnimationParams) {
    return layout.value?.animate(params)
  }

  function update(callback: (layout: AutoLayout) => void, params?: LayoutAnimationParams) {
    return layout.value?.update(callback, params)
  }

  function revert() {
    return layout.value?.revert()
  }

  return { layout: readonly(layout), record, animate, update, revert }
}