import { type Ref, type ComponentPublicInstance, type MaybeRef } from "vue"
import { unrefElement, type MaybeComputedElementRef } from "@vueuse/core"
import { type TargetsParam } from "animejs"

/**
 * Any valid animation target: any Anime.js `TargetsParam` (optionally wrapped in a `Ref`),
 * or a Vue component template ref (`Ref<ComponentPublicInstance>`), whose `.$el` is resolved
 * automatically via `unrefElement`.
 */
export type AnimationTargets = MaybeRef<TargetsParam> | Ref<ComponentPublicInstance>

/**
 * Resolves an `AnimationTargets` value to a plain `TargetsParam` suitable for Anime.js.
 * Unwraps `Ref<HTMLElement | SVGElement>` template refs and `Ref<ComponentPublicInstance>`
 * component refs (extracting `.$el`); non-ref values pass through unchanged.
 *
 * @param targets - A raw Anime.js target, a Vue template ref, or a Vue component ref.
 */
export function resolveTarget(targets: AnimationTargets): TargetsParam {
  return unrefElement(targets as MaybeComputedElementRef) as TargetsParam
}