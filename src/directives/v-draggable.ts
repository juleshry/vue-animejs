import { createDraggable, type Draggable, type DraggableParams } from "animejs"
import type { Directive } from "vue"

const instances = new WeakMap<HTMLElement, Draggable>()

/**
 * Declarative draggable directive. Makes the element draggable on mount,
 * re-creates it when the binding value changes, and reverts it on unmount.
 *
 * @example
 * <div v-draggable />
 * <div v-draggable="{ snap: [0, 100] }" />
 */
export const vDraggable: Directive<HTMLElement, DraggableParams | undefined> = {
  mounted(el, binding) {
    instances.set(el, createDraggable(el, binding.value ?? {}))
  },
  updated(el, binding) {
    if (binding.value === binding.oldValue) return
    instances.get(el)?.revert()
    instances.set(el, createDraggable(el, binding.value ?? {}))
  },
  unmounted(el) {
    instances.get(el)?.revert()
    instances.delete(el)
  },
}