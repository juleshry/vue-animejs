import { animate, type AnimationParams, type JSAnimation } from "animejs"
import { type DeepReadonly, type MaybeRef, readonly, unref } from "vue"
import { type AnimationTargets, resolveTarget } from "@src/utils/resolve-target.ts"

type ReactiveAnimationParams = {
  [K in keyof AnimationParams]: MaybeRef<AnimationParams[K]>
}

function resolveOptions(opts: MaybeRef<ReactiveAnimationParams>): AnimationParams {
  const raw = unref(opts)
  return Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, unref(v)])) as AnimationParams
}

/** The Anime.js `JSAnimation` instance returned by `useRawAnimate`. Undefined until the target is available. */
export type UseRawAnimateReturn = DeepReadonly<JSAnimation>

/**
 * Thin wrapper around Anime.js `animate()`. Resolves the target (unwrapping refs and Vue component
 * refs via `.$el`) and immediately starts the animation.
 *
 * @param _target - The element(s) to animate. Accepts a template ref, a Vue component ref, a CSS selector, a DOM element, or a reactive ref to any of these.
 * @param _options - Anime.js animation parameters. Each value may itself be a `Ref`/`ComputedRef` — the animation is re-created reactively when any of them changes. Accepts a plain object or a reactive ref / computed. Defaults to `{}`.
 */
export function useRawAnimate(
  _target: AnimationTargets,
  _options: MaybeRef<ReactiveAnimationParams> = {}
): UseRawAnimateReturn {
  const target = resolveTarget(_target)
  const opts = resolveOptions(_options)

  if (!target) {
    console.warn("Target is undefined")
  }

  return readonly(animate(target, opts))
}