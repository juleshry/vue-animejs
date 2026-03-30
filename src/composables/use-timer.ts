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
    timer.value?.play()
  }

  function reverse() {
    timer.value?.reverse()
  }

  function pause() {
    timer.value?.pause()
  }

  function restart() {
    timer.value?.restart()
  }

  function alternate() {
    timer.value?.alternate()
  }

  function resume() {
    timer.value?.resume()
  }

  function complete() {
    timer.value?.complete()
  }

  function reset() {
    timer.value?.reset()
  }

  function cancel() {
    timer.value?.cancel()
  }

  function revert() {
    timer.value?.revert()
  }

  function seek(time: number, muteCallbacks?: boolean | number, internalRender?: boolean | number) {
    timer.value?.seek(time, muteCallbacks, internalRender)
  }

  function stretch(newDuration: number) {
    timer.value?.stretch(newDuration)
  }

  return { timer, play, reverse, pause, restart, alternate, resume, complete, reset, cancel, revert, seek, stretch }
}
