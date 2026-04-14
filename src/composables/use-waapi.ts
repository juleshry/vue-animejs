import { type MaybeComputedElementRef, tryOnUnmounted, unrefElement } from "@vueuse/core"
import {
  type WAAPIAnimationParams,
  type DOMTargetsParam,
  waapi,
  type WAAPIAnimation,
  type EasingFunction,
} from "animejs"
import { DeepReadonly, isRef, type MaybeRef, readonly, ShallowRef, shallowRef, unref, watch } from "vue"

export interface UseWaapiReturn {
  animation: DeepReadonly<ShallowRef<WAAPIAnimation | undefined>>
  resume: () => WAAPIAnimation | undefined
  pause: () => WAAPIAnimation | undefined
  alternate: () => WAAPIAnimation | undefined
  play: () => WAAPIAnimation | undefined
  reverse: () => WAAPIAnimation | undefined
  seek: (time: MaybeRef<number>, muteCallbacks?: MaybeRef<boolean>) => WAAPIAnimation | undefined
  restart: () => WAAPIAnimation | undefined
  commitStyles: () => WAAPIAnimation | undefined
  complete: () => WAAPIAnimation | undefined
  cancel: () => WAAPIAnimation | undefined
  revert: () => WAAPIAnimation | undefined

  convertEase: (fn: MaybeRef<EasingFunction>, samples?: MaybeRef<number>) => string
}

export function useWaapi(
  targets: MaybeRef<DOMTargetsParam> | MaybeComputedElementRef,
  options: MaybeRef<WAAPIAnimationParams> = {}
): UseWaapiReturn {
  const animation = shallowRef<WAAPIAnimation | undefined>()

  const { stop } = watch(
    [
      () => unrefElement(targets as MaybeComputedElementRef) ?? unref(targets as MaybeRef<DOMTargetsParam>),
      () => unref(options),
    ],
    ([el, opt]) => {
      animation.value = waapi.animate(el, opt)
    },
    { flush: "post", immediate: !isRef(targets) }
  )

  tryOnUnmounted(() => {
    stop()
  })

  function resume() {
    return animation.value?.resume()
  }

  function pause() {
    return animation.value?.pause()
  }

  function alternate() {
    return animation.value?.alternate()
  }

  function play() {
    return animation.value?.play()
  }

  function reverse() {
    return animation.value?.reverse()
  }

  function seek(time: MaybeRef<number>, muteCallbacks?: MaybeRef<boolean>) {
    return animation.value?.seek(unref(time), unref(muteCallbacks))
  }

  function restart() {
    return animation.value?.restart()
  }

  function commitStyles() {
    return animation.value?.commitStyles()
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

  return {
    animation: readonly(animation),
    resume,
    pause,
    alternate,
    play,
    reverse,
    seek,
    restart,
    commitStyles,
    complete,
    cancel,
    revert,

    convertEase,
  }
}

function convertEase(fn: MaybeRef<EasingFunction>, samples: MaybeRef<number> = 100) {
  return waapi.convertEase(unref(fn), unref(samples))
}
