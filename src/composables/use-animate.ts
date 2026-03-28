import { computed, type MaybeRef, onUnmounted, ref, unref, watch } from "vue"
import { type JSAnimation, animate, type TargetSelector, type AnimationParams } from "animejs"

export function useAnimate(_target: MaybeRef<TargetSelector>, _options: MaybeRef<AnimationParams> = {}) {
  let animation = ref<JSAnimation>()

  const watch_target = computed<{ el: TargetSelector; opt: AnimationParams }>(() => ({
    el: unref(_target),
    opt: unref(_options),
  }))
  const { stop } = watch(
    watch_target,
    ({ el, opt }) => {
      animation.value?.cancel()

      if (!el) {
        console.warn("Target element is null or undefined")
        return
      }

      animation.value = animate(el, opt)
    },
    { immediate: true, flush: "post" }
  )

  onUnmounted(() => {
    stop()
    animation.value?.cancel()
  })

  function play() {
    animation.value?.play()
  }

  function restart() {
    animation.value?.restart()
  }

  return { animation, play, restart }
}
