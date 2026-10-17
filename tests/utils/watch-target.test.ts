import { describe, it, expect, vi } from "vite-plus/test"
import { defineComponent, h, nextTick, ref, useTemplateRef } from "vue"
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
})