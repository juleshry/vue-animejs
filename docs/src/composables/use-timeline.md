# useTimeline

## Demo

<UseTimelineDemo />

Wraps Anime.js [`createTimeline()`](https://animejs.com/documentation/timeline) into a Vue composable. The timeline is created reactively — it re-creates whenever the options change — and is cancelled automatically on unmount.

## Usage

### Basic timeline

Chain animations on multiple elements sequentially using `add`.

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue"
import { useTimeline } from "@juleshry/vue-animejs"

const box1 = useTemplateRef<HTMLDivElement>("box1")
const box2 = useTemplateRef<HTMLDivElement>("box2")

const { add, play, restart } = useTimeline({ autoplay: false })

add(box1, { translateX: 200, duration: 600, easing: "easeOutExpo" })
  .add(box2, { translateX: 200, duration: 600, easing: "easeOutExpo" })
</script>

<template>
  <div ref="box1" class="box" />
  <div ref="box2" class="box" />
  <button @click="play">Play</button>
  <button @click="restart">Restart</button>
</template>
```

### Overlapping animations with position

Pass a position string to `add` to offset when each animation starts relative to the previous one.

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue"
import { useTimeline } from "@juleshry/vue-animejs"

const box1 = useTemplateRef<HTMLDivElement>("box1")
const box2 = useTemplateRef<HTMLDivElement>("box2")
const box3 = useTemplateRef<HTMLDivElement>("box3")

const { add, play, restart } = useTimeline({ autoplay: false })

add(box1, { translateX: 200, duration: 600 })
  .add(box2, { translateX: 200, duration: 600 }, "-=300" /* starts 300 ms before box1 ends */)
  .add(box3, { translateX: 200, duration: 600 }, "+=100" /* starts 100 ms after box2 ends */)
</script>

<template>
  <div ref="box1" class="box" />
  <div ref="box2" class="box" />
  <div ref="box3" class="box" />
  <button @click="play">Play</button>
  <button @click="restart">Restart</button>
</template>
```

### Setting initial values with `set`

Use `set` to pin a property to a value at a specific point in the timeline without animating it.

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue"
import { useTimeline } from "@juleshry/vue-animejs"

const box = useTemplateRef<HTMLDivElement>("box")

const { set, play } = useTimeline({ autoplay: false })

set(box, { opacity: 0 })
  .add(box, { opacity: 1, translateX: 200, duration: 800 })
</script>

<template>
  <div ref="box" class="box" />
  <button @click="play">Play</button>
</template>
```

### Reactive options

Pass a `ref` or `computed` as the argument to control timeline-level parameters reactively. When options change the timeline is recreated and all previously registered `add`/`set` calls are replayed automatically.

```vue
<script setup lang="ts">
import { ref, computed } from "vue"
import { useTemplateRef } from "vue"
import { useTimeline } from "@juleshry/vue-animejs"

const box1 = useTemplateRef<HTMLDivElement>("box1")
const box2 = useTemplateRef<HTMLDivElement>("box2")
const loop = ref<boolean>(false)

const options = computed(() => ({ autoplay: false, loop: loop.value }))

const { add, play, restart } = useTimeline(options)

add(box1, { translateX: 200, duration: 600, easing: "easeOutExpo" })
  .add(box2, { translateX: 200, duration: 600, easing: "easeOutExpo" }, "-=300")
</script>

<template>
  <div ref="box1" class="box" />
  <div ref="box2" class="box" />
  <label><input v-model="loop" type="checkbox" /> Loop</label>
  <button @click="play">Play</button>
  <button @click="restart">Restart</button>
</template>
```

## Type Declarations

For all available options, see the [Anime.js timeline documentation](https://animejs.com/documentation/timeline).

::: details Show Type Declarations

```ts
export type TimelineChain = Timeline & {
  /** Adds an animation to the timeline and returns a chainable object. */
  add: (
    targets: MaybeRef<TargetsParam>,
    params: AnimationParams,
    position?: TimelinePosition | StaggerFunction<number | string>
  ) => TimelineChain
  /** Sets a property to a value at a point in the timeline without animating it, then returns a chainable object. */
  set: (targets: MaybeRef<TargetsParam>, params: AnimationParams, position?: TimelinePosition) => TimelineChain
  /** Removes an animation target (or a specific property) from the timeline and returns a chainable object. */
  remove: (targets: MaybeRef<TargetsParam>, propertyName?: string) => TimelineChain
}

export interface UseTimelineReturn {
  /** The underlying Anime.js timeline instance. */
  timeline: DeepReadonly<ShallowRef<Timeline>>
  /** Adds an animation to the timeline. Accepts a template ref or any valid Anime.js target. Returns a chainable object. */
  add: (
    targets: MaybeRef<TargetsParam>,
    params: AnimationParams,
    position?: TimelinePosition | StaggerFunction<number | string>
  ) => TimelineChain
  /** Sets a property to a value at a point in the timeline without animating it. Returns a chainable object. */
  set: (targets: MaybeRef<TargetsParam>, params: AnimationParams, position?: TimelinePosition) => TimelineChain
  /** Removes an animation target (or a specific property) from the timeline. Returns a chainable object. */
  remove: (targets: MaybeRef<TargetsParam>, propertyName?: string) => TimelineChain
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
export declare function useTimeline(options?: MaybeRef<TimelineParams>): UseTimelineReturn
```

:::

## Reactivity & Lifecycle Behavior

- `add` and `set` calls made **before mount** are queued and replayed once the component mounts — safe to call at the top level of `<script setup>`.
- `remove` **cannot** be called before mount; it logs a warning and is a no-op.
- If `options` changes after mount, the current timeline is **reverted** and recreated. All registered `add`/`set` calls are replayed automatically on the new timeline.
- On component **unmount**, the watcher and timeline are cleaned up automatically.

::: tip
`add` returns a `TimelineChain` object so you can chain multiple `.add()` and `.set()` calls fluently:

```ts
const { add } = useTimeline()
add(box1, { translateX: 100, duration: 400 })
  .add(box2, { translateY: 100, duration: 400 })
  .add(box3, { rotate: 360, duration: 400 })
```
:::

::: warning
`timeline` is a readonly shallow ref. Do not mutate the Anime.js instance directly — use the returned control methods instead.
:::

## Source

[`Github`](https://github.com/juleshry/vue-animejs/blob/main/src/composables/use-timeline.ts)