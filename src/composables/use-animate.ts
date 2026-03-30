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
    animation.value?.play()
  }

  function reverse() {
    animation.value?.reverse()
  }

  function pause() {
    animation.value?.pause()
  }

  function restart() {
    animation.value?.restart()
  }

  function alternate() {
    animation.value?.alternate()
  }

  function resume() {
    animation.value?.resume()
  }

  function complete() {
    animation.value?.complete()
  }

  function cancel() {
    animation.value?.cancel()
  }

  function revert() {
    animation.value?.revert()
  }

  function reset() {
    animation.value?.reset()
  }

  function seek(time: number, muteCallbacks?: boolean | number, internalRender?: boolean | number) {
    animation.value?.seek(time, muteCallbacks, internalRender)
  }

  function stretch(newDuration: number) {
    animation.value?.stretch(newDuration)
  }

  function refresh() {
    animation.value?.refresh()
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
