import { computed, type MaybeRef, onUnmounted, ref, unref, watch } from "vue"
import { type JSAnimation, animate, type TargetSelector, type AnimationParams } from "animejs"

export function useAnimate(_target: MaybeRef<TargetSelector>, _options: MaybeRef<AnimationParams> = {}) {
  let animation = ref<JSAnimation>()

  const watch_target = computed<{ el: TargetSelector; opt: AnimationParams }>(() => ({
    el: unref(_target),
    opt: unref(_options),
  }))
  const { stop } = watch(
    watch_target,
    ({ el, opt }) => {
      cancel()

      if (!el) {
        console.warn("Target element is null or undefined")
        return
      }

      animation.value = animate(el, opt)
    },
    { immediate: true, flush: "post" }
  )

  onUnmounted(() => {
    stop()
    cancel()
  })

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
    animation,
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
