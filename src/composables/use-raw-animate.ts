import { animate, AnimationParams, TargetSelector } from "animejs"
import { MaybeRef, unref } from "vue"

export interface UseRawAnimateReturn {
  animate: (target: TargetSelector, options: AnimationParams) => void
}

export function useRawAnimate(_target: MaybeRef<TargetSelector>, _options: MaybeRef<AnimationParams> = {}) {
  const target = unref(_target)

  if (!target) {
    console.warn("Target is undefined")
  }

  return animate(target, unref(_options))
}
