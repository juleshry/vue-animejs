import { describe, it, expect, vi, beforeEach } from "vitest"
import { ref } from "vue"
import { useSvg } from "@lib"
import { svg } from "animejs"

const mock_svg = vi.mocked(svg)

vi.mock("animejs", () => ({
  svg: {
    morphTo: vi.fn(),
    createMotionPath: vi.fn(),
  },
}))

describe("useSvg", () => {
  beforeEach(() => {
    mock_svg.morphTo.mockClear()
    mock_svg.morphTo.mockReturnValue(vi.fn(() => "morphed"))
    mock_svg.createMotionPath.mockClear()
  })

  describe("morphTo", () => {
    it("does not call svg.morphTo until the returned FunctionValue is invoked", () => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
      const { morphTo } = useSvg()
      const morph = morphTo(path)
      expect(mock_svg.morphTo).not.toHaveBeenCalled()

      morph()
      expect(mock_svg.morphTo).toHaveBeenCalledWith(path, undefined)
    })

    it("unwraps ref path and precision when invoked", () => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
      const { morphTo } = useSvg()
      const morph = morphTo(ref(path), ref(2))
      morph()
      expect(mock_svg.morphTo).toHaveBeenCalledWith(path, 2)
    })

    it("re-checks a ref path on every invocation instead of freezing an unresolved value", () => {
      const path_ref = ref<SVGPathElement | null>(null)
      const { morphTo } = useSvg()
      const morph = morphTo(path_ref)

      expect(morph()).toBe("")
      expect(mock_svg.morphTo).not.toHaveBeenCalled()

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
      path_ref.value = path

      expect(morph()).toBe("morphed")
      expect(mock_svg.morphTo).toHaveBeenCalledWith(path, undefined)
    })
  })

  describe("createMotionPath", () => {
    it("calls svg.createMotionPath with the path", () => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
      const { createMotionPath } = useSvg()
      createMotionPath(path)
      expect(mock_svg.createMotionPath).toHaveBeenCalledWith(path, undefined)
    })

    it("unwraps a ref offset", () => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
      const { createMotionPath } = useSvg()
      createMotionPath(path, ref(0.5))
      expect(mock_svg.createMotionPath).toHaveBeenCalledWith(path, 0.5)
    })
  })
})