import { createTimer, type Timer, type TimerParams } from "animejs"
import { markRaw, type MaybeRef, shallowReadonly, type ShallowRef, shallowRef, unref, watch } from "vue"
import { isClient, tryOnMounted, tryOnUnmounted } from "@vueuse/core"

export interface UseTimerReturn {
  /** The underlying Anime.js timer instance. `undefined` until mounted. */
  timer: Readonly<ShallowRef<Timer | undefined>>
  /** Starts or resumes the timer. */
  play: () => Timer | undefined
  /** Reverses the timer's playback direction. */
  reverse: () => Timer | undefined
  /** Pauses the timer at the current position. */
  pause: () => Timer | undefined
  /** Restarts the timer from the beginning. */
  restart: () => Timer | undefined
  /** Toggles between forward and reverse direction. */
  alternate: () => Timer | undefined
  /** Resumes from a paused state. */
  resume: () => Timer | undefined
  /** Jumps immediately to the end of the timer duration. */
  complete: () => Timer | undefined
  /** Resets the timer to its initial state. Pass `true` for a soft reset that preserves the current cycle. */
  reset: (softReset?: boolean) => Timer | undefined
  /** Stops the timer and removes it from the Anime.js engine. */
  cancel: () => Timer | undefined
  /** Cancels the timer and restores any associated state to its original values. */
  revert: () => Timer | undefined
  /** Seeks to a specific time (in ms). */
  seek: (time: number, muteCallbacks?: boolean | number, internalRender?: boolean | number) => Timer | undefined
  /** Rescales the timer to a new total duration. */
  stretch: (newDuration: number) => Timer | undefined
}

/**
 * Wraps Anime.js `createTimer()` into a Vue composable. Reactively re-creates the timer when options change, and cancels it automatically on unmount.
 *
 * @param options - Anime.js timer parameters. Accepts a plain object or a reactive ref / computed. Defaults to `{}`.
 */
export function useTimer(options: MaybeRef<TimerParams> = {}): UseTimerReturn {
  const timer = shallowRef<Timer>()

  tryOnMounted(() => {
    timer.value = markRaw(createTimer(unref(options)))
  })

  const { stop } = watch(
    () => unref(options),
    options => {
      if (!isClient) return
      cancel()
      timer.value = markRaw(createTimer(options))
    },
    { deep: 1 }
  )

  tryOnUnmounted(() => {
    stop()
    cancel()
  })

  function play() {
    return timer.value?.play()
  }

  function reverse() {
    return timer.value?.reverse()
  }

  function pause() {
    return timer.value?.pause()
  }

  function restart() {
    return timer.value?.restart()
  }

  function alternate() {
    return timer.value?.alternate()
  }

  function resume() {
    return timer.value?.resume()
  }

  function complete() {
    return timer.value?.complete()
  }

  function reset(softReset?: boolean) {
    return timer.value?.reset(softReset)
  }

  function cancel() {
    return timer.value?.cancel()
  }

  function revert() {
    return timer.value?.revert()
  }

  function seek(time: number, muteCallbacks?: boolean | number, internalRender?: boolean | number) {
    return timer.value?.seek(time, muteCallbacks, internalRender)
  }

  function stretch(newDuration: number) {
    return timer.value?.stretch(newDuration)
  }

  return {
    timer: shallowReadonly(timer),
    play,
    reverse,
    pause,
    restart,
    alternate,
    resume,
    complete,
    reset,
    cancel,
    revert,
    seek,
    stretch,
  }
}