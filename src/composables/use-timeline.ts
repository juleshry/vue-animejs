import { type MaybeRef, onUnmounted, ref, unref, watch } from "vue"
import {
  type AnimationParams,
  type Callback,
  createTimeline,
  type StaggerFunction,
  type TargetsParam,
  type Tickable,
  type Timeline,
  type TimelineParams,
  type TimelinePosition,
  type Timer,
} from "animejs"

export function useTimeline(options: MaybeRef<TimelineParams> = {}) {
  const timeline = ref<Timeline>(createTimeline(unref(options)))
  const { stop } = watch(
    () => unref(options),
    _options => {
      cancel()
      timeline.value = createTimeline(_options)
    },
    { flush: "post" }
  )

  onUnmounted(() => {
    stop()
    cancel()
  })

  function add(a1: TargetsParam, a2: AnimationParams, a3?: TimelinePosition | StaggerFunction<number | string>) {
    return timeline.value.add(a1, a2, a3)
  }

  function set(targets: TargetsParam, parameters: AnimationParams, position?: TimelinePosition) {
    return timeline.value.set(targets, parameters, position)
  }

  function sync(synced?: Tickable, position?: TimelinePosition) {
    return timeline.value.sync(synced, position)
  }

  function label(labelName: string, position?: TimelinePosition) {
    return timeline.value.label(labelName, position)
  }

  function remove(targets: TargetsParam, propertyName?: string) {
    return timeline.value.remove(targets, propertyName)
  }

  function call(callback: Callback<Timer>, position?: TimelinePosition) {
    return timeline.value.call(callback, position)
  }

  function init(internalRender?: boolean) {
    return timeline.value.init(internalRender)
  }

  function play() {
    return timeline.value.play()
  }

  function reverse() {
    return timeline.value.reverse()
  }

  function pause() {
    return timeline.value.pause()
  }

  function restart() {
    return timeline.value.restart()
  }

  function alternate() {
    return timeline.value.alternate()
  }

  function resume() {
    return timeline.value.resume()
  }

  function complete() {
    return timeline.value.complete()
  }

  function reset(softReset?: boolean) {
    return timeline.value.reset(softReset)
  }

  function cancel() {
    return timeline.value.cancel()
  }

  function revert() {
    return timeline.value.revert()
  }

  function seek(time: number, muteCallbacks?: boolean | number, internalRender?: boolean | number) {
    return timeline.value.seek(time, muteCallbacks, internalRender)
  }

  function stretch(newDuration: number) {
    return timeline.value.stretch(newDuration)
  }

  function refresh() {
    return timeline.value.refresh()
  }

  return {
    timeline,
    add,
    set,
    sync,
    label,
    remove,
    call,
    init,
    play,
    reverse,
    pause,
    restart,
    alternate,
    resume,
    complete,
    reset,
    cancel,
    revert,
    seek,
    stretch,
    refresh,
  }
}
