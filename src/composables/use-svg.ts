import { svg, type TargetsParam } from "animejs"
import { type MaybeRef, unref } from "vue"

export interface UseSvgReturn {
  morphTo: (path: MaybeRef<TargetsParam>, precision?: MaybeRef<number>) => void
  createDrawable: (selector: MaybeRef<TargetsParam>, start?: MaybeRef<number>, end?: MaybeRef<number>) => void
  createMotionPath: (path: MaybeRef<TargetsParam>, offset?: MaybeRef<number>) => void
}

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
