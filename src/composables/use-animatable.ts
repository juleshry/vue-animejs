import { Animatable, type AnimatableParams, createAnimatable, type TargetsParam } from "animejs"
import { computed, type MaybeRef, onUnmounted, ref, unref, watch } from "vue"

export function useAnimatable(_targets: MaybeRef<TargetsParam>, _options: MaybeRef<AnimatableParams> = {}) {
  const animatable = ref<Animatable>()

  const watch_target = computed<{ el: TargetsParam; opt: AnimatableParams }>(() => ({
    el: unref(_targets),
    opt: unref(_options),
  }))
  const { stop } = watch(
    watch_target,
    ({ el, opt }) => {
      if (!el) {
        console.warn("Targets element is null or undefined")
        return
      }

      animatable.value = createAnimatable(el, opt)
    },
    { immediate: true, flush: "post" }
  )

  onUnmounted(() => {
    stop()
  })

  function revert() {
    return animatable.value?.revert()
  }

  return { animatable, revert }
}
