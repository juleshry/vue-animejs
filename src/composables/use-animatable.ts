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
import { type AnimationTargets, resolveTarget } from "@src/utils/resolve-target.ts"

export interface UseAnimatableReturn {
  /** The underlying Anime.js animatable instance. `undefined` until the target is available. */
  animatable: DeepReadonly<ShallowRef<AnimatableObject | undefined>>
  /** Cancels the animatable and restores all animated properties to their original values. */
  revert: () => AnimatableObject | undefined
}

/**
 * Wraps Anime.js `createAnimatable()` into a Vue composable. Reactively re-creates the animatable when the target or options change, and reverts it automatically on unmount.
 *
 * @param targets - The element(s) to make animatable. Accepts a template ref, a CSS selector, a DOM element, or a reactive ref to any of these.
 * @param options - Anime.js animatable parameters. Accepts a plain object or a reactive ref / computed. Defaults to `{}`.
 */
export function useAnimatable(
  targets: AnimationTargets,
  options: MaybeRef<AnimatableParams> = {}
): UseAnimatableReturn {
  const animatable = shallowRef<AnimatableObject>()

  const watch_target = computed<{ el: TargetsParam; opt: AnimatableParams }>(() => ({
    el: resolveTarget(targets),
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