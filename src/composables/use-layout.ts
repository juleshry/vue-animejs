import { type MaybeComputedElementRef, tryOnUnmounted, unrefElement } from "@vueuse/core"
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
  layout: DeepReadonly<ShallowRef<AutoLayout | undefined>>
  record: () => void
  animate: (params?: LayoutAnimationParams) => Timeline | undefined
  update: (callback: (layout: AutoLayout) => void, params?: LayoutAnimationParams) => void
  revert: () => void
}

export function useLayout(
  root: MaybeRef<DOMTargetSelector> | MaybeComputedElementRef,
  params: MaybeRef<AutoLayoutParams>
): UseLayoutReturn {
  const layout = shallowRef<AutoLayout | undefined>()

  const { stop } = watch(
    [
      () => unrefElement(root as MaybeComputedElementRef) ?? unref(root as MaybeRef<DOMTargetSelector>),
      () => unref(params),
    ],
    ([el, opt]) => {
      revert()

      if (!el) {
        console.warn("Target element is null or undefined")
        layout.value = undefined
        return
      }

      layout.value = createLayout(el, opt)
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
