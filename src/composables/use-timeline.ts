import { type MaybeRef, type ShallowRef, shallowRef, unref, watch, type DeepReadonly, readonly } from "vue"
import {
  type AnimationParams,
  type Callback,
  createTimeline,
  type StaggerFunction,
  type Tickable,
  type Timeline,
  type TimelineParams,
  type TimelinePosition,
  type Timer,
} from "animejs"
import { tryOnMounted, tryOnUnmounted } from "@vueuse/core"
import { type AnimationTargets, resolveTarget } from "@src/utils/resolve-target.ts"

type QueueEntry =
  | {
      type: "add"
      targets: AnimationTargets
      params: AnimationParams
      position?: TimelinePosition | StaggerFunction<number | string>
    }
  | { type: "set"; targets: AnimationTargets; params: AnimationParams; position?: TimelinePosition }

export type TimelineChain = Timeline & {
  /** Adds an animation to the timeline and returns a chainable object. */
  add: (
    targets: AnimationTargets,
    params: AnimationParams,
    position?: TimelinePosition | StaggerFunction<number | string>
  ) => TimelineChain
  /** Sets a property to a value at a point in the timeline without animating it, then returns a chainable object. */
  set: (targets: AnimationTargets, params: AnimationParams, position?: TimelinePosition) => TimelineChain
  /** Removes an animation target (or a specific property) from the timeline and returns a chainable object. */
  remove: (targets: AnimationTargets, propertyName?: string) => TimelineChain
}

export interface UseTimelineReturn {
  /** The underlying Anime.js timeline instance. */
  timeline: DeepReadonly<ShallowRef<Timeline>>
  /** Adds an animation to the timeline. Accepts a template ref or any valid Anime.js target. Returns a chainable object. */
  add: (
    targets: AnimationTargets,
    params: AnimationParams,
    position?: TimelinePosition | StaggerFunction<number | string>
  ) => TimelineChain
  /** Sets a property to a value at a point in the timeline without animating it. Returns a chainable object. */
  set: (targets: AnimationTargets, params: AnimationParams, position?: TimelinePosition) => TimelineChain
  /** Removes an animation target (or a specific property) from the timeline. Returns a chainable object. */
  remove: (targets: AnimationTargets, propertyName?: string) => TimelineChain
  /** Synchronises another tickable (animation, timer) into the timeline at the given position. */
  sync: (synced?: Tickable, position?: TimelinePosition) => Timeline
  /** Adds a named label at a position so it can be referenced by `.add()` or `.seek()`. */
  label: (labelName: string, position?: TimelinePosition) => Timeline
  /** Inserts a callback function at a specific point in the timeline. */
  call: (callback: Callback<Timer>, position?: TimelinePosition) => Timeline
  /** Renders the timeline once without playing it. */
  init: (internalRender?: boolean) => Timeline
  /** Starts or resumes the timeline. */
  play: () => Timeline
  /** Reverses playback direction. */
  reverse: () => Timeline
  /** Pauses the timeline at the current position. */
  pause: () => Timeline
  /** Restarts the timeline from the beginning. */
  restart: () => Timeline
  /** Toggles between forward and reverse direction. */
  alternate: () => Timeline
  /** Resumes from a paused state. */
  resume: () => Timeline
  /** Jumps immediately to the end of the timeline. */
  complete: () => Timeline
  /** Resets the timeline to its initial state. Pass `true` for a soft reset that preserves the current cycle. */
  reset: (softReset?: boolean) => Timeline
  /** Stops the timeline and removes it from the Anime.js engine. */
  cancel: () => Timeline
  /** Cancels the timeline and restores all animated properties to their original values. */
  revert: () => Timeline
  /** Seeks to a specific time (in ms). */
  seek: (time: number, muteCallbacks?: boolean | number, internalRender?: boolean | number) => Timeline
  /** Rescales the timeline to a new total duration. */
  stretch: (newDuration: number) => Timeline
  /** Re-reads the current values of all animated properties from the DOM. */
  refresh: () => Timeline
}

/**
 * Wraps Anime.js `createTimeline()` into a Vue composable. Reactively re-creates the timeline when options change, and cancels it automatically on unmount.
 *
 * @param options - Anime.js timeline parameters. Accepts a plain object or a reactive ref / computed. Defaults to `{}`.
 */
export function useTimeline(options: MaybeRef<TimelineParams> = {}): UseTimelineReturn {
  let is_mounted = false

  const queue: QueueEntry[] = []

  const timeline = shallowRef<Timeline>(createTimeline(unref(options)))

  function replayQueue() {
    for (const entry of queue) {
      if (entry.type === "add") {
        timeline.value.add(resolveTarget(entry.targets), entry.params, entry.position)
      } else {
        timeline.value.set(resolveTarget(entry.targets), entry.params, entry.position)
      }
    }
  }

  const { stop } = watch(
    () => unref(options),
    _options => {
      revert()
      timeline.value = createTimeline(_options)
      replayQueue()
    },
    { flush: "post", deep: 1 }
  )

  tryOnMounted(() => {
    is_mounted = true
    replayQueue()
  })

  tryOnUnmounted(() => {
    stop()
    cancel()
  })

  function add(
    targets: AnimationTargets,
    params: AnimationParams,
    position?: TimelinePosition | StaggerFunction<number | string>
  ) {
    queue.push({ type: "add", targets, params, position })

    if (is_mounted) {
      return { ...timeline.value.add(resolveTarget(targets), params, position), add, set, remove } as TimelineChain
    }

    return { ...timeline.value, add, set, remove } as TimelineChain
  }

  function set(targets: AnimationTargets, params: AnimationParams, position?: TimelinePosition) {
    queue.push({ type: "set", targets, params, position })

    if (is_mounted) {
      return { ...timeline.value.set(resolveTarget(targets), params, position), add, set, remove } as TimelineChain
    }

    return { ...timeline.value, add, set, remove } as TimelineChain
  }

  function remove(targets: AnimationTargets, propertyName?: string) {
    if (!is_mounted) {
      console.warn("Cannot remove from timeline before mount")
      return { ...timeline.value, add, set, remove } as TimelineChain
    }

    return { ...timeline.value.remove(resolveTarget(targets), propertyName), add, set, remove } as TimelineChain
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
    timeline: readonly(timeline),
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