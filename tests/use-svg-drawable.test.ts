import { describe, it, expect, vi, beforeEach } from "vitest"
import { nextTick, ref } from "vue"
import { useSvgDrawable } from "@lib"
import { withSetup } from "./utils"
import { svg } from "animejs"

const mock_svg = vi.mocked(svg)
// oxlint-disable-next-line typescript/no-explicit-any
const mock_drawable = { _drawable: true } as any

vi.mock("animejs", () => ({
  svg: {
    createDrawable: vi.fn(() => [mock_drawable]),
  },
}))

describe("useSvgDrawable", () => {
  beforeEach(() => {
    mock_svg.createDrawable.mockClear()
    vi.spyOn(console, "warn").mockImplementation(() => {})
  })

  it("creates drawable immediately for a non-ref target", async () => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path") as SVGPathElement
    const [result] = withSetup(() => useSvgDrawable(path))
    await nextTick()
    expect(mock_svg.createDrawable).toHaveBeenCalledWith(path, 0, 0)
    expect(result.drawable.value).toBeDefined()
  })

  it("does not create drawable immediately when target is a ref", async () => {
    const el_ref = ref<SVGPathElement | null>(null)
    withSetup(() => useSvgDrawable(el_ref))
    await nextTick()
    expect(mock_svg.createDrawable).not.toHaveBeenCalled()
  })

  it("warns and leaves drawable undefined when target is null", async () => {
    // oxlint-disable-next-line typescript/no-explicit-any
    const [result] = withSetup(() => useSvgDrawable(null as any))
    await nextTick()
    expect(console.warn).toHaveBeenCalledWith("[useSvgDrawable] Target element is null or undefined")
    expect(result.drawable.value).toBeUndefined()
  })

  it("passes start and end to createDrawable", async () => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path") as SVGPathElement
    withSetup(() => useSvgDrawable(path, 0.2, 0.8))
    await nextTick()
    expect(mock_svg.createDrawable).toHaveBeenCalledWith(path, 0.2, 0.8)
  })

  it("unwraps ref start and end", async () => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path") as SVGPathElement
    withSetup(() => useSvgDrawable(path, ref(0.1), ref(0.9)))
    await nextTick()
    expect(mock_svg.createDrawable).toHaveBeenCalledWith(path, 0.1, 0.9)
  })

  it("clears the drawable on unmount", async () => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path") as SVGPathElement
    const [result, wrapper] = withSetup(() => useSvgDrawable(path))
    await nextTick()
    expect(result.drawable.value).toBeDefined()
    wrapper.unmount()
    expect(result.drawable.value).toBeUndefined()
  })

  it("creates drawable when ref target resolves", async () => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path") as SVGPathElement
    const el_ref = ref<SVGPathElement | null>(null)
    const [result] = withSetup(() => useSvgDrawable(el_ref))
    await nextTick()
    expect(mock_svg.createDrawable).not.toHaveBeenCalled()
    el_ref.value = path
    await nextTick()
    expect(mock_svg.createDrawable).toHaveBeenCalledWith(path, 0, 0)
    expect(result.drawable.value).toBeDefined()
  })
})