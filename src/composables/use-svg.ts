import { svg, type TargetsParam } from "animejs"
import { type MaybeRef, unref } from "vue"

export interface UseSvgReturn {
  /** Returns an interpolated morph target value that transitions the current path to the given `path`. Accepts a reactive ref for the path. */
  morphTo: (path: MaybeRef<TargetsParam>, precision?: MaybeRef<number>) => void
  /** Creates a drawable SVG element whose stroke can be animated with `strokeDashoffset`. `start` and `end` control the visible portion (0–1). */
  createDrawable: (selector: MaybeRef<TargetsParam>, start?: MaybeRef<number>, end?: MaybeRef<number>) => void
  /** Creates a motion-path object from an SVG `<path>` that can be used as a `translateX` / `translateY` animation target. */
  createMotionPath: (path: MaybeRef<TargetsParam>, offset?: MaybeRef<number>) => void
}

/**
 * Exposes Anime.js SVG utilities (`svg.morphTo`, `svg.createDrawable`, `svg.createMotionPath`) as a Vue composable, automatically unwrapping reactive refs passed to each helper.
 */
export function useSvg(): UseSvgReturn {
  function morphTo(path: MaybeRef<TargetsParam>, precision?: MaybeRef<number>) {
    return svg.morphTo(unref(path), unref(precision))
  }

  function createDrawable(selector: MaybeRef<TargetsParam>, start?: MaybeRef<number>, end?: MaybeRef<number>) {
    return svg.createDrawable(unref(selector), unref(start), unref(end))
  }

  function createMotionPath(path: MaybeRef<TargetsParam>, offset?: MaybeRef<number>) {
    return svg.createMotionPath(unref(path), unref(offset))
  }

  return {
    morphTo,
    createDrawable,
    createMotionPath,
  }
}