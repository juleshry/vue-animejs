# useTimer

## Demo

<UseTimerDemo />

Wraps Anime.js [`createTimer()`](https://animejs.com/documentation/timer) into a Vue composable. The timer is created reactively — it re-creates whenever the options change — and is cancelled automatically on unmount.

## Usage

### Basic timer

```vue
<script setup lang="ts">
import { ref } from "vue"
import { useTimer } from "vue-animejs"

const elapsed = ref(0)

const { play, pause, restart } = useTimer({
  duration: 2000,
  autoplay: false,
  onUpdate: (timer) => {
    elapsed.value = Math.round(timer.currentTime)
  },
})
</script>

<template>
  <p>{{ elapsed }} ms</p>
  <button @click="play">Play</button>
  <button @click="pause">Pause</button>
  <button @click="restart">Restart</button>
</template>
```

### Reactive options

Pass a `ref` or `computed` as the argument.

::: warning
Changing options cancels the current timer and recreates it with the new parameters.
:::

```vue
<script setup lang="ts">
import { ref, computed } from "vue"
import { useTimer } from "vue-animejs"

const duration = ref(2000)
const count = ref(0)

const options = computed(() => ({
  duration: duration.value,
  loop: true,
  onComplete: () => {
    count.value++
  },
}))

const { play } = useTimer(options)
</script>

<template>
  <p>Loops completed: {{ count }}</p>
  <label>
    Duration
    <input v-model.number="duration" type="range" min="500" max="5000" step="500" />
    {{ duration }} ms
  </label>
  <button @click="play">Play</button>
</template>
```

## Type Declarations

::: details Show Type Declarations

```ts
export interface UseTimerReturn {
  /** The underlying Anime.js timer instance. */
  timer: DeepReadonly<ShallowRef<Timer>>
  /** Starts or resumes the timer. */
  play: () => Timer
  /** Reverses playback direction. */
  reverse: () => Timer
  /** Pauses the timer at the current position. */
  pause: () => Timer
  /** Restarts the timer from the beginning. */
  restart: () => Timer
  /** Toggles between forward and reverse direction. */
  alternate: () => Timer
  /** Resumes from a paused state. */
  resume: () => Timer
  /** Jumps immediately to the end of the timer. */
  complete: () => Timer
  /** Resets the timer to its initial state. Pass `true` for a soft reset that preserves the current cycle. */
  reset: (softReset?: boolean) => Timer
  /** Stops the timer and removes it from the Anime.js engine. */
  cancel: () => Timer
  /** Cancels the timer and restores its state. */
  revert: () => Timer
  /** Seeks to a specific time (in ms). */
  seek: (time: number, muteCallbacks?: boolean | number, internalRender?: boolean | number) => Timer
  /** Rescales the timer to a new total duration. */
  stretch: (newDuration: number) => Timer
}

/**
 * Wraps Anime.js `createTimer()` into a Vue composable. Reactively re-creates the timer when options change, and cancels it automatically on unmount.
 *
 * @param options - Anime.js timer parameters. Accepts a plain object or a reactive ref / computed. Defaults to `{}`.
 */
export declare function useTimer(options?: MaybeRef<TimerParams>): UseTimerReturn
```

:::

## Reactivity Behavior

- The timer is created **immediately** when `useTimer` is called.
- If `options` changes, the current timer is **cancelled** and a new one is created with the new parameters.
- On component **unmount**, the watcher and timer are cleaned up automatically.

::: tip
Use `onUpdate` inside the options object to pull values out of the timer (e.g. `timer.currentTime`, `timer.progress`) into reactive refs that your template can display.
:::

::: warning
`timer` is a readonly shallow ref. Do not mutate the Anime.js instance directly — use the returned control methods instead.
:::

## Source

[`Github`](https://github.com/juleshry/vue-animejs/blob/main/src/composables/use-timer.ts)