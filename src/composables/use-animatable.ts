import { type AnimatableObject, type AnimatableParams, createAnimatable, type TargetsParam } from "animejs"
import {
  computed,
  type DeepReadonly,
  isRef,
  type MaybeRef,
  readonly,
  type ShallowRef,
  shallowRef,
  unref,
  watch,
} from "vue"
import { tryOnUnmounted } from "@vueuse/core"

export interface UseAnimatableReturn {
  animatable: DeepReadonly<ShallowRef<AnimatableObject | undefined>>
  revert: () => AnimatableObject | undefined
}

export function useAnimatable(
  targets: MaybeRef<TargetsParam>,
  options: MaybeRef<AnimatableParams> = {}
): UseAnimatableReturn {
  const animatable = shallowRef<AnimatableObject>()

  const watch_target = computed<{ el: TargetsParam; opt: AnimatableParams }>(() => ({
    el: unref(targets),
    opt: unref(options),
  }))

  const { stop } = watch(
    watch_target,
    ({ el, opt }) => {
      revert()

      if (!el) {
        console.warn("Targets element is null or undefined")
        animatable.value = undefined
        return
      }

      animatable.value = createAnimatable(el, opt)
    },
    { flush: "post", immediate: !isRef(targets) }
  )

  tryOnUnmounted(() => {
    stop()
    revert()
  })

  function revert() {
    return animatable.value?.revert()
  }

  return { animatable: readonly(animatable), revert }
}
function revert() {
  throw new Error("Function not implemented.")
}
