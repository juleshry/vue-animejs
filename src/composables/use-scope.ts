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
  scope: DeepReadonly<ShallowRef<Scope>>
  add: (method: ScopeMethod) => void
  registerMethod: (methodName: string, method: ScopeMethod) => void
  addOnce: (method: ScopeMethod) => void
  keepTime: (method: (scope: Scope) => Tickable) => void
  revert: () => void
  refresh: () => void
}

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
