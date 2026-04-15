import { describe, it, expect, vi, beforeEach } from "vitest"
import { nextTick, ref } from "vue"
import { useLayout } from "@lib"
import { withSetup } from "./utils"
import { makeLayoutMock } from "./mocks"
import { AutoLayoutParams, createLayout } from "animejs"

const mock_createLayout = vi.mocked(createLayout)

const mock_layout = makeLayoutMock()

vi.mock("animejs", () => ({
  createLayout: vi.fn(() => mock_layout),
}))

describe("useLayout", () => {
  beforeEach(() => {
    mock_createLayout.mockClear()
    Object.values(mock_layout).forEach(fn => fn.mockClear())
    vi.spyOn(console, "warn").mockImplementation(() => {})
  })

  it("creates layout immediately for a non-ref target", async () => {
    const el = document.createElement("div")
    const params: AutoLayoutParams = { properties: ["boxShadow"] }
    const [result] = withSetup(() => useLayout(el, params))
    await nextTick()
    expect(mock_createLayout).toHaveBeenCalledWith(el, params)
    expect(result.layout.value).toBeDefined()
  })

  it("does not create layout immediately when target is a ref", async () => {
    const el_ref = ref<HTMLElement | null>(null)
    withSetup(() => useLayout(el_ref, {}))
    await nextTick()
    expect(mock_createLayout).not.toHaveBeenCalled()
  })

  it("warns and leaves layout undefined when target is null", async () => {
    const [result] = withSetup(() => useLayout(null as any, {}))
    await nextTick()
    expect(console.warn).toHaveBeenCalledWith("Target element is null or undefined")
    expect(result.layout.value).toBeUndefined()
  })

  it("delegates record to the layout instance", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useLayout(el, {}))
    await nextTick()
    result.record()
    expect(mock_layout.record).toHaveBeenCalledOnce()
  })

  it("delegates animate with params to the layout instance", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useLayout(el, {}))
    await nextTick()
    const anim_params = { duration: 300 }
    result.animate(anim_params)
    expect(mock_layout.animate).toHaveBeenCalledWith(anim_params)
  })

  it("delegates update with callback and params to the layout instance", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useLayout(el, {}))
    await nextTick()
    const cb = vi.fn()
    result.update(cb, { duration: 300 })
    expect(mock_layout.update).toHaveBeenCalledWith(cb, { duration: 300 })
  })

  it("control methods return undefined when layout is not set", () => {
    const el_ref = ref<HTMLElement | null>(null)
    const [result] = withSetup(() => useLayout(el_ref, {}))
    expect(result.record()).toBeUndefined()
    expect(result.animate()).toBeUndefined()
  })

  it("reverts on unmount", async () => {
    const el = document.createElement("div")
    const [, wrapper] = withSetup(() => useLayout(el, {}))
    await nextTick()
    mock_layout.revert.mockClear()
    wrapper.unmount()
    expect(mock_layout.revert).toHaveBeenCalled()
  })
})
