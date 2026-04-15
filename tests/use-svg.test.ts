import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useSvg } from '@lib'
import { svg } from 'animejs'

const mock_svg = vi.mocked(svg)

vi.mock('animejs', () => ({
  svg: {
    morphTo: vi.fn(),
    createDrawable: vi.fn(),
    createMotionPath: vi.fn(),
  },
}))

describe('useSvg', () => {
  beforeEach(() => {
    mock_svg.morphTo.mockClear()
    mock_svg.createDrawable.mockClear()
    mock_svg.createMotionPath.mockClear()
  })

  describe('morphTo', () => {
    it('calls svg.morphTo with the path', () => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      const { morphTo } = useSvg()
      morphTo(path)
      expect(mock_svg.morphTo).toHaveBeenCalledWith(path, undefined)
    })

    it('unwraps ref path and precision', () => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      const { morphTo } = useSvg()
      morphTo(ref(path), ref(2))
      expect(mock_svg.morphTo).toHaveBeenCalledWith(path, 2)
    })
  })

  describe('createDrawable', () => {
    it('calls svg.createDrawable with the selector', () => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      const { createDrawable } = useSvg()
      createDrawable(path)
      expect(mock_svg.createDrawable).toHaveBeenCalledWith(path, undefined, undefined)
    })

    it('unwraps ref start and end', () => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      const { createDrawable } = useSvg()
      createDrawable(path, ref(0), ref(100))
      expect(mock_svg.createDrawable).toHaveBeenCalledWith(path, 0, 100)
    })
  })

  describe('createMotionPath', () => {
    it('calls svg.createMotionPath with the path', () => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      const { createMotionPath } = useSvg()
      createMotionPath(path)
      expect(mock_svg.createMotionPath).toHaveBeenCalledWith(path, undefined)
    })

    it('unwraps a ref offset', () => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      const { createMotionPath } = useSvg()
      createMotionPath(path, ref(0.5))
      expect(mock_svg.createMotionPath).toHaveBeenCalledWith(path, 0.5)
    })
  })
})
