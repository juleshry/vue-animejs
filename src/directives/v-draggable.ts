import { createDraggable, type Draggable, type DraggableParams } from "animejs"
import type { Directive } from "vue"
import { deferMount } from "@src/utils/deferred-mount.ts"
import { isSameBinding } from "@src/utils/same-binding.ts"

const instances = new WeakMap<HTMLElement, Draggable>()

const deferred = deferMount<HTMLElement, DraggableParams | undefined>((el, binding) => {
  instances.set(el, createDraggable(el, binding.value ?? {}))
})

/**
 * Declarative draggable directive. Makes the element draggable on mount (once the mount flush has
 * finished, so components' own `onMounted` hooks still see the rendered DOM), re-creates it when the
 * binding value changes, and reverts it on unmount.
 *
 * @example
 * <div v-draggable />
 * <div v-draggable="{ snap: [0, 100] }" />
 */
export const vDraggable: Directive<HTMLElement, DraggableParams | undefined> = {
  mounted: deferred.mounted,
  updated(el, binding, vnode) {
    if (isSameBinding(binding.value, binding.oldValue)) return
    if (deferred.reschedule(el, binding, vnode)) return
    instances.get(el)?.revert()
    instances.set(el, createDraggable(el, binding.value ?? {}))
  },
  unmounted(el) {
    deferred.cancel(el)
    instances.get(el)?.revert()
    instances.delete(el)
  },
}