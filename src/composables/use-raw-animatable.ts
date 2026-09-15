import { type AnimatableObject, type AnimatableParams, createAnimatable } from "animejs"
import { type MaybeRef, unref } from "vue"
import { type AnimationTargets, resolveTarget } from "@src/utils/resolve-target.ts"

/** The Anime.js `AnimatableObject` instance returned by `useRawAnimatable`. */
export type UseRawAnimatableReturn = AnimatableObject

/**
 * Thin wrapper around Anime.js `createAnimatable()`. Resolves the target (unwrapping refs and Vue
 * component refs via `.$el`) and immediately creates the animatable.
 *
 * SSR-safety is the caller's responsibility: invoke this from inside your own `onMounted` (it runs
 * unconditionally and immediately, with no client-only guard), never at `setup()` top level.
 *
 * @param targets - The element(s) to make animatable. Accepts a template ref, a Vue component ref, a CSS selector, a DOM element, or a reactive ref to any of these.
 * @param options - Anime.js animatable parameters. Accepts a plain object or a reactive ref / computed. Defaults to `{}`.
 */
export function useRawAnimatable(
  targets: AnimationTargets,
  options: MaybeRef<AnimatableParams> = {}
): UseRawAnimatableReturn {
  const target = resolveTarget(targets)

  if (!target) {
    console.warn("Targets element is null or undefined")
  }

  return createAnimatable(target, unref(options))
}