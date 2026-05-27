import { splitText, type TextSplitter, type TextSplitterParams } from "animejs"
import { type MaybeComputedElementRef, tryOnUnmounted } from "@vueuse/core"
import { type AnimationTargets, resolveTarget } from "../utils/resolve-target.ts"
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
  /** The underlying Anime.js `TextSplitter` instance. `undefined` until the target is available. */
  splitter: DeepReadonly<ShallowRef<TextSplitter | undefined>>
  /** Reactive array of `<span>` elements representing each line after splitting. */
  lines: ComputedRef<HTMLElement[]>
  /** Reactive array of `<span>` elements representing each word after splitting. */
  words: ComputedRef<HTMLElement[]>
  /** Reactive array of `<span>` elements representing each character after splitting. */
  chars: ComputedRef<HTMLElement[]>
  /** Removes all split `<span>` wrappers and restores the original text content. */
  revert: () => void
  /** Re-splits the text, updating `lines`, `words`, and `chars` to reflect any DOM or size changes. */
  refresh: () => void
}

/**
 * Wraps Anime.js `splitText()` into a Vue composable. Reactively re-splits the text when the target or params change, and reverts the DOM automatically on unmount.
 *
 * @param _target - The element(s) whose text content should be split. Accepts a template ref, a CSS selector, a DOM element, or a reactive ref to any of these.
 * @param _params - Anime.js text-splitter parameters. Accepts a plain object or a reactive ref / computed.
 */
export function useText(
  _target: MaybeRef<HTMLElement | NodeList | string | HTMLElement[]> | MaybeComputedElementRef,
  _params?: MaybeRef<TextSplitterParams>
): UseTextReturn {
  const splitter = shallowRef<TextSplitter | undefined>()

  const lines = computed<HTMLElement[]>(() => splitter.value?.lines ?? [])
  const words = computed<HTMLElement[]>(() => splitter.value?.words ?? [])
  const chars = computed<HTMLElement[]>(() => splitter.value?.chars ?? [])

  const { stop } = watch(
    [() => resolveTarget(_target as AnimationTargets), () => unref(_params)],
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