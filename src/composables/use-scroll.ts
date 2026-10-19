import { computed, type ComputedRef, markRaw, type MaybeRefOrGetter, shallowRef } from "vue"
import { tryOnUnmounted } from "@vueuse/core"
import {
  onScroll,
  type ScrollObserver,
  type ScrollObserverParams,
  type TargetsParam,
  type Tickable,
  type WAAPIAnimation,
} from "animejs"
import { type AnimationTargets, resolveTarget } from "../utils/resolve-target.ts"
import { watchTarget } from "../utils/watch-target.ts"
import { type MaybeRefOptions } from "../utils/resolve-options.ts"

export interface UseScrollReturn {
  /** The underlying Anime.js ScrollObserver. `undefined` until mounted with both container and target available. */
  observer: ComputedRef<ScrollObserver | undefined>
  /** The observer, or `false` while it doesn't exist yet — plug straight into an `autoplay` option: `useTimeline({ autoplay })`. */
  autoplay: ComputedRef<ScrollObserver | false>
  /**
   * `{ autoplay }`, ready to pass straight as-is into `useTimeline`/`useTimer`/`useAnimate`'s options argument.
   *
   * @deprecated Options accept refs as direct properties: pass `{ autoplay }` instead. Will be removed in the next major.
   */
  autoplayComputed: ComputedRef<{ autoplay: ScrollObserver | false }>
  /** Re-reads the container and target bounds. */
  refresh: () => ScrollObserver | undefined
  /** Cancels the observer and detaches its scroll listeners. */
  revert: () => ScrollObserver | undefined
  /** Renders the on-screen debug markers for the observer's thresholds. */
  debug: () => void
  /** Removes the on-screen debug markers. */
  removeDebug: () => ScrollObserver | undefined
  /** Links a tickable (animation, timer, timeline) or WAAPI animation to be driven by this observer. */
  link: (linked: Tickable | WAAPIAnimation) => ScrollObserver | undefined
}

/**
 * Wraps Anime.js `onScroll()` into a Vue composable. Creates the ScrollObserver on mount, reactively re-creates it
 * when the container, target, or options change, and reverts it automatically on unmount.
 *
 * Call it before the composable that consumes `autoplay` (e.g. `useTimeline`): its mount hook
 * then runs first, so the consumer is built once, with the observer already in place.
 *
 * @param container - The scrollable container. Accepts a template ref, a CSS selector, a DOM element, or a reactive ref to any of these.
 * @param target - The element whose scroll position is observed within `container`. Same accepted shapes as `container`.
 * @param options - Anime.js `ScrollObserverParams`, minus `container`/`target`. Accepts a plain object, a ref / computed / getter, and refs as direct properties. Defaults to `{}`.
 */
export function useScroll(
  container: AnimationTargets,
  target: AnimationTargets,
  options: MaybeRefOrGetter<MaybeRefOptions<Omit<ScrollObserverParams, "container" | "target">>> = {}
): UseScrollReturn {
  const instance = shallowRef<ScrollObserver>()

  // Both elements in one target, so watchTarget builds once they have both resolved, and rebuilds when either changes
  const both = () => {
    const container_el = resolveTarget(container)
    const target_el = resolveTarget(target)
    return container_el && target_el ? [container_el, target_el] : undefined
  }

  const { stop } = watchTarget(both as AnimationTargets, options, (els, opt) => {
    instance.value?.revert()
    instance.value = undefined
    if (!els) return

    const [container_el, target_el] = els as [TargetsParam, TargetsParam]
    instance.value = markRaw(onScroll({ ...opt, container: container_el, target: target_el }))
  })

  tryOnUnmounted(() => {
    stop()
    instance.value?.revert()
  })

  const observer = computed(() => instance.value)
  const autoplay = computed<ScrollObserver | false>(() => instance.value ?? false)
  const autoplay_computed = computed(() => ({ autoplay: autoplay.value }))

  function refresh() {
    return observer.value?.refresh()
  }

  function revert() {
    return observer.value?.revert()
  }

  function debug() {
    observer.value?.debug()
  }

  function removeDebug() {
    return observer.value?.removeDebug()
  }

  function link(linked: Tickable | WAAPIAnimation) {
    return observer.value?.link(linked)
  }

  return {
    observer,
    autoplay,
    autoplayComputed: autoplay_computed,
    refresh,
    revert,
    debug,
    removeDebug,
    link,
  }
}