import { isPlainObject } from "./is-plain-object.ts"
import { getBindingKey } from "./binding-key.ts"

/**
 * Whether two directive binding values describe the same animation, so `updated` can skip the
 * rebuild. An inline binding (`v-animate="{ translateX: 250 }"`) is a new object on every render
 * of the parent, so comparing references would restart the animation on every unrelated re-render.
 *
 * Plain objects and arrays are compared key by key, primitives with `Object.is`. A function with a
 * binding key (`setBindingKey`, e.g. our `stagger()`, keyed on its arguments, a ref by reference)
 * is compared by that key. Other functions are equal when their source matches: an inline arrow
 * callback (or Anime.js's own `stagger()`) is a new closure on every render, but the same code.
 * The trade-off is that only changing such a closure's captured values doesn't count as a change.
 * Anything else (elements, class instances) is compared by reference.
 *
 * @param a - The new binding value.
 * @param b - The previous binding value.
 */
export function isSameBinding(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (typeof a === "function" && typeof b === "function") {
    const key_a = getBindingKey(a)
    const key_b = getBindingKey(b)
    if (key_a || key_b) return !!key_a && !!key_b && isSameBinding(key_a[0], key_b[0])
    return a.toString() === b.toString()
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, i) => isSameBinding(item, b[i]))
  }

  if (isPlainObject(a) && isPlainObject(b)) {
    const keys = Object.keys(a)
    return keys.length === Object.keys(b).length && keys.every(key => key in b && isSameBinding(a[key], b[key]))
  }

  return false
}