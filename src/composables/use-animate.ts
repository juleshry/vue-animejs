import { type DeepReadonly, type MaybeRef, type ShallowRef, shallowRef, unref, watch, readonly } from "vue"
import { type JSAnimation, animate, type TargetSelector, type AnimationParams } from "animejs"
import { type MaybeComputedElementRef, tryOnMounted, tryOnUnmounted, unrefElement } from "@vueuse/core"

export interface UseAnimateReturn {
  animation: DeepReadonly<ShallowRef<JSAnimation | undefined>>
  play: () => JSAnimation | undefined
  reverse: () => JSAnimation | undefined
  pause: () => JSAnimation | undefined
  restart: () => JSAnimation | undefined
  alternate: () => JSAnimation | undefined
  resume: () => JSAnimation | undefined
  complete: () => JSAnimation | undefined
  cancel: () => JSAnimation | undefined
  revert: () => JSAnimation | undefined
  reset: (softReset?: boolean) => JSAnimation | undefined
  seek: (time: number, muteCallbacks?: boolean | number, internalRender?: boolean | number) => JSAnimation | undefined
  stretch: (newDuration: number) => JSAnimation | undefined
  refresh: () => JSAnimation | undefined
}

export function useAnimate(
  _target: MaybeRef<TargetSelector> | MaybeComputedElementRef,
  _options: MaybeRef<AnimationParams> = {}
): UseAnimateReturn {
  const animation = shallowRef<JSAnimation>()

  function resolveTarget() {
    return unrefElement(_target as MaybeComputedElementRef) ?? unref(_target as MaybeRef<TargetSelector>)
  }

  const { stop } = watch(
    [resolveTarget, () => unref(_options)],
    ([el, opt]) => {
      createAnimation(el, opt)
    },
    { flush: "post" }
  )

  tryOnMounted(() => {
    createAnimation(resolveTarget(), unref(_options))
  })

  tryOnUnmounted(() => {
    stop()
    cancel()
  })

  function createAnimation(el: TargetSelector, opt: AnimationParams) {
    cancel()

    if (!el) {
      console.warn("Target element is null or undefined")
      return
    }

    animation.value = animate(el, opt)
  }

  function play() {
    return animation.value?.play()
  }

  function reverse() {
    return animation.value?.reverse()
  }

  function pause() {
    return animation.value?.pause()
  }

  function restart() {
    return animation.value?.restart()
  }

  function alternate() {
    return animation.value?.alternate()
  }

  function resume() {
    return animation.value?.resume()
  }

  function complete() {
    return animation.value?.complete()
  }

  function cancel() {
    return animation.value?.cancel()
  }

  function revert() {
    return animation.value?.revert()
  }

  function reset(softReset?: boolean) {
    return animation.value?.reset(softReset)
  }

  function seek(time: number, muteCallbacks?: boolean | number, internalRender?: boolean | number) {
    return animation.value?.seek(time, muteCallbacks, internalRender)
  }

  function stretch(newDuration: number) {
    return animation.value?.stretch(newDuration)
  }

  function refresh() {
    return animation.value?.refresh()
  }

  return {
    animation: readonly(animation),
    play,
    reverse,
    pause,
    restart,
    alternate,
    resume,
    complete,
    cancel,
    revert,
    reset,
    seek,
    stretch,
    refresh,
  }
}
