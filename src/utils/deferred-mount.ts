import { nextTick, type DirectiveBinding, type VNode } from "vue"

type MountHook<E extends Element, V> = (el: E, binding: DirectiveBinding<V>, vnode: VNode) => void

/** A directive's first mount, deferred until the current flush has finished. */
export interface DeferredMount<E extends Element, V> {
  /** The directive's `mounted` hook: schedules the mount for the end of the current flush. */
  mounted: MountHook<E, V>
  /**
   * If `el` hasn't mounted yet, makes the pending mount use this binding instead and returns `true`.
   * Call it first in `updated`: the instance doesn't exist yet, so there is nothing to clean up.
   */
  reschedule: (el: E, binding: DirectiveBinding<V>, vnode: VNode) => boolean
  /** Drops `el`'s pending mount, if any. Call it first in `unmounted`. */
  cancel: (el: E) => void
}

/**
 * Defers a directive's `mounted` work until the current flush has finished.
 *
 * During hydration, an element's directive `mounted` runs before the `onMounted` of the components
 * whose root that element is. Anything written to the DOM there (the SSR strip, the first frame of an
 * animation) lands before those components' own `onMounted`, and looks like a hydration mismatch to
 * tools that compare `outerHTML` between `setup()` and `onMounted` (e.g. @nuxt/hints). `nextTick`
 * resolves once every `onMounted` of the flush has run, and still before the browser paints.
 *
 * Call it once per directive, at module level: one element can carry several directives.
 *
 * @param mount - What the directive does on mount, run with the latest binding.
 */
export function deferMount<E extends Element, V>(mount: MountHook<E, V>): DeferredMount<E, V> {
  const pending = new WeakMap<E, [DirectiveBinding<V>, VNode]>()

  return {
    mounted(el, binding, vnode) {
      pending.set(el, [binding, vnode])
      void nextTick(() => {
        const args = pending.get(el)
        if (!args) return // unmounted first
        pending.delete(el)
        mount(el, ...args)
      })
    },
    reschedule(el, binding, vnode) {
      if (!pending.has(el)) return false
      pending.set(el, [binding, vnode])
      return true
    },
    cancel(el) {
      pending.delete(el)
    },
  }
}