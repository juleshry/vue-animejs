import { tryOnUnmounted } from "@vueuse/core"
import { watchOptions } from "@src/utils/watch-options.ts"
import { createScope, type Scope, type ScopeMethod, type ScopeParams, type Tickable } from "animejs"
import { markRaw, type MaybeRefOrGetter, shallowReadonly, type ShallowRef, shallowRef } from "vue"
import { type MaybeRefOptions } from "@src/utils/resolve-options.ts"

export interface UseScopeReturn {
  /** The underlying Anime.js `Scope` instance. */
  scope: Readonly<ShallowRef<Scope | undefined>>
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
 * Methods added before mount are queued and replayed once the component is mounted. When `params` change, every
 * method registered so far is replayed on the new scope.
 *
 * @param params - Anime.js scope parameters. Accepts a plain object, a ref / computed / getter, and refs as direct properties.
 */
export function useScope(params: MaybeRefOrGetter<MaybeRefOptions<ScopeParams>>): UseScopeReturn {
  const scope = shallowRef<Scope | undefined>(undefined)

  // Every registration, in order, so a scope re-created from new params gets them all back
  const registrations: ((scope: Scope) => void)[] = []

  const { stop } = watchOptions(params, scope_params => {
    scope.value?.revert()
    scope.value = markRaw(createScope(scope_params))
    for (const apply of registrations) apply(scope.value)
  })

  tryOnUnmounted(() => {
    stop()
    scope.value?.revert()
  })

  function register(apply: (scope: Scope) => void) {
    registrations.push(apply)
    if (scope.value) apply(scope.value)
  }

  function add(method: ScopeMethod) {
    register(s => s.add(method))
  }

  function registerMethod(methodName: string, method: ScopeMethod) {
    register(s => s.add(methodName, method))
  }

  function addOnce(method: ScopeMethod) {
    register(s => s.addOnce(method))
  }

  function keepTime(method: (scope: Scope) => Tickable) {
    return scope.value?.keepTime(method)
  }

  function revert() {
    return scope.value?.revert()
  }

  function refresh() {
    return scope.value?.refresh()
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