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
    mock_svg.createMotionPath.mockClear()
  })

  describe("morphTo", () => {
    it("calls svg.morphTo with the path", () => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
      const { morphTo } = useSvg()
      morphTo(path)
      expect(mock_svg.morphTo).toHaveBeenCalledWith(path, undefined)
    })

    it("unwraps ref path and precision", () => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
      const { morphTo } = useSvg()
      morphTo(ref(path), ref(2))
      expect(mock_svg.morphTo).toHaveBeenCalledWith(path, 2)
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