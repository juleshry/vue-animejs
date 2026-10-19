import { computed, isRef, type MaybeRefOrGetter, watch, type WatchHandle } from "vue"
import { tryOnMounted } from "@vueuse/core"
import { type TargetsParam } from "animejs"
import { type AnimationTargets, resolveTarget } from "./resolve-target.ts"
import { type MaybeRefOptions, resolveOptions } from "./resolve-options.ts"

/**
 * Calls `build` with the resolved target and options once the component has mounted, then again
 * whenever either of them changes.
 *
 * The first build is never done in `setup()`: during hydration the server HTML is already in the
 * document there, and Vue hasn't hydrated it yet, so writing to it causes mismatches. And on a plain
 * client mount, a selector pointing into the component's own template doesn't match anything yet.
 * `tryOnMounted` never runs on the server, so nothing is built there either.
 *
 * A ref, getter or array of refs that is still empty at mount (e.g. behind a `v-if`) isn't ready
 * yet: `build` is skipped instead of being called with `undefined`, and the watcher builds once it
 * resolves.
 *
 * The options are read through `resolveOptions`: a ref or getter for the whole object, refs as its
 * direct properties, and in-place mutation of a reactive options object all trigger a rebuild.
 *
 * @param target - The raw target, as passed to the composable.
 * @param options - The composable's options, as passed to the composable.
 * @param build - Creates the Anime.js instance. Never called twice in a row with the same target and options.
 * @returns The watcher's handle, to stop it on unmount.
 */
export function watchTarget<O>(
  target: AnimationTargets,
  options: MaybeRefOrGetter<MaybeRefOptions<O>>,
  build: (el: TargetsParam, opt: O) => void
): WatchHandle {
  // Guards against tryOnMounted and the mount-time watch tick both building from the same inputs.
  let last_built_from: [TargetsParam, O] | undefined

  function buildOnce(el: TargetsParam, opt: O) {
    if (last_built_from && isSameTarget(last_built_from[0], el) && last_built_from[1] === opt) return
    last_built_from = [el, opt]
    build(el, opt)
  }

  // resolveOptions returns a new object on every read: the computed caches it, so the mount-time build
  // and the watcher's mount tick see the same object and buildOnce can dedupe them
  const resolved_options = computed(() => resolveOptions(options))

  tryOnMounted(() => {
    const el = resolveTarget(target)
    if (el == null && isReactiveTarget(target)) return
    buildOnce(el, resolved_options.value)
  })

  return watch([() => resolveTarget(target), resolved_options], ([el, opt]) => buildOnce(el, opt), {
    flush: "post",
  })
}

// An array of refs resolves to a new array on every read, so compare it item by item
function isSameTarget(a: TargetsParam, b: TargetsParam): boolean {
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((item, i) => item === b[i])
  return a === b
}

function isReactiveTarget(target: AnimationTargets): boolean {
  return isRef(target) || typeof target === "function" || Array.isArray(target)
}