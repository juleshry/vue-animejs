import { tryOnUnmounted } from "@vueuse/core"
import { type AnimationTargets } from "../utils/resolve-target.ts"
import { watchTarget } from "../utils/watch-target.ts"
import {
  type WAAPIAnimationParams,
  type DOMTargetsParam,
  waapi,
  type WAAPIAnimation,
  type EasingFunction,
} from "animejs"
import { markRaw, type MaybeRef, type MaybeRefOrGetter, shallowReadonly, ShallowRef, shallowRef, unref } from "vue"
import { type MaybeRefOptions } from "../utils/resolve-options.ts"

export interface UseWaapiReturn {
  /** The underlying Anime.js WAAPI animation instance. `undefined` until the target is available. */
  animation: Readonly<ShallowRef<WAAPIAnimation | undefined>>
  /** Resumes from a paused state. */
  resume: () => WAAPIAnimation | undefined
  /** Pauses the animation at the current position. */
  pause: () => WAAPIAnimation | undefined
  /** Toggles between forward and reverse direction. */
  alternate: () => WAAPIAnimation | undefined
  /** Starts or resumes the animation. */
  play: () => WAAPIAnimation | undefined
  /** Reverses playback direction. */
  reverse: () => WAAPIAnimation | undefined
  /** Seeks to a specific time (in ms). Accepts a reactive ref for the time value. */
  seek: (time: MaybeRef<number>, muteCallbacks?: MaybeRef<boolean>) => WAAPIAnimation | undefined
  /** Restarts the animation from the beginning. */
  restart: () => WAAPIAnimation | undefined
  /** Commits the current animated styles to the element's inline style, then cancels the animation. */
  commitStyles: () => WAAPIAnimation | undefined
  /** Jumps immediately to the end of the animation. */
  complete: () => WAAPIAnimation | undefined
  /** Stops the animation and removes it from the WAAPI engine. */
  cancel: () => WAAPIAnimation | undefined
  /** Cancels the animation and restores all animated properties to their original values. */
  revert: () => WAAPIAnimation | undefined
  /** Converts an Anime.js easing function to a CSS `cubic-bezier()` string usable by WAAPI. */
  convertEase: (fn: MaybeRef<EasingFunction>, samples?: MaybeRef<number>) => string
}

/**
 * Wraps Anime.js `waapi.animate()` into a Vue composable. Reactively re-creates the WAAPI animation when the target or options change, and stops it automatically on unmount.
 *
 * @param targets - The DOM element(s) to animate via WAAPI. Accepts a template ref, a CSS selector, a DOM element, a reactive ref to any of these, or an array of them.
 * @param options - Anime.js WAAPI animation parameters. Accepts a plain object, a ref / computed / getter, and refs as direct properties. Defaults to `{}`.
 */
export function useWaapi(
  targets: AnimationTargets,
  options: MaybeRefOrGetter<MaybeRefOptions<WAAPIAnimationParams>> = {}
): UseWaapiReturn {
  const animation = shallowRef<WAAPIAnimation | undefined>()

  const { stop } = watchTarget(targets, options, (el, opt) => {
    revert()

    if (!el) {
      console.warn("Target element is null or undefined")
      animation.value = undefined
      return
    }

    animation.value = markRaw(waapi.animate(el as DOMTargetsParam, opt))
  })

  tryOnUnmounted(() => {
    stop()
    cancel()
  })

  function resume() {
    return animation.value?.resume()
  }

  function pause() {
    return animation.value?.pause()
  }

  function alternate() {
    return animation.value?.alternate()
  }

  function play() {
    return animation.value?.play()
  }

  function reverse() {
    return animation.value?.reverse()
  }

  function seek(time: MaybeRef<number>, muteCallbacks?: MaybeRef<boolean>) {
    return animation.value?.seek(unref(time), unref(muteCallbacks))
  }

  function restart() {
    return animation.value?.restart()
  }

  function commitStyles() {
    return animation.value?.commitStyles()
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

  return {
    animation: shallowReadonly(animation),
    resume,
    pause,
    alternate,
    play,
    reverse,
    seek,
    restart,
    commitStyles,
    complete,
    cancel,
    revert,

    convertEase,
  }
}

function convertEase(fn: MaybeRef<EasingFunction>, samples: MaybeRef<number> = 100) {
  return waapi.convertEase(unref(fn), unref(samples))
}