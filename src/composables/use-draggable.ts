import { type DeepReadonly, isRef, type MaybeRef, readonly, type ShallowRef, shallowRef, unref, watch } from "vue"
import { tryOnUnmounted } from "@vueuse/core"
import { type Draggable, type DraggableParams, createDraggable, type EasingParam } from "animejs"
import { type AnimationTargets, resolveTarget } from "../utils/resolve-target.ts"

export interface UseDraggableReturn {
  /** The underlying Anime.js draggable instance. `undefined` until the target is available. */
  draggable: DeepReadonly<ShallowRef<Draggable | undefined>>
  /** Disables drag interactions without destroying the instance. */
  disable: () => void
  /** Re-enables drag interactions after `disable()`. */
  enable: () => void
  /** Moves the draggable to the given x position. Pass `true` to suppress the update callback. */
  setX: (x: number, muteUpdateCallback?: boolean) => void
  /** Moves the draggable to the given y position. Pass `true` to suppress the update callback. */
  setY: (y: number, muteUpdateCallback?: boolean) => void
  /** Animates the draggable into the visible viewport. */
  animateInView: (duration?: number, gap?: number, ease?: EasingParam) => void
  /** Scrolls the draggable into the visible viewport. */
  scrollInView: (duration?: number, gap?: number, ease?: EasingParam) => void
  /** Stops any in-progress snap or momentum animation. */
  stop: () => void
  /** Resets the draggable position to its initial state. */
  reset: () => void
  /** Cancels the draggable and restores the element to its original state. */
  revert: () => void
  /** Re-reads the element's size and container bounds. */
  refresh: () => void
}

/**
 * Wraps Anime.js `createDraggable()` into a Vue composable. Reactively re-creates the draggable when the target or options change, and reverts it automatically on unmount.
 *
 * @param targets - The element(s) to make draggable. Accepts a template ref, a CSS selector, a DOM element, or a reactive ref to any of these.
 * @param options - Anime.js draggable parameters. Accepts a plain object or a reactive ref / computed. Defaults to `{}`.
 */
export function useDraggable(targets: AnimationTargets, options: MaybeRef<DraggableParams> = {}): UseDraggableReturn {
  const draggable = shallowRef<Draggable>()

  const { stop: stopWatch } = watch(
    [() => resolveTarget(targets), () => unref(options)],
    ([el, opt]) => {
      revert()

      if (!el) {
        console.warn("Targets element is null or undefined")
        draggable.value = undefined
        return
      }

      draggable.value = createDraggable(el, opt)
    },
    { flush: "post", immediate: !isRef(targets) }
  )

  tryOnUnmounted(() => {
    revert()
    stopWatch()
  })

  function disable() {
    return draggable.value?.disable()
  }

  function enable() {
    return draggable.value?.enable()
  }

  function setX(x: number, muteUpdateCallback?: boolean) {
    return draggable.value?.setX(x, muteUpdateCallback)
  }

  function setY(y: number, muteUpdateCallback?: boolean) {
    return draggable.value?.setY(y, muteUpdateCallback)
  }

  function animateInView(duration?: number, gap?: number, ease?: EasingParam) {
    return draggable.value?.animateInView(duration, gap, ease)
  }

  function scrollInView(duration?: number, gap?: number, ease?: EasingParam) {
    return draggable.value?.scrollInView(duration, gap, ease)
  }

  function stop() {
    return draggable.value?.stop()
  }

  function reset() {
    return draggable.value?.reset()
  }

  function revert() {
    return draggable.value?.revert()
  }

  function refresh() {
    return draggable.value?.refresh()
  }

  return {
    draggable: readonly(draggable),
    disable,
    enable,
    setX,
    setY,
    animateInView,
    scrollInView,
    stop,
    reset,
    revert,
    refresh,
  }
}