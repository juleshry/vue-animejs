import { createAnimatable, type AnimatableObject, type AnimatablePropertyParamsOptions } from "animejs"
import type { Directive } from "vue"

export type VAnimatableValue = AnimatablePropertyParamsOptions & Record<string, number | number[]>

const OPTION_KEYS = new Set<string>(["duration", "ease", "modifier", "composition", "unit"])

const instances = new WeakMap<HTMLElement, AnimatableObject>()

function split_value(value: VAnimatableValue): {
  options: AnimatablePropertyParamsOptions
  props: Record<string, number | number[]>
} {
  const options: AnimatablePropertyParamsOptions = {}
  const props: Record<string, number | number[]> = {}

  for (const [key, val] of Object.entries(value)) {
    if (OPTION_KEYS.has(key)) {
      ;(options as Record<string, unknown>)[key] = val
    } else {
      props[key] = val as number | number[]
    }
  }

  return { options, props }
}

function apply_props(instance: AnimatableObject, props: Record<string, number | number[]>) {
  for (const [key, val] of Object.entries(props)) {
    const setter = instance[key]
    if (typeof setter === "function") setter(val)
  }
}

function options_changed(a: AnimatablePropertyParamsOptions, b: AnimatablePropertyParamsOptions): boolean {
  for (const key of OPTION_KEYS) {
    if ((a as Record<string, unknown>)[key] !== (b as Record<string, unknown>)[key]) return true
  }
  return false
}

/**
 * Declarative animatable directive. Creates an Anime.js animatable on mount and
 * animates properties directly from the binding value. Changing reactive properties
 * smoothly animates to the new values. Changing default options recreates the animatable.
 *
 * @example
 * <div v-animatable="{ x: 200, opacity: 0.5, duration: 600, ease: 'spring(1, 80, 10, 0)' }" />
 */
export const vAnimatable: Directive<HTMLElement, VAnimatableValue> = {
  mounted(el, binding) {
    const { props } = split_value(binding.value ?? {})
    // Pass the full value so createAnimatable registers property setters for each prop key
    const instance = createAnimatable(el, binding.value ?? {})
    instances.set(el, instance)
    apply_props(instance, props)
  },
  updated(el, binding) {
    if (binding.value === binding.oldValue) return

    const { options: new_options, props: new_props } = split_value(binding.value ?? {})
    const { options: old_options, props: old_props } = split_value(binding.oldValue ?? {})

    let instance = instances.get(el)!

    if (options_changed(new_options, old_options)) {
      instance.revert()
      instance = createAnimatable(el, binding.value ?? {})
      instances.set(el, instance)
      apply_props(instance, new_props)
      return
    }

    const changed_props: Record<string, number | number[]> = {}
    for (const [key, val] of Object.entries(new_props)) {
      if (val !== old_props[key]) changed_props[key] = val
    }
    apply_props(instance, changed_props)
  },
  unmounted(el) {
    instances.get(el)?.revert()
    instances.delete(el)
  },
}