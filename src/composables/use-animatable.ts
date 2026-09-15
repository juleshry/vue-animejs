import {
  type Animatable,
  type AnimatableParams,
  type AnimatableProperty,
  type AnimatablePropertyParamsOptions,
  createAnimatable,
  type TargetsParam,
} from "animejs"
import {
  computed,
  isRef,
  markRaw,
  type MaybeRef,
  shallowReadonly,
  type ShallowRef,
  shallowRef,
  unref,
  watch,
} from "vue"
import { isClient, tryOnUnmounted } from "@vueuse/core"
import { type AnimationTargets, resolveTarget } from "@src/utils/resolve-target.ts"

/** The keys of `T` that represent animatable properties, excluding Anime.js's reserved config keys (`ease`, `duration`, `unit`, `modifier`, `composition`). */
export type AnimatablePropertyKeys<T extends AnimatableParams> = Exclude<keyof T, keyof AnimatablePropertyParamsOptions>

/** An `AnimatableObject` narrowed to only the property setters/getters implied by `T`. */
export type TypedAnimatableObject<T extends AnimatableParams> = Animatable & {
  [K in AnimatablePropertyKeys<T>]: AnimatableProperty
}

export interface UseAnimatableReturn<T extends AnimatableParams = AnimatableParams> {
  /** The underlying Anime.js animatable instance. `undefined` until the target is available. */
  animatable: Readonly<ShallowRef<TypedAnimatableObject<T> | undefined>>
  /** Cancels the animatable and restores all animated properties to their original values. */
  revert: () => TypedAnimatableObject<T> | undefined
}

/**
 * Wraps Anime.js `createAnimatable()` into a Vue composable. Reactively re-creates the animatable when the target or options change, and reverts it automatically on unmount.
 *
 * @param targets - The element(s) to make animatable. Accepts a template ref, a CSS selector, a DOM element, or a reactive ref to any of these.
 * @param options - Anime.js animatable parameters. Accepts a plain object or a reactive ref / computed. Defaults to `{}`.
 */
export function useAnimatable<T extends AnimatableParams = AnimatableParams>(
  targets: AnimationTargets,
  options: MaybeRef<T> = {} as T
): UseAnimatableReturn<T> {
  const animatable = shallowRef<TypedAnimatableObject<T>>()

  const watch_target = computed<{ el: TargetsParam; opt: T }>(() => ({
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

      animatable.value = markRaw(createAnimatable(el, opt) as unknown as TypedAnimatableObject<T>)
    },
    { flush: "post", immediate: !isRef(targets) && isClient }
  )

  tryOnUnmounted(() => {
    stop()
    revert()
  })

  function revert() {
    return animatable.value?.revert()
  }

  return { animatable: shallowReadonly(animatable), revert }
}