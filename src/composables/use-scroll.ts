import { computed, type ComputedRef, markRaw, type MaybeRef, unref } from "vue"
import { isClient, tryOnUnmounted } from "@vueuse/core"
import { onScroll, type ScrollObserver, type ScrollObserverParams, type Tickable, type WAAPIAnimation } from "animejs"
import { type AnimationTargets, resolveTarget } from "@src/utils/resolve-target.ts"

export interface UseScrollReturn {
  /** The underlying Anime.js ScrollObserver. `undefined` until both container and target are available. */
  observer: ComputedRef<ScrollObserver | undefined>
  /** The observer, or `false` while it doesn't exist yet — plug straight into an `autoplay` option. */
  autoplay: ComputedRef<ScrollObserver | false>
  /** `{ autoplay }`, ready to pass straight as-is into `useTimeline`/`useTimer`/`useAnimate`'s options argument. */
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
 * Wraps Anime.js `onScroll()` into a Vue composable. Reactively re-creates the ScrollObserver
 * when the container, target, or options change, and reverts it automatically on unmount.
 *
 * @param container - The scrollable container. Accepts a template ref, a CSS selector, a DOM element, or a reactive ref to any of these.
 * @param target - The element whose scroll position is observed within `container`. Same accepted shapes as `container`.
 * @param options - Anime.js `ScrollObserverParams`, minus `container`/`target`. Accepts a plain object or a reactive ref / computed. Defaults to `{}`.
 */
export function useScroll(
  container: AnimationTargets,
  target: AnimationTargets,
  options: MaybeRef<Omit<ScrollObserverParams, "container" | "target">> = {}
): UseScrollReturn {
  let current: ScrollObserver | undefined

  // Resolved inline in the computed (not via a `watch` writing to a separate ref) so every
  // reader — including a consumer composable's own mount-time watch and `tryOnMounted`, which
  // both read this in the same flush — observes the same memoized instance instead of a
  // transient `undefined` that flips to the real observer a tick later. That transient step
  // is what used to make `useTimeline`'s `autoplay` option change twice on mount, defeating its
  // same-reference dedup and building two timelines from one ScrollObserver (see the
  // "Scroll-driven timeline (regression)" demo in the playground).
  const observer = computed<ScrollObserver | undefined>(() => {
    current?.revert()
    current = undefined

    if (!isClient) return undefined

    const container_el = resolveTarget(container)
    const target_el = resolveTarget(target)

    if (!container_el || !target_el) return undefined

    current = markRaw(onScroll({ ...unref(options), container: container_el, target: target_el }))
    return current
  })

  const autoplay = computed<ScrollObserver | false>(() => observer.value ?? false)
  const autoplay_computed = computed(() => ({ autoplay: autoplay.value }))

  tryOnUnmounted(() => current?.revert())

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