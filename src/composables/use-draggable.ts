import { type DeepReadonly, isRef, type MaybeRef, readonly, type ShallowRef, shallowRef, unref, watch } from "vue"
import { tryOnUnmounted } from "@vueuse/core"
import { type Draggable, type DraggableParams, type TargetsParam, createDraggable, type EasingParam } from "animejs"

export interface UseDraggableReturn {
  draggable: DeepReadonly<ShallowRef<Draggable | undefined>>
  disable: () => void
  enable: () => void
  setX: (x: number, muteUpdateCallback?: boolean) => void
  setY: (y: number, muteUpdateCallback?: boolean) => void
  animateInView: (duration?: number, gap?: number, ease?: EasingParam) => void
  scrollInView: (duration?: number, gap?: number, ease?: EasingParam) => void
  stop: () => void
  reset: () => void
  revert: () => void
  refresh: () => void
}

export function useDraggable(
  targets: MaybeRef<TargetsParam>,
  options: MaybeRef<DraggableParams> = {}
): UseDraggableReturn {
  const draggable = shallowRef<Draggable>()

  const { stop: stopWatch } = watch(
    [() => unref(targets), () => unref(options)],
    ([el, opt]) => {
      revert()

      if (!el) {
        console.warn("Targets element is null or undefined")
        draggable.value = undefined
        return
      }

      draggable.value = createDraggable(el, opt)
    },
    { flush: "post", immediate: !isRef(targets) }
  )

  tryOnUnmounted(() => {
    revert()
    stopWatch()
  })

  function disable() {
    return draggable.value?.disable()
  }

  function enable() {
    return draggable.value?.enable()
  }

  function setX(x: number, muteUpdateCallback?: boolean) {
    return draggable.value?.setX(x, muteUpdateCallback)
  }

  function setY(y: number, muteUpdateCallback?: boolean) {
    return draggable.value?.setY(y, muteUpdateCallback)
  }

  function animateInView(duration?: number, gap?: number, ease?: EasingParam) {
    return draggable.value?.animateInView(duration, gap, ease)
  }

  function scrollInView(duration?: number, gap?: number, ease?: EasingParam) {
    return draggable.value?.scrollInView(duration, gap, ease)
  }

  function stop() {
    return draggable.value?.stop()
  }

  function reset() {
    return draggable.value?.reset()
  }

  function revert() {
    return draggable.value?.revert()
  }

  function refresh() {
    return draggable.value?.refresh()
  }

  return {
    draggable: readonly(draggable),
    disable,
    enable,
    setX,
    setY,
    animateInView,
    scrollInView,
    stop,
    reset,
    revert,
    refresh,
  }
}
