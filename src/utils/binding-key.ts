const binding_key = Symbol("binding key")

/**
 * Gives a function the value `isSameBinding` compares it by, instead of its source. For a helper
 * whose result is a closure over its arguments (like our `stagger()`): every call has the same
 * source, so only the arguments tell two of them apart.
 *
 * @param fn - The function the helper returns.
 * @param key - What to compare it by, usually the helper's arguments.
 */
export function setBindingKey(fn: object, key: unknown): void {
  Object.defineProperty(fn, binding_key, { value: key })
}

/**
 * Whether `value` is a function with a binding key, and that key. A key may be `undefined`, so
 * this returns a tuple rather than the key alone.
 *
 * @param value - Any value.
 */
export function getBindingKey(value: unknown): [key: unknown] | undefined {
  if (typeof value !== "function" || !(binding_key in value)) return undefined
  return [(value as { [binding_key]: unknown })[binding_key]]
}