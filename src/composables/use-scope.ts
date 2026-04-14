import { tryOnUnmounted } from "@vueuse/core"
import { createScope, type Scope, type ScopeMethod, type ScopeParams, type Tickable } from "animejs"
import { isRef, type MaybeRef, shallowReadonly, type ShallowRef, shallowRef, unref, watch } from "vue"

export interface UseScopeReturn {
  scope: Readonly<ShallowRef<Scope | undefined>>
  add: (method: ScopeMethod) => void
  registerMethod: (method_name: string, method: ScopeMethod) => void
  addOnce: (method: ScopeMethod) => void
  keepTime: (method: (scope: Scope) => Tickable) => void
  revert: () => void
  refresh: () => void
}

export function useScope(params: MaybeRef<ScopeParams>): UseScopeReturn {
  const scope = shallowRef<Scope | undefined>()

  const { stop } = watch(
    () => unref(params),
    _params => {
      revert()
      scope.value = createScope(_params)
    },
    { flush: "post", immediate: !isRef(params) }
  )

  tryOnUnmounted(() => {
    revert()
    scope.value = undefined

    stop()
  })

  function add(method: ScopeMethod) {
    return scope.value?.add(method)
  }

  function registerMethod(method_name: string, method: ScopeMethod) {
    return scope.value?.add(method_name, method)
  }

  function addOnce(method: ScopeMethod) {
    return scope.value?.addOnce(method)
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
