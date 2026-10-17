import { type MaybeRef, unref, watch, type WatchHandle } from "vue"
import { tryOnMounted } from "@vueuse/core"

/**
 * Calls `build` with the options once the component has mounted, then again whenever they change:
 * the target-less counterpart of `watchTarget`, for composables like `useTimer` and `useTimeline`.
 *
 * Nothing is built before mount: `tryOnMounted` never runs on the server, and a change made
 * between `setup()` and mount is picked up by the mount-time build instead.
 *
 * The options are watched one level deep, so mutating a property in place (`options.value.loop = true`)
 * rebuilds too.
 *
 * @param options - The composable's options, as passed to the composable.
 * @param build - Creates the Anime.js instance. Never called twice in a row with the same options object, unless it was mutated in between.
 * @returns The watcher's handle, to stop it on unmount.
 */
export function watchOptions<O>(options: MaybeRef<O>, build: (opt: O) => void): WatchHandle {
  let is_mounted = false
  // Guards against tryOnMounted and the mount-time watch tick both building from the same options.
  let last_built_from: O | undefined

  function buildOnce(opt: O) {
    if (opt === last_built_from) return
    last_built_from = opt
    build(opt)
  }

  tryOnMounted(() => {
    is_mounted = true
    buildOnce(unref(options))
  })

  return watch(
    () => unref(options),
    (new_options, old_options) => {
      if (!is_mounted) return
      // Same object as before: it was mutated in place, so it's not what was last built from
      if (new_options === old_options) last_built_from = undefined
      buildOnce(new_options)
    },
    { flush: "post", deep: 1 }
  )
}