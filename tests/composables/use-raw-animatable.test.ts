import { describe, it, expect, vi, beforeEach } from "vitest"
import { defineComponent, h, ref } from "vue"
import { mount } from "@vue/test-utils"
import { useRawAnimatable } from "@lib"
import { makeAnimatableMock } from "../mocks"
import { createAnimatable } from "animejs"

const mock_createAnimatable = vi.mocked(createAnimatable)

const mock_animatable = makeAnimatableMock()

vi.mock("animejs", () => ({
  createAnimatable: vi.fn(() => mock_animatable),
}))

describe("useRawAnimatable", () => {
  beforeEach(() => {
    mock_createAnimatable.mockClear()
    vi.spyOn(console, "warn").mockImplementation(() => {})
  })

  it("calls createAnimatable with the target and options", () => {
    const el = document.createElement("div")
    useRawAnimatable(el, { x: 100 })

    expect(mock_createAnimatable).toHaveBeenCalledOnce()
    expect(mock_createAnimatable).toHaveBeenCalledWith(el, { x: 100 })
  })

  it("unwraps a ref target", () => {
    const el = document.createElement("div")
    useRawAnimatable(ref(el), { y: 50 })

    expect(mock_createAnimatable).toHaveBeenCalledWith(el, { y: 50 })
  })

  it("unwraps a ref options", () => {
    const el = document.createElement("div")
    const options = ref({ x: 200 })
    useRawAnimatable(el, options)

    expect(mock_createAnimatable).toHaveBeenCalledWith(el, { x: 200 })
  })

  it("returns the animatable instance", () => {
    const el = document.createElement("div")
    const result = useRawAnimatable(el, {})

    expect(result).toBe(mock_animatable)
  })

  it("warns when target is falsy", () => {
    // oxlint-disable-next-line typescript/no-explicit-any
    useRawAnimatable(null as any)

    expect(console.warn).toHaveBeenCalledWith("Targets element is null or undefined")
  })

  it("defaults options to an empty object", () => {
    const el = document.createElement("div")
    useRawAnimatable(el)

    expect(mock_createAnimatable).toHaveBeenCalledWith(el, {})
  })

  it("resolves a Vue component ref to its $el", () => {
    const ChildComp = defineComponent({ render: () => h("div") })
    const child_wrapper = mount(ChildComp)

    // oxlint-disable-next-line typescript/no-explicit-any
    useRawAnimatable(ref(child_wrapper.vm) as any, { x: 100 })

    expect(mock_createAnimatable).toHaveBeenCalledWith(child_wrapper.element, { x: 100 })
  })
})