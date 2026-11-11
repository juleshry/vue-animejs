import { splitText, type TextSplitter, type TextSplitterParams } from "animejs"
import { type MaybeComputedElementRef, tryOnUnmounted } from "@vueuse/core"
import { type AnimationTargets } from "../utils/resolve-target.ts"
import { watchTarget } from "../utils/watch-target.ts"
import {
  computed,
  markRaw,
  shallowReadonly,
  shallowRef,
  type ComputedRef,
  type MaybeRefOrGetter,
  type ShallowRef,
} from "vue"
import { type MaybeRefOptions } from "../utils/resolve-options.ts"

export interface UseTextReturn {
  /** The underlying Anime.js `TextSplitter` instance. `undefined` until the target is available. */
  splitter: Readonly<ShallowRef<TextSplitter | undefined>>
  /** Reactive array of `<span>` elements representing each line after splitting. Empty until web fonts have loaded: Anime.js waits for them to split lines. */
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
 * @param _target - The element(s) whose text content should be split. Accepts a template ref, a CSS selector, a DOM element, or a ref or getter returning any of these.
 * @param _params - Anime.js text-splitter parameters. Accepts a plain object, a ref / computed / getter, and refs as direct properties.
 */
export function useText(
  _target:
    | MaybeRefOrGetter<HTMLElement | NodeList | string | HTMLElement[] | null | undefined>
    | MaybeComputedElementRef,
  _params?: MaybeRefOrGetter<MaybeRefOptions<TextSplitterParams>>
): UseTextReturn {
  const splitter = shallowRef<TextSplitter | undefined>()
  // Bumped after every split: splitText fills its arrays itself, later when lines wait for fonts, and Vue can't see it
  const split_count = shallowRef(0)

  // New arrays on every split, so the dependents are notified even when Anime.js refilled the same array in place
  const lines = computed<HTMLElement[]>(() => (split_count.value, [...(splitter.value?.lines ?? [])]))
  const words = computed<HTMLElement[]>(() => (split_count.value, [...(splitter.value?.words ?? [])]))
  const chars = computed<HTMLElement[]>(() => (split_count.value, [...(splitter.value?.chars ?? [])]))

  const { stop } = watchTarget<TextSplitterParams | undefined>(_target as AnimationTargets, _params, (el, params) => {
    revert()
    splitter.value = undefined

    if (!el) return

    const instance = markRaw(splitText(el as HTMLElement | NodeList | string | HTMLElement[], params))
    // Runs now if the text is already split, and again after each split Anime.js does later (fonts ready, resize)
    instance.addEffect(() => {
      split_count.value++
      return () => {}
    })
    splitter.value = instance
  })

  tryOnUnmounted(() => {
    stop()
    revert()
    splitter.value = undefined
  })

  function revert() {
    splitter.value?.revert()
  }

  function refresh() {
    splitter.value?.refresh()
  }

  return {
    splitter: shallowReadonly(splitter),
    lines,
    words,
    chars,
    revert,
    refresh,
  }
}