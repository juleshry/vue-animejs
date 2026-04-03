import { createTimer, type Timer, type TimerParams } from "animejs"
import { type MaybeRef, onUnmounted, ref, unref, watch } from "vue"

export function useTimer(options: MaybeRef<TimerParams> = {}) {
  const timer = ref<Timer>()

  const { stop } = watch(
    () => unref(options),
    options => {
      cancel()
      timer.value = createTimer(options)
    },
    { immediate: true, flush: "post" }
  )

  onUnmounted(() => {
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

  return { timer, play, reverse, pause, restart, alternate, resume, complete, reset, cancel, revert, seek, stretch }
}
