import { computed, type MaybeRefOrGetter, watch, type WatchHandle } from "vue"
import { tryOnMounted } from "@vueuse/core"
import { type MaybeRefOptions, resolveOptions } from "@src/utils/resolve-options.ts"

/**
 * Calls `build` with the options once the component has mounted, then again whenever they change:
 * the target-less counterpart of `watchTarget`, for composables like `useTimer` and `useTimeline`.
 *
 * Nothing is built before mount: `tryOnMounted` never runs on the server, and a change made
 * between `setup()` and mount is picked up by the mount-time build instead.
 *
 * The options are read through `resolveOptions`: a ref or getter for the whole object, refs as its
 * direct properties, and in-place mutation of a reactive options object (`options.value.loop = true`)
 * all trigger a rebuild.
 *
 * @param options - The composable's options, as passed to the composable.
 * @param build - Creates the Anime.js instance. Never called twice in a row for the same options.
 * @returns The watcher's handle, to stop it on unmount.
 */
export function watchOptions<O>(options: MaybeRefOrGetter<MaybeRefOptions<O>>, build: (opt: O) => void): WatchHandle {
  let is_mounted = false
  // Guards against tryOnMounted and the mount-time watch tick both building from the same options.
  let last_built_from: O | undefined

  function buildOnce(opt: O) {
    if (opt === last_built_from) return
    last_built_from = opt
    build(opt)
  }

  // resolveOptions returns a new object on every read: the computed caches it, so the mount-time build
  // and the watcher's mount tick see the same object and buildOnce can dedupe them
  const resolved_options = computed(() => resolveOptions(options))

  tryOnMounted(() => {
    is_mounted = true
    buildOnce(resolved_options.value)
  })

  return watch(
    resolved_options,
    opt => {
      if (!is_mounted) return
      buildOnce(opt)
    },
    { flush: "post" }
  )
}