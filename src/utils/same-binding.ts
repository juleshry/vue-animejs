import { isPlainObject } from "./is-plain-object.ts"

/**
 * Whether two directive binding values describe the same animation, so `updated` can skip the
 * rebuild. An inline binding (`v-animate="{ translateX: 250 }"`) is a new object on every render
 * of the parent, so comparing references would restart the animation on every unrelated re-render.
 *
 * Plain objects and arrays are compared key by key, primitives with `Object.is`. Functions are equal
 * when their source matches: an inline `stagger(60)` or arrow callback is a new closure on every
 * render, but the same code. The trade-off is that only changing a closure's captured values
 * (`stagger(60)` → `stagger(100)`) doesn't count as a change. Anything else (elements, class
 * instances) is compared by reference.
 *
 * @param a - The new binding value.
 * @param b - The previous binding value.
 */
export function isSameBinding(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (typeof a === "function" && typeof b === "function") return a.toString() === b.toString()

  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, i) => isSameBinding(item, b[i]))
  }

  if (isPlainObject(a) && isPlainObject(b)) {
    const keys = Object.keys(a)
    return keys.length === Object.keys(b).length && keys.every(key => key in b && isSameBinding(a[key], b[key]))
  }

  return false
}