import { markRaw, type MaybeRefOrGetter, shallowReadonly, type ShallowRef, shallowRef } from "vue"
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
import { tryOnUnmounted } from "@vueuse/core"
import { type AnimationTargets, resolveTarget } from "@src/utils/resolve-target.ts"
import { watchOptions } from "@src/utils/watch-options.ts"
import { type MaybeRefOptions, resolveOptions } from "@src/utils/resolve-options.ts"

/**
 * What `add`, `set` and `remove` return: the live timeline, with its own `add` / `set` / `remove` swapped for the
 * composable's queueing ones. Before mount there's no timeline yet, so only `add` / `set` / `remove` are available.
 */
export type TimelineChain = Timeline & {
  /** Adds an animation to the timeline and returns a chainable object. */
  add: (
    targets: AnimationTargets,
    params: MaybeRefOrGetter<MaybeRefOptions<AnimationParams>>,
    position?: TimelinePosition | StaggerFunction<number | string>
  ) => TimelineChain
  /** Sets a property to a value at a point in the timeline without animating it, then returns a chainable object. */
  set: (
    targets: AnimationTargets,
    params: MaybeRefOrGetter<MaybeRefOptions<AnimationParams>>,
    position?: TimelinePosition
  ) => TimelineChain
  /** Removes an animation target (or a specific property) from the timeline and returns a chainable object. */
  remove: (targets: AnimationTargets, propertyName?: string) => TimelineChain
}

export interface UseTimelineReturn {
  /** The underlying Anime.js timeline instance. `undefined` until mounted. */
  timeline: Readonly<ShallowRef<Timeline | undefined>>
  /** Adds an animation to the timeline. Accepts a template ref or any valid Anime.js target. Returns a chainable object. */
  add: (
    targets: AnimationTargets,
    params: MaybeRefOrGetter<MaybeRefOptions<AnimationParams>>,
    position?: TimelinePosition | StaggerFunction<number | string>
  ) => TimelineChain
  /** Sets a property to a value at a point in the timeline without animating it. Returns a chainable object. */
  set: (
    targets: AnimationTargets,
    params: MaybeRefOrGetter<MaybeRefOptions<AnimationParams>>,
    position?: TimelinePosition
  ) => TimelineChain
  /** Removes an animation target (or a specific property) from the timeline. Returns a chainable object. */
  remove: (targets: AnimationTargets, propertyName?: string) => TimelineChain
  /** Synchronises another tickable (animation, timer) into the timeline at the given position. */
  sync: (synced?: Tickable, position?: TimelinePosition) => Timeline | undefined
  /** Adds a named label at a position so it can be referenced by `.add()` or `.seek()`. */
  label: (labelName: string, position?: TimelinePosition) => Timeline | undefined
  /** Inserts a callback function at a specific point in the timeline. */
  call: (callback: Callback<Timer>, position?: TimelinePosition) => Timeline | undefined
  /** Renders the timeline once without playing it. */
  init: (internalRender?: boolean) => Timeline | undefined
  /** Starts or resumes the timeline. */
  play: () => Timeline | undefined
  /** Reverses playback direction. */
  reverse: () => Timeline | undefined
  /** Pauses the timeline at the current position. */
  pause: () => Timeline | undefined
  /** Restarts the timeline from the beginning. */
  restart: () => Timeline | undefined
  /** Toggles between forward and reverse direction. */
  alternate: () => Timeline | undefined
  /** Resumes from a paused state. */
  resume: () => Timeline | undefined
  /** Jumps immediately to the end of the timeline. */
  complete: () => Timeline | undefined
  /** Resets the timeline to its initial state. Pass `true` for a soft reset that preserves the current cycle. */
  reset: (softReset?: boolean) => Timeline | undefined
  /** Stops the timeline and removes it from the Anime.js engine. */
  cancel: () => Timeline | undefined
  /** Cancels the timeline and restores all animated properties to their original values. */
  revert: () => Timeline | undefined
  /** Seeks to a specific time (in ms). */
  seek: (time: number, muteCallbacks?: boolean | number, internalRender?: boolean | number) => Timeline | undefined
  /** Rescales the timeline to a new total duration. */
  stretch: (newDuration: number) => Timeline | undefined
  /** Re-reads the current values of all animated properties from the DOM. */
  refresh: () => Timeline | undefined
}

