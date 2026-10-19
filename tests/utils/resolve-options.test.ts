import { describe, it, expect, expectTypeOf, vi } from "vite-plus/test"
import { computed, defineComponent, h, reactive, ref, watchEffect, type ComponentPublicInstance } from "vue"
import { mount } from "@vue/test-utils"
import { type DraggableParams } from "animejs"
import { type MaybeRefOptions } from "@src/utils/resolve-options.ts"
import { resolveOptions } from "@src/utils/resolve-options.ts"
import { isPlainObject } from "@src/utils/is-plain-object.ts"

describe("resolveOptions", () => {
  it("returns a plain object as a new object with the same values", () => {
    const options = { translateX: 250, duration: 800 }
    const resolved = resolveOptions(options)
    expect(resolved).toEqual(options)
    expect(resolved).not.toBe(options)
  })

  it("reads a ref, a computed or a getter for the whole object", () => {
    expect(resolveOptions(ref({ loop: true }))).toEqual({ loop: true })
    expect(resolveOptions(computed(() => ({ loop: true })))).toEqual({ loop: true })
    expect(resolveOptions(() => ({ loop: true }))).toEqual({ loop: true })
  })

  it("unwraps refs found in direct properties", () => {
    const distance = ref(250)
    expect(resolveOptions({ translateX: distance, opacity: computed(() => 0.5) })).toEqual({
      translateX: 250,
      opacity: 0.5,
    })
  })

  it("gives undefined for a ref holding null (an empty template ref), but keeps a plain null", () => {
    expect(resolveOptions<{ container?: unknown }>({ container: ref(null) })).toEqual({ container: undefined })
    expect(resolveOptions<{ container?: unknown }>({ container: null })).toEqual({ container: null })
  })

  it("unwraps one level only: refs inside nested objects and arrays are left alone", () => {
    const to = ref(250)
    const resolved = resolveOptions<{ translateX: { to: unknown }; keyframes: unknown[] }>({
      translateX: { to },
      keyframes: [to],
    })
    expect(resolved.translateX.to).toBe(to)
    expect(resolved.keyframes[0]).toBe(to)
  })

  it("leaves function values untouched, since Anime.js gives them a meaning", () => {
    const value = () => 250
    const onComplete = vi.fn()
    const resolved = resolveOptions({ translateX: value, onComplete })
    expect(resolved.translateX).toBe(value)
    expect(resolved.onComplete).toBe(onComplete)
  })

  it("passes non-plain values in properties through as-is", () => {
    class Observer {}
    const el = document.createElement("div")
    const observer = new Observer()
    const resolved = resolveOptions({ container: el, autoplay: observer })
    expect(resolved.container).toBe(el)
    expect(resolved.autoplay).toBe(observer)
  })

  it("returns anything that isn't a plain object as-is", () => {
    const el = document.createElement("div")
    expect(resolveOptions<undefined>(undefined)).toBeUndefined()
    expect(resolveOptions(el as never)).toBe(el)
  })

  it("reads a reactive() object into a plain one", () => {
    const options = reactive({ loop: false, duration: ref(400) })
    const resolved = resolveOptions(options)
    expect(resolved).toEqual({ loop: false, duration: 400 })
    expect(isPlainObject(resolved)).toBe(true)
  })

  it("tracks the whole object, its direct properties and the refs it unwraps", () => {
    const distance = ref(0)
    const options = ref<Record<string, unknown>>({ translateX: distance })
    const run = vi.fn(() => resolveOptions(options))
    watchEffect(run, { flush: "sync" })
    expect(run).toHaveBeenCalledTimes(1)

    distance.value = 1
    expect(run).toHaveBeenCalledTimes(2)

    options.value.duration = 400
    expect(run).toHaveBeenCalledTimes(3)

    options.value = { translateX: 2 }
    expect(run).toHaveBeenCalledTimes(4)
  })

  it("resolves a ref holding a component instance to the component's root element", () => {
    const instance = mount(defineComponent({ setup: () => () => h("section") })).vm
    const resolved = resolveOptions<{ container?: unknown }>({ container: ref(instance) })
    expect(resolved.container).toBeInstanceOf(HTMLElement)
    expect(resolved.container).toBe(instance.$el)
  })

  it("leaves a component instance that isn't in a ref as-is", () => {
    const instance = mount(defineComponent({ setup: () => () => h("div") })).vm
    expect(resolveOptions<{ container?: unknown }>({ container: instance }).container).toBe(instance)
  })

  it("accepts a component ref only for options that accept an element", () => {
    expectTypeOf(ref<ComponentPublicInstance | null>(null)).toExtend<MaybeRefOptions<DraggableParams>["container"]>()
    expectTypeOf(ref<ComponentPublicInstance | null>(null)).not.toExtend<
      MaybeRefOptions<DraggableParams>["releaseMass"]
    >()
  })
})