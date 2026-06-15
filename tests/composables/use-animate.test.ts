import { describe, it, expect, vi, beforeEach } from "vitest"
import { defineComponent, h, nextTick, ref, type ComponentPublicInstance } from "vue"
import { mount } from "@vue/test-utils"
import { useAnimate } from "@lib"
import { withSetup } from "../utils"
import { makeAnimationMock } from "../mocks"
import { animate } from "animejs"

const mock_animate = vi.mocked(animate)

const mock_animation = makeAnimationMock()

vi.mock("animejs", () => ({
  animate: vi.fn(() => mock_animation),
}))

describe("useAnimate", () => {
  beforeEach(() => {
    mock_animate.mockClear()
    Object.values(mock_animation).forEach(fn => fn.mockClear())
    vi.spyOn(console, "warn").mockImplementation(() => {})
  })

  it("creates animation immediately for a non-ref target", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useAnimate(el, { opacity: [0, 1] }))
    await nextTick()
    expect(mock_animate).toHaveBeenCalledWith(el, { opacity: [0, 1] })
    expect(result.animation.value).toBeDefined()
  })

  it("does not create animation immediately when target is a ref", async () => {
    const el_ref = ref<HTMLElement | null>(null)
    withSetup(() => useAnimate(el_ref))
    await nextTick()
    expect(mock_animate).not.toHaveBeenCalled()
  })

  it("warns and leaves animation undefined when target is null", async () => {
    // oxlint-disable-next-line typescript/no-explicit-any
    const [result] = withSetup(() => useAnimate(null as any))
    await nextTick()
    expect(console.warn).toHaveBeenCalledWith("Target element is null or undefined")
    expect(result.animation.value).toBeUndefined()
  })

  it("control methods return undefined when animation is not set", () => {
    const el_ref = ref<HTMLElement | null>(null)
    const [result] = withSetup(() => useAnimate(el_ref))
    expect(result.play()).toBeUndefined()
    expect(result.pause()).toBeUndefined()
  })

  it("delegates play to the animation instance", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useAnimate(el))
    await nextTick()
    result.play()
    expect(mock_animation.play).toHaveBeenCalledOnce()
  })

  it("delegates pause to the animation instance", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useAnimate(el))
    await nextTick()
    result.pause()
    expect(mock_animation.pause).toHaveBeenCalledOnce()
  })

  it("delegates seek with args to the animation instance", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useAnimate(el))
    await nextTick()
    result.seek(500, true)
    expect(mock_animation.seek).toHaveBeenCalledWith(500, true, undefined)
  })

  it("cancels the animation on unmount", async () => {
    const el = document.createElement("div")
    const [, wrapper] = withSetup(() => useAnimate(el))
    await nextTick()
    mock_animation.cancel.mockClear()
    wrapper.unmount()
    expect(mock_animation.cancel).toHaveBeenCalled()
  })

  it("recreates animation when options ref changes", async () => {
    const el = document.createElement("div")
    const options = ref({ opacity: 0 })
    withSetup(() => useAnimate(el, options))
    await nextTick()
    mock_animate.mockClear()
    options.value = { opacity: 1 }
    await nextTick()
    expect(mock_animate).toHaveBeenCalledWith(el, { opacity: 1 })
  })

  it("reverts the animation before recreating on options change", async () => {
    const el = document.createElement("div")
    const options = ref({ opacity: 0 })
    withSetup(() => useAnimate(el, options))
    await nextTick()
    mock_animation.revert.mockClear()
    options.value = { opacity: 1 }
    await nextTick()
    expect(mock_animation.revert).toHaveBeenCalled()
  })

  it("recreates animation when target ref changes", async () => {
    const el1 = document.createElement("div")
    const el2 = document.createElement("div")
    const target = ref(el1)
    withSetup(() => useAnimate(target))
    await nextTick()
    mock_animate.mockClear()
    target.value = el2
    await nextTick()
    expect(mock_animate).toHaveBeenCalledWith(el2, {})
  })

  it("delegates reverse to the animation instance", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useAnimate(el))
    await nextTick()
    result.reverse()
    expect(mock_animation.reverse).toHaveBeenCalledOnce()
  })

  it("delegates restart to the animation instance", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useAnimate(el))
    await nextTick()
    result.restart()
    expect(mock_animation.restart).toHaveBeenCalledOnce()
  })

  it("delegates alternate to the animation instance", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useAnimate(el))
    await nextTick()
    result.alternate()
    expect(mock_animation.alternate).toHaveBeenCalledOnce()
  })

  it("delegates resume to the animation instance", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useAnimate(el))
    await nextTick()
    result.resume()
    expect(mock_animation.resume).toHaveBeenCalledOnce()
  })

  it("delegates complete to the animation instance", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useAnimate(el))
    await nextTick()
    result.complete()
    expect(mock_animation.complete).toHaveBeenCalledOnce()
  })

  it("delegates revert to the animation instance", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useAnimate(el))
    await nextTick()
    result.revert()
    expect(mock_animation.revert).toHaveBeenCalledOnce()
  })

  it("delegates reset with softReset arg to the animation instance", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useAnimate(el))
    await nextTick()
    result.reset(true)
    expect(mock_animation.reset).toHaveBeenCalledWith(true)
  })

  it("delegates stretch to the animation instance", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useAnimate(el))
    await nextTick()
    result.stretch(2000)
    expect(mock_animation.stretch).toHaveBeenCalledWith(2000)
  })

  it("delegates refresh to the animation instance", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useAnimate(el))
    await nextTick()
    result.refresh()
    expect(mock_animation.refresh).toHaveBeenCalledOnce()
  })

  it("resolves a Vue component ref to its $el", async () => {
    const ChildComp = defineComponent({ render: () => h("div") })
    const wrapper = mount(
      defineComponent({
        setup() {
          const child_ref = ref<ComponentPublicInstance | null>(null)
          useAnimate(child_ref, { opacity: [0, 1] })
          return () => h(ChildComp, { ref: child_ref })
        },
      })
    )
    await nextTick()
    expect(mock_animate).toHaveBeenCalledWith(wrapper.findComponent(ChildComp).element, { opacity: [0, 1] })
  })
})