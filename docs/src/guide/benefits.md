# Why vue-animejs?

Anime.js is a powerful animation library, but using it raw inside Vue components leads to repetitive, error-prone boilerplate. vue-animejs removes that boilerplate by wiring Anime.js directly into Vue's reactivity system and component lifecycle.

## Lifecycle cleanup

Animations started in `onMounted` must be stopped in `onUnmounted`, otherwise the instance keeps running and leaking memory after the component is destroyed.

::: code-group

```vue [Without vue-animejs]
<script setup lang="ts">
  import { onMounted, onUnmounted, useTemplateRef } from "vue"
  import anime from "animejs"

  const box = useTemplateRef("box")
  let animation: ReturnType<typeof anime.animate> | null = null

  onMounted(() => {
    animation = anime.animate(box.value, {
      translateX: 200,
      duration: 800,
      loop: true,
    })
  })

  // Easy to forget — and a memory leak if you do
  onUnmounted(() => {
    animation?.pause()
    animation?.remove(box.value)
  })
</script>

<template>
  <div ref="box" class="box" />
</template>
```

```vue [With vue-animejs]
<script setup lang="ts">
  import { useTemplateRef } from "vue"
  import { useAnimate } from "@juleshry/vue-animejs"

  const box = useTemplateRef("box")

  // Cleanup is automatic — no onMounted, no onUnmounted
  useAnimate(box, {
    translateX: 200,
    duration: 800,
    loop: true,
  })
</script>

<template>
  <div ref="box" class="box" />
</template>
```

:::

## Reactive options

Updating an animation when reactive state changes requires manually restarting the instance. With vue-animejs, any `Ref` or getter passed as an option is watched automatically.

::: code-group

```vue [Without vue-animejs]
<script setup lang="ts">
  import { ref, watch, onMounted, onUnmounted, useTemplateRef } from "vue"
  import anime from "animejs"

  const box = useTemplateRef("box")
  const duration = ref(800)
  let animation: ReturnType<typeof anime.animate> | null = null

  function createAnimation() {
    animation?.pause()
    animation?.remove(box.value)
    if (!box.value) return
    animation = anime.animate(box.value, {
      translateX: 200,
      duration: duration.value, // raw value — won't update on its own
    })
  }

  onMounted(createAnimation)
  watch(duration, createAnimation) // manually reconnect each time
  onUnmounted(() => {
    animation?.pause()
    animation?.remove(box.value)
  })
</script>

<template>
  <input v-model.number="duration" type="range" min="200" max="2000" />
  <div ref="box" class="box" />
</template>
```

```vue [With vue-animejs]
<script setup lang="ts">
  import { ref, useTemplateRef } from "vue"
  import { useAnimate } from "@juleshry/vue-animejs"

  const box = useTemplateRef("box")
  const duration = ref(800)

  // Pass the ref directly — animation restarts whenever duration changes
  useAnimate(box, { translateX: 200, duration })
</script>

<template>
  <input v-model.number="duration" type="range" min="200" max="2000" />
  <div ref="box" class="box" />
</template>
```

:::

## Playback controls

Controlling an animation (play, pause, restart, seek) requires holding a reference to the Anime.js instance and calling methods on it imperatively.

::: code-group

```vue [Without vue-animejs]
<script setup lang="ts">
  import { onMounted, onUnmounted, useTemplateRef } from "vue"
  import anime from "animejs"

  const box = useTemplateRef("box")
  let animation: ReturnType<typeof anime.animate> | null = null

  onMounted(() => {
    animation = anime.animate(box.value, {
      translateX: 200,
      duration: 800,
      autoplay: false,
    })
  })

  onUnmounted(() => {
    animation?.pause()
    animation?.remove(box.value)
  })
</script>

<template>
  <div ref="box" class="box" />
  <button @click="animation?.play()">Play</button>
  <button @click="animation?.pause()">Pause</button>
  <button @click="animation?.restart()">Restart</button>
</template>
```

```vue [With vue-animejs]
<script setup lang="ts">
  import { useTemplateRef } from "vue"
  import { useAnimate } from "@juleshry/vue-animejs"

  const box = useTemplateRef("box")

  const { play, pause, restart } = useAnimate(box, {
    translateX: 200,
    duration: 800,
    autoplay: false,
  })
</script>

<template>
  <div ref="box" class="box" />
  <button @click="play">Play</button>
  <button @click="pause">Pause</button>
  <button @click="restart">Restart</button>
</template>
```

:::