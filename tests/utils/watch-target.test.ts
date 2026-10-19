import { describe, it, expect, vi } from "vite-plus/test"
import { defineComponent, h, nextTick, onMounted, reactive, ref, useTemplateRef } from "vue"
import { mount } from "@vue/test-utils"
import { watchTarget } from "@src/utils/watch-target.ts"
import { mountWithTarget, type TargetForm, withSetup } from "../utils"

const forms: TargetForm[] = ["selector", "template ref", "array of template refs"]

describe("watchTarget", () => {
  it.each(forms)("builds exactly once on mount from the component's own template (%s)", async form => {
    const build = vi.fn()
    let found: Element | null = null
    build.mockImplementation(() => (found = document.querySelector("#t")))
    const wrapper = mountWithTarget(form, target => watchTarget(target, {}, build))
    await nextTick()
    expect(build).toHaveBeenCalledOnce()
    expect(found).not.toBeNull()
    wrapper.unmount()
  })

  it("does not build during setup()", () => {
    const build = vi.fn()
    let built_in_setup = true
    mount(
      defineComponent({
        setup() {
          watchTarget(document.createElement("div"), {}, build)
          built_in_setup = build.mock.calls.length > 0
          return () => h("div")
        },
      })
    )
    expect(built_in_setup).toBe(false)
    expect(build).toHaveBeenCalledOnce()
  })

  it("waits for a template ref that is still empty at mount, without building with undefined", async () => {
    const build = vi.fn()
    const show = ref(false)
    mount(
      defineComponent({
        setup() {
          watchTarget(useTemplateRef<HTMLElement>("t"), {}, build)
          return () => h("div", show.value ? [h("span", { ref: "t" })] : [])
        },
      })
    )
    await nextTick()
    expect(build).not.toHaveBeenCalled()

    show.value = true
    await nextTick()
    expect(build).toHaveBeenCalledOnce()
    expect(build.mock.calls[0][0]).toBeInstanceOf(HTMLSpanElement)
  })

  it("waits for an array of refs that is all empty at mount", async () => {
    const build = vi.fn()
    const a = ref<HTMLElement | null>(null)
    withSetup(() => watchTarget([a], {}, build))
    await nextTick()
    expect(build).not.toHaveBeenCalled()

    const el = document.createElement("div")
    a.value = el
    await nextTick()
    expect(build).toHaveBeenCalledWith([el], {})
  })

  it("builds with a static null target on mount, so the composable can warn about it", async () => {
    const build = vi.fn()
    // oxlint-disable-next-line typescript/no-explicit-any
    withSetup(() => watchTarget(null as any, {}, build))
    expect(build).toHaveBeenCalledWith(null, {})
  })

  it("rebuilds when the options change, and when the target goes away", async () => {
    const build = vi.fn()
    const el = document.createElement("div")
    const target = ref<HTMLElement | null>(el)
    const options = ref({ opacity: 0 })
    withSetup(() => watchTarget(target, options, build))
    await nextTick()
    expect(build).toHaveBeenCalledOnce()

    options.value = { opacity: 1 }
    await nextTick()
    expect(build).toHaveBeenLastCalledWith(el, { opacity: 1 })

    target.value = null
    await nextTick()
    expect(build).toHaveBeenLastCalledWith(null, { opacity: 1 })
    expect(build).toHaveBeenCalledTimes(3)
  })

  it("stops rebuilding once stopped", async () => {
    const build = vi.fn()
    const options = ref({ opacity: 0 })
    const [handle] = withSetup(() => watchTarget(document.createElement("div"), options, build))
    handle.stop()
    options.value = { opacity: 1 }
    await nextTick()
    expect(build).toHaveBeenCalledOnce()
  })

  it("rebuilds exactly once when a ref inside the options changes", async () => {
    const build = vi.fn()
    const el = document.createElement("div")
    const distance = ref(0)
    withSetup(() => watchTarget(el, { translateX: distance, duration: 800 }, build))
    await nextTick()
    expect(build).toHaveBeenCalledOnce()
    expect(build).toHaveBeenLastCalledWith(el, { translateX: 0, duration: 800 })

    distance.value = 250
    await nextTick()
    expect(build).toHaveBeenCalledTimes(2)
    expect(build).toHaveBeenLastCalledWith(el, { translateX: 250, duration: 800 })
  })

  it.each(forms)("builds exactly once on mount with refs inside the options (%s)", async form => {
    const build = vi.fn()
    const distance = ref(0)
    const wrapper = mountWithTarget(form, target => watchTarget(target, { translateX: distance }, build))
    await nextTick()
    expect(build).toHaveBeenCalledOnce()
    wrapper.unmount()
  })

  it("rebuilds when the options object is mutated in place", async () => {
    const build = vi.fn()
    const options = ref<{ opacity: number; duration?: number }>({ opacity: 0 })
    withSetup(() => watchTarget(document.createElement("div"), options, build))
    options.value.duration = 400
    await nextTick()
    expect(build).toHaveBeenCalledTimes(2)
    expect(build.mock.lastCall?.[1]).toEqual({ opacity: 0, duration: 400 })
  })

  it("rebuilds when a reactive() options object is mutated in place", async () => {
    const build = vi.fn()
    const options = reactive({ opacity: 0 })
    withSetup(() => watchTarget(document.createElement("div"), options, build))
    options.opacity = 1
    await nextTick()
    expect(build).toHaveBeenCalledTimes(2)
    expect(build.mock.lastCall?.[1]).toEqual({ opacity: 1 })
  })

  it("accepts a getter for the whole options object", async () => {
    const build = vi.fn()
    const distance = ref(0)
    withSetup(() => watchTarget(document.createElement("div"), () => ({ translateX: distance.value }), build))
    distance.value = 250
    await nextTick()
    expect(build).toHaveBeenCalledTimes(2)
    expect(build.mock.lastCall?.[1]).toEqual({ translateX: 250 })
  })

  it("picks up a change made before mount in the mount build, with no extra build", async () => {
    const build = vi.fn()
    const el = document.createElement("div")
    const distance = ref(0)
    mount(
      defineComponent({
        setup() {
          watchTarget(el, { translateX: distance }, build)
          distance.value = 250
          onMounted(() => expect(build).toHaveBeenCalledWith(el, { translateX: 250 }))
          return () => h("div")
        },
      })
    )
    await nextTick()
    expect(build).toHaveBeenCalledOnce()
    expect(build).toHaveBeenCalledWith(el, { translateX: 250 })
  })

  it("passes undefined options through unchanged", () => {
    const build = vi.fn()
    const el = document.createElement("div")
    withSetup(() => watchTarget<undefined>(el, undefined, build))
    expect(build).toHaveBeenCalledWith(el, undefined)
  })
})