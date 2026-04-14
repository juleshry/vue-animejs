import { splitText, type TextSplitter, type TextSplitterParams } from "animejs"
import { type MaybeComputedElementRef, tryOnUnmounted, unrefElement } from "@vueuse/core"
import {
  computed,
  isRef,
  readonly,
  shallowRef,
  unref,
  watch,
  type ComputedRef,
  type DeepReadonly,
  type MaybeRef,
  type ShallowRef,
} from "vue"

export interface UseTextReturn {
  splitter: DeepReadonly<ShallowRef<TextSplitter | undefined>>
  lines: ComputedRef<HTMLElement[]>
  words: ComputedRef<HTMLElement[]>
  chars: ComputedRef<HTMLElement[]>
  revert: () => void
  refresh: () => void
}

export function useText(
  _target: MaybeRef<HTMLElement | NodeList | string | HTMLElement[]> | MaybeComputedElementRef,
  _params?: MaybeRef<TextSplitterParams>
): UseTextReturn {
  const splitter = shallowRef<TextSplitter | undefined>()

  const lines = computed<HTMLElement[]>(() => splitter.value?.lines ?? [])
  const words = computed<HTMLElement[]>(() => splitter.value?.words ?? [])
  const chars = computed<HTMLElement[]>(() => splitter.value?.chars ?? [])

  function resolveTarget() {
    return (
      unrefElement(_target as MaybeComputedElementRef) ??
      unref(_target as MaybeRef<HTMLElement | NodeList | string | HTMLElement[]>)
    )
  }

  const { stop } = watch(
    [resolveTarget, () => unref(_params)],
    ([el, params]) => {
      revert()
      splitter.value = undefined

      if (!el) return

      splitter.value = splitText(el as HTMLElement | NodeList | string | HTMLElement[], params)
    },
    { flush: "post", immediate: !isRef(_target) }
  )

  tryOnUnmounted(() => {
    stop()
    splitter.value = undefined
    revert()
  })

  function revert() {
    splitter.value?.revert()
  }

  function refresh() {
    splitter.value?.refresh()
  }

  return {
    splitter: readonly(splitter),
    lines,
    words,
    chars,
    revert,
    refresh,
  }
}
