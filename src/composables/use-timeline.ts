import {
  getCurrentInstance,
  type MaybeRef,
  type ShallowRef,
  onMounted,
  onUnmounted,
  shallowRef,
  unref,
  watch,
} from "vue"
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

type QueueEntry =
  | {
      type: "add"
      targets: MaybeRef<TargetsParam>
      params: AnimationParams
      position?: TimelinePosition | StaggerFunction<number | string>
    }
  | { type: "set"; targets: MaybeRef<TargetsParam>; params: AnimationParams; position?: TimelinePosition }

export type TimelineChain = Timeline & {
  add: (
    targets: MaybeRef<TargetsParam>,
    params: AnimationParams,
    position?: TimelinePosition | StaggerFunction<number | string>
  ) => TimelineChain
  set: (targets: MaybeRef<TargetsParam>, params: AnimationParams, position?: TimelinePosition) => TimelineChain
  remove: (targets: MaybeRef<TargetsParam>, propertyName?: string) => TimelineChain
}

export interface UseTimelineReturn {
  timeline: ShallowRef<Timeline>
  add: (
    targets: MaybeRef<TargetsParam>,
    params: AnimationParams,
    position?: TimelinePosition | StaggerFunction<number | string>
  ) => TimelineChain
  set: (targets: MaybeRef<TargetsParam>, params: AnimationParams, position?: TimelinePosition) => TimelineChain
  remove: (targets: MaybeRef<TargetsParam>, propertyName?: string) => TimelineChain
  sync: (synced?: Tickable, position?: TimelinePosition) => Timeline
  label: (labelName: string, position?: TimelinePosition) => Timeline
  call: (callback: Callback<Timer>, position?: TimelinePosition) => Timeline
  init: (internalRender?: boolean) => Timeline
  play: () => Timeline
  reverse: () => Timeline
  pause: () => Timeline
  restart: () => Timeline
  alternate: () => Timeline
  resume: () => Timeline
  complete: () => Timeline
  reset: (softReset?: boolean) => Timeline
  cancel: () => Timeline
  revert: () => Timeline
  seek: (time: number, muteCallbacks?: boolean | number, internalRender?: boolean | number) => Timeline
  stretch: (newDuration: number) => Timeline
  refresh: () => Timeline
}

export function useTimeline(options: MaybeRef<TimelineParams> = {}): UseTimelineReturn {
  let is_mounted = false
  const instance = getCurrentInstance()

  const queue: QueueEntry[] = []

  const timeline = shallowRef<Timeline>(createTimeline(unref(options)))

  if (instance) {
    const { stop } = watch(
      () => unref(options),
      _options => {
        cancel()
        timeline.value = createTimeline(_options)
      },
      { flush: "post" }
    )

    onMounted(() => {
      is_mounted = true

      queue.forEach(entry => {
        switch (entry.type) {
          case "add":
            add(entry.targets, entry.params, entry.position)
            break
          case "set":
            set(entry.targets, entry.params, entry.position)
            break
        }
      })

      queue.length = 0
    })

    onUnmounted(() => {
      stop()
      cancel()
    })
  }

  function add(
    targets: MaybeRef<TargetsParam>,
    params: AnimationParams,
    position?: TimelinePosition | StaggerFunction<number | string>
  ) {
    if (is_mounted) {
      return { ...timeline.value.add(unref(targets), params, position), add, set, remove } as TimelineChain
    }

    queue.push({ type: "add", targets, params, position })
    return { ...timeline.value, add, set, remove } as TimelineChain
  }

  function set(targets: MaybeRef<TargetsParam>, params: AnimationParams, position?: TimelinePosition) {
    if (is_mounted) {
      return { ...timeline.value.set(unref(targets), params, position), add, set, remove } as TimelineChain
    }

    queue.push({ type: "set", targets, params, position })
    return { ...timeline.value, add, set, remove } as TimelineChain
  }

  function remove(targets: MaybeRef<TargetsParam>, propertyName?: string) {
    if (!is_mounted) {
      console.warn("Cannot remove from timeline before mount")
      return { ...timeline.value, add, set, remove } as TimelineChain
    }

    return { ...timeline.value.remove(unref(targets), propertyName), add, set, remove } as TimelineChain
  }

  function sync(synced?: Tickable, position?: TimelinePosition) {
    return timeline.value.sync(synced, position)
  }

  function label(labelName: string, position?: TimelinePosition) {
    return timeline.value.label(labelName, position)
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
