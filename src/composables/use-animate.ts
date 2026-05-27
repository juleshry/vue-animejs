import { type DeepReadonly, type MaybeRef, type ShallowRef, shallowRef, unref, watch, readonly, isRef } from "vue"
import { type JSAnimation, animate, type TargetsParam, type AnimationParams } from "animejs"
import { tryOnUnmounted } from "@vueuse/core"
import { type AnimationTargets, resolveTarget } from "../utils/resolve-target.ts"

export interface UseAnimateReturn {
  /** The underlying Anime.js animation instance. `undefined` until the target is available. */
  animation: DeepReadonly<ShallowRef<JSAnimation | undefined>>
  /** Starts or resumes the animation. */
  play: () => JSAnimation | undefined
  /** Reverses playback direction. */
  reverse: () => JSAnimation | undefined
  /** Pauses the animation at the current position. */
  pause: () => JSAnimation | undefined
  /** Restarts the animation from the beginning. */
  restart: () => JSAnimation | undefined
  /** Toggles between forward and reverse direction. */
  alternate: () => JSAnimation | undefined
  /** Resumes from a paused state. */
  resume: () => JSAnimation | undefined
  /** Jumps immediately to the end of the animation. */
  complete: () => JSAnimation | undefined
  /** Stops the animation and removes it from the Anime.js engine. */
  cancel: () => JSAnimation | undefined
  /** Cancels the animation and restores all animated properties to their original values. */
  revert: () => JSAnimation | undefined
  /** Resets the animation to its initial state. Pass `true` for a soft reset that preserves the current cycle. */
  reset: (softReset?: boolean) => JSAnimation | undefined
  /** Seeks to a specific time (in ms). */
  seek: (time: number, muteCallbacks?: boolean | number, internalRender?: boolean | number) => JSAnimation | undefined
  /** Rescales the animation to a new total duration. */
  stretch: (newDuration: number) => JSAnimation | undefined
  /** Re-reads the current values of animated properties from the DOM. */
  refresh: () => JSAnimation | undefined
}

/**
 * Wraps Anime.js `animate()` into a Vue composable. Reactively re-creates the animation when the target or options change, and cancels it automatically on unmount.
 *
 * @param _target - The element(s) to animate. Accepts a template ref, a CSS selector, a DOM element, or a reactive ref to any of these.
 * @param _options - Anime.js animation parameters. Accepts a plain object or a reactive ref / computed. Defaults to `{}`.
 */
export function useAnimate(_target: AnimationTargets, _options: MaybeRef<AnimationParams> = {}): UseAnimateReturn {
  const animation = shallowRef<JSAnimation>()

  const { stop } = watch(
    [() => resolveTarget(_target), () => unref(_options)],
    ([el, opt]) => {
      createAnimation(el, opt)
    },
    { flush: "post", immediate: !isRef(_target) }
  )

  tryOnUnmounted(() => {
    stop()
    cancel()
  })

  function createAnimation(el: TargetsParam, opt: AnimationParams) {
    revert()

    if (!el) {
      console.warn("Target element is null or undefined")
      animation.value = undefined
      return
    }

    animation.value = animate(el, opt)
  }

  function play() {
    return animation.value?.play()
  }

  function reverse() {
    return animation.value?.reverse()
  }

  function pause() {
    return animation.value?.pause()
  }

  function restart() {
    return animation.value?.restart()
  }

  function alternate() {
    return animation.value?.alternate()
  }

  function resume() {
    return animation.value?.resume()
  }

  function complete() {
    return animation.value?.complete()
  }

  function cancel() {
    return animation.value?.cancel()
  }

  function revert() {
    return animation.value?.revert()
  }

  function reset(softReset?: boolean) {
    return animation.value?.reset(softReset)
  }

  function seek(time: number, muteCallbacks?: boolean | number, internalRender?: boolean | number) {
    return animation.value?.seek(time, muteCallbacks, internalRender)
  }

  function stretch(newDuration: number) {
    return animation.value?.stretch(newDuration)
  }

  function refresh() {
    return animation.value?.refresh()
  }

  return {
    animation: readonly(animation),
    play,
    reverse,
    pause,
    restart,
    alternate,
    resume,
    complete,
    cancel,
    revert,
    reset,
    seek,
    stretch,
    refresh,
  }
}