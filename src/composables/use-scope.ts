import { tryOnMounted, tryOnUnmounted } from "@vueuse/core"
import { createScope, type Scope, type ScopeMethod, type ScopeParams, type Tickable } from "animejs"
import {
  type DeepReadonly,
  isRef,
  type MaybeRef,
  shallowReadonly,
  type ShallowRef,
  shallowRef,
  unref,
  watch,
} from "vue"

export interface UseScopeReturn {
  /** The underlying Anime.js `Scope` instance. */
  scope: DeepReadonly<ShallowRef<Scope>>
  /** Registers an anonymous method on the scope. Queued automatically if called before mount. */
  add: (method: ScopeMethod) => void
  /** Registers a named method on the scope so it can be called via `scope.methods[name]()`. Queued automatically if called before mount. */
  registerMethod: (methodName: string, method: ScopeMethod) => void
  /** Registers a method that runs exactly once on the scope. Queued automatically if called before mount. */
  addOnce: (method: ScopeMethod) => void
  /** Keeps the time of another tickable (animation, timer) in sync with this scope. */
  keepTime: (method: (scope: Scope) => Tickable) => void
  /** Cancels the scope and reverts all animations and tickables it owns. */
  revert: () => void
  /** Re-reads default values and media-query breakpoints for the scope. */
  refresh: () => void
}

/**
 * Wraps Anime.js `createScope()` into a Vue composable. Reactively re-creates the scope when params change, replays all registered methods, and reverts it automatically on unmount.
 *
 * Methods added before mount are queued and replayed once the component is mounted.
 *
 * @param params - Anime.js scope parameters. Accepts a plain object or a reactive ref / computed.
 */
export function useScope(params: MaybeRef<ScopeParams>): UseScopeReturn {
  const scope = shallowRef(createScope(unref(params)))

  const pending_adds: ScopeMethod[] = []
  const pending_named: [string, ScopeMethod][] = []
  const pending_once: ScopeMethod[] = []

  let is_mounted = false

  const stopWatcher = isRef(params)
    ? watch(
        params,
        new_params => {
          scope.value.revert()
          scope.value = createScope(new_params)
        },
        { flush: "post" }
      )
    : undefined

  tryOnMounted(() => {
    is_mounted = true

    for (const method of pending_adds) scope.value.add(method)
    for (const [name, method] of pending_named) scope.value.add(name, method)
    for (const method of pending_once) scope.value.addOnce(method)

    pending_adds.length = 0
    pending_named.length = 0
    pending_once.length = 0
  })

  tryOnUnmounted(() => {
    scope.value.revert()
    stopWatcher?.()
  })

  function add(method: ScopeMethod) {
    if (!is_mounted) return void pending_adds.push(method)
    return scope.value.add(method)
  }

  function registerMethod(methodName: string, method: ScopeMethod) {
    if (!is_mounted) return void pending_named.push([methodName, method])
    return scope.value.add(methodName, method)
  }

  function addOnce(method: ScopeMethod) {
    if (!is_mounted) return void pending_once.push(method)
    return scope.value.addOnce(method)
  }

  function keepTime(method: (scope: Scope) => Tickable) {
    return scope.value.keepTime(method)
  }

  function revert() {
    return scope.value.revert()
  }

  function refresh() {
    return scope.value.refresh()
  }

  return {
    scope: shallowReadonly(scope),
    add,
    registerMethod,
    addOnce,
    keepTime,
    revert,
    refresh,
  }
}