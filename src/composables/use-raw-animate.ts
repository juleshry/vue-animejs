import { animate, type AnimationParams, type JSAnimation } from "animejs"
import { type MaybeRef, unref } from "vue"
import { type AnimationTargets, resolveTarget } from "@src/utils/resolve-target.ts"

/** The Anime.js `JSAnimation` instance returned by `useRawAnimate`. */
export type UseRawAnimateReturn = JSAnimation

/**
 * Thin wrapper around Anime.js `animate()`. Resolves the target (unwrapping refs and Vue component
 * refs via `.$el`) and immediately starts the animation.
 *
 * @param _target - The element(s) to animate. Accepts a template ref, a Vue component ref, a CSS selector, a DOM element, or a reactive ref to any of these.
 * @param _options - Anime.js animation parameters. Accepts a plain object or a reactive ref / computed. Defaults to `{}`.
 */
export function useRawAnimate(
  _target: AnimationTargets,
  _options: MaybeRef<AnimationParams> = {}
): UseRawAnimateReturn {
  const target = resolveTarget(_target)

  if (!target) {
    console.warn("Target is undefined")
  }

  return animate(target, unref(_options))
}