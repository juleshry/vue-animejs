import { describe, it, expect, vi, beforeEach } from "vitest"
import { defineComponent, h, ref } from "vue"
import { mount } from "@vue/test-utils"
import { useRawAnimate } from "@lib"
import { makeAnimationMock } from "./mocks"
import { animate } from "animejs"

const mock_animate = vi.mocked(animate)

const mock_animation = makeAnimationMock()

vi.mock("animejs", () => ({
  animate: vi.fn(() => mock_animation),
}))

describe("useRawAnimate", () => {
  beforeEach(() => {
    mock_animate.mockClear()
    vi.spyOn(console, "warn").mockImplementation(() => {})
  })

  it("calls animate with the target and options", () => {
    const el = document.createElement("div")
    useRawAnimate(el, { opacity: [0, 1] })

    expect(mock_animate).toHaveBeenCalledOnce()
    expect(mock_animate).toHaveBeenCalledWith(el, { opacity: [0, 1] })
  })

  it("unwraps a ref target", () => {
    const el = document.createElement("div")
    useRawAnimate(ref(el), { duration: 300 })

    expect(mock_animate).toHaveBeenCalledWith(el, { duration: 300 })
  })

  it("unwraps a ref options", () => {
    const el = document.createElement("div")
    const options = ref({ translateX: 100 })
    useRawAnimate(el, options)

    expect(mock_animate).toHaveBeenCalledWith(el, { translateX: 100 })
  })

  it("returns the animation instance", () => {
    const el = document.createElement("div")
    const result = useRawAnimate(el, {})

    expect(result).toBe(mock_animation)
  })

  it("warns when target is falsy", () => {
    // oxlint-disable-next-line typescript/no-explicit-any
    useRawAnimate(null as any)

    expect(console.warn).toHaveBeenCalledWith("Target is undefined")
  })

  it("defaults options to an empty object", () => {
    const el = document.createElement("div")
    useRawAnimate(el)

    expect(mock_animate).toHaveBeenCalledWith(el, {})
  })

  it("resolves a Vue component ref to its $el", () => {
    const ChildComp = defineComponent({ render: () => h("div") })
    const child_wrapper = mount(ChildComp)

    // oxlint-disable-next-line typescript/no-explicit-any
    useRawAnimate(ref(child_wrapper.vm) as any, { opacity: [0, 1] })

    expect(mock_animate).toHaveBeenCalledWith(child_wrapper.element, { opacity: [0, 1] })
  })
})