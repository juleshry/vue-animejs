import { type Ref, type ComponentPublicInstance, type MaybeRef } from "vue"
import { unrefElement, type MaybeComputedElementRef } from "@vueuse/core"
import { type TargetsParam } from "animejs"

/**
 * A single valid animation target: any Anime.js `TargetsParam` (optionally wrapped in a `Ref`),
 * or a Vue component template ref (`Ref<ComponentPublicInstance>`), whose `.$el` is resolved
 * automatically via `unrefElement`.
 */
export type AnimationTarget = MaybeRef<TargetsParam> | Ref<ComponentPublicInstance>

/**
 * Any valid animation target, or a plain array of them — e.g. an array of individual
 * template refs (`[ref1, ref2, ref3]`). Each item in an array is resolved independently.
 */
export type AnimationTargets = AnimationTarget | AnimationTarget[]

/**
 * Resolves an `AnimationTargets` value to a plain `TargetsParam` suitable for Anime.js.
 * Unwraps `Ref<HTMLElement | SVGElement>` template refs and `Ref<ComponentPublicInstance>`
 * component refs (extracting `.$el`); non-ref values pass through unchanged.
 *
 * A plain array is resolved item by item; entries that resolve to `null`/`undefined` (e.g.
 * a template ref not yet mounted) are filtered out, and an all-empty result becomes
 * `undefined` rather than `[]`, matching the "target not ready" behavior of a single ref.
 *
 * @param targets - A raw Anime.js target, a Vue template ref, a Vue component ref, or an array of these.
 */
export function resolveTarget(targets: AnimationTargets): TargetsParam {
  if (Array.isArray(targets)) {
    const resolved = targets.map(target => unrefElement(target as MaybeComputedElementRef)).filter(el => el != null)

    return (resolved.length > 0 ? resolved : undefined) as TargetsParam
  }

  return unrefElement(targets as MaybeComputedElementRef) as TargetsParam
}