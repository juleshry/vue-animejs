import { computed, type ComputedRef } from "vue"
import { isSameBinding } from "./same-binding.ts"

/**
 * A component's `options` prop, kept as the same object while its content is the same. An inline
 * `:options="{ ... }"` is a new object on every parent render, and the composable it's passed to would rebuild its
 * instance every time.
 *
 * @param options - Reads the prop, e.g. `() => props.options`. `undefined` gives `{}`.
 */
export function useStableOptions<T extends object>(options: () => T | undefined): ComputedRef<T> {
  return computed<T>(previous => {
    const next = options() ?? ({} as T)
    return previous && isSameBinding(next, previous) ? previous : next
  })
}