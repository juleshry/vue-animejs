import { type ComponentPublicInstance, isRef, type MaybeRef, type MaybeRefOrGetter, type Ref, toValue } from "vue"
import { type MaybeElementRef, unrefElement } from "@vueuse/core"
import { isPlainObject } from "./is-plain-object.ts"

/**
 * An options object whose direct properties may each be a ref. A ref may also hold `null`, like an
 * empty template ref, which counts as the option not being set. An option that accepts an element
 * (`container`, `root`, ...) also accepts a ref to a component, resolved to its root element.
 */
export type MaybeRefOptions<T> = { [K in keyof T]: MaybeRefOption<T[K]> }

/** One option of `MaybeRefOptions`: a value or a ref to it, plus a component ref where an element is accepted. */
type MaybeRefOption<V> =
  | MaybeRef<V>
  | Readonly<Ref<V | null>>
  | (HTMLElement extends V ? Readonly<Ref<ComponentPublicInstance | null>> : never)

/**
 * Reads the options (a plain object, a ref or a getter) and unwraps the refs found in its direct
 * properties, returning a new object. Called from a `computed` or a watcher, it tracks the options
 * themselves, every direct property (so mutating a `reactive()` object in place counts as a change)
 * and every ref it unwraps.
 *
 * Only refs are unwrapped, one level deep. A ref holding `null` (an empty template ref) gives
 * `undefined`, so Anime.js falls back to the option's default, and a ref holding a component instance
 * gives its root element (`$el`, through `unrefElement`, as for targets). Function-valued properties
 * are left alone, since Anime.js already gives them a meaning (function-based values, callbacks,
 * `ease`, `modifier`). Anything that isn't a plain object (`undefined`, an element, a class instance)
 * is returned as-is.
 *
 * @param options - The composable's options, as passed to the composable.
 */
export function resolveOptions<O>(options: MaybeRefOrGetter<MaybeRefOptions<O>>): O {
  const value: unknown = toValue(options)
  if (!isPlainObject(value)) return value as O
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, isRef(item) ? unrefOption(item) : item])
  ) as O
}

// An empty ref (e.g. a template ref before mount) gives undefined, so the option counts as unset
function unrefOption(item: Ref<unknown>): unknown {
  const value = isElementRef(item) ? unrefElement(item) : item.value
  return value ?? undefined
}

// A template ref to an element or a component: resolved like a target, so a component gives its `$el`
function isElementRef(item: Ref<unknown>): item is Ref<Element | ComponentPublicInstance> & MaybeElementRef {
  const value = item.value
  if (typeof Element !== "undefined" && value instanceof Element) return true
  return typeof value === "object" && value !== null && "$el" in value
}