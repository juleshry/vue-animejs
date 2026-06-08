import { svg, type FunctionValue, type TargetsParam } from "animejs"
import { type MaybeRef, unref } from "vue"

export interface UseSvgReturn {
  /** Returns a `FunctionValue` that morphs the current path to the given `path`. Pass the result as the `d` property in `useAnimate` options. */
  morphTo: (path: MaybeRef<TargetsParam>, precision?: MaybeRef<number>) => FunctionValue
  /** Creates a motion-path object from an SVG `<path>`. Spread the result into `useAnimate` options to animate `translateX`, `translateY`, and `rotate` along the path. */
  createMotionPath: (
    path: MaybeRef<TargetsParam | null>,
    offset?: MaybeRef<number>
  ) => ReturnType<typeof svg.createMotionPath>
}

/**
 * Exposes Anime.js SVG utilities (`svg.morphTo`, `svg.createMotionPath`) as a Vue composable, automatically unwrapping reactive refs passed to each helper.
 *
 * For drawable stroke animations, use `useSvgDrawable` instead.
 */
export function useSvg(): UseSvgReturn {
  function morphTo(_path: MaybeRef<TargetsParam>, precision?: MaybeRef<number>) {
    const path = unref(_path)

    if (!path) return () => ""

    return svg.morphTo(unref(path), unref(precision))
  }

  function createMotionPath(path: MaybeRef<TargetsParam | null>, offset?: MaybeRef<number>) {
    const resolved = unref(path) ?? ""
    return svg.createMotionPath(resolved, unref(offset))
  }

  return {
    morphTo,
    createMotionPath,
  }
}