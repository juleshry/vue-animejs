import { createTimer, type Timer, type TimerParams } from "animejs"
import { type MaybeRef, onUnmounted, ref, unref, watch } from "vue"

export function useTimer(options: MaybeRef<TimerParams> = {}) {
  const timer = ref<Timer>()

  const { stop } = watch(
    () => unref(options),
    options => {
      timer.value = createTimer(options)
    },
    { immediate: true, flush: "post" }
  )

  onUnmounted(() => {
    stop()
    timer.value?.cancel()
  })

  return { timer }
}
