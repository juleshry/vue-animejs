import { type MaybeRef, onUnmounted, ref, unref, watch } from "vue"
import { createTimeline, type Timeline, type TimelineParams } from "animejs"

export function useTimeline(options: MaybeRef<TimelineParams> = {}) {
  const timeline = ref<Timeline>(createTimeline(unref(options)))
  const { stop } = watch(
    () => unref(options),
    _options => {
      timeline.value.cancel()
      timeline.value = createTimeline(_options)
    },
    { flush: "post" }
  )

  onUnmounted(() => {
    stop()
    timeline.value.cancel()
  })

  return { timeline }
}