/**
 * Wraps Anime.js `createTimeline()` into a Vue composable. Reactively re-creates the timeline when options change, and cancels it automatically on unmount.
 *
 * `add`, `set`, `remove`, `call`, `label` and `sync` calls are recorded in order: made before mount, they apply once
 * the timeline exists, and when options change they're all replayed on the new timeline.
 *
 * @param options - Anime.js timeline parameters. Accepts a plain object, a ref / computed / getter, and refs as direct properties. Defaults to `{}`.
 */
export function useTimeline(options: MaybeRefOrGetter<MaybeRefOptions<TimelineParams>> = {}): UseTimelineReturn {
  // Every call that builds the timeline's content, in order, so a re-created timeline gets it all back
  const queue: ((instance: Timeline) => Timeline)[] = []

  const timeline = shallowRef<Timeline>()

  const { stop } = watchOptions(options, opt => {
    revert()
    timeline.value = markRaw(createTimeline(opt))
    for (const apply of queue) apply(timeline.value)
  })

  tryOnUnmounted(() => {
    stop()
    cancel()
  })

  /** Records `apply` for replay, and runs it now if the timeline exists. */
  function enqueue(apply: (instance: Timeline) => Timeline): Timeline | undefined {
    queue.push(apply)
    return timeline.value && apply(timeline.value)
  }

  function add(
    targets: AnimationTargets,
    _params: MaybeRefOrGetter<MaybeRefOptions<AnimationParams>>,
    position?: TimelinePosition | StaggerFunction<number | string>
  ) {
    return toChain(enqueue(instance => instance.add(resolveTarget(targets), resolveOptions(_params), position)))
  }

  function set(
    targets: AnimationTargets,
    _params: MaybeRefOrGetter<MaybeRefOptions<AnimationParams>>,
    position?: TimelinePosition
  ) {
    return toChain(enqueue(instance => instance.set(resolveTarget(targets), resolveOptions(_params), position)))
  }

  function remove(targets: AnimationTargets, propertyName?: string) {
    return toChain(enqueue(instance => instance.remove(resolveTarget(targets), propertyName)))
  }

  /**
   * Overlays the queueing `add` / `set` / `remove` on a timeline instance. A Proxy rather than a spread:
   * Timeline's methods and accessors (`play`, `currentTime`, ...) live on its prototype, which a spread drops.
   */
  function toChain(instance: Timeline | undefined): TimelineChain {
    const overrides = { add, set, remove }
    // Before mount there's no instance yet: only the queueing methods work, as before.
    if (!instance) return overrides as unknown as TimelineChain

    return new Proxy(instance, {
      get(target, key) {
        if (key === "add" || key === "set" || key === "remove") return overrides[key]
        const value: unknown = Reflect.get(target, key, target)
        return typeof value === "function" ? value.bind(target) : value
      },
      set: (target, key, value) => Reflect.set(target, key, value, target),
    }) as TimelineChain
  }

  function sync(synced?: Tickable, position?: TimelinePosition) {
    return enqueue(instance => instance.sync(synced, position))
  }

  function label(labelName: string, position?: TimelinePosition) {
    return enqueue(instance => instance.label(labelName, position))
  }

  function call(callback: Callback<Timer>, position?: TimelinePosition) {
    return enqueue(instance => instance.call(callback, position))
  }

  function init(internalRender?: boolean) {
    return timeline.value?.init(internalRender)
  }

  function play() {
    return timeline.value?.play()
  }

  function reverse() {
    return timeline.value?.reverse()
  }

  function pause() {
    return timeline.value?.pause()
  }

  function restart() {
    return timeline.value?.restart()
  }

  function alternate() {
    return timeline.value?.alternate()
  }

  function resume() {
    return timeline.value?.resume()
  }

  function complete() {
    return timeline.value?.complete()
  }

  function reset(softReset?: boolean) {
    return timeline.value?.reset(softReset)
  }

  function cancel() {
    return timeline.value?.cancel()
  }

  function revert() {
    return timeline.value?.revert()
  }

  function seek(time: number, muteCallbacks?: boolean | number, internalRender?: boolean | number) {
    return timeline.value?.seek(time, muteCallbacks, internalRender)
  }

  function stretch(newDuration: number) {
    return timeline.value?.stretch(newDuration)
  }

  function refresh() {
    return timeline.value?.refresh()
  }

  return {
    timeline: shallowReadonly(timeline),
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