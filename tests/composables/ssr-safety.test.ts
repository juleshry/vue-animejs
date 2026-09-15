// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  animate,
  createAnimatable,
  createDraggable,
  createLayout,
  createTimeline,
  createTimer,
  splitText,
  svg,
  waapi,
} from "animejs"
import {
  useAnimatable,
  useAnimate,
  useDraggable,
  useLayout,
  useSvgDrawable,
  useText,
  useTimeline,
  useTimer,
  useWaapi,
} from "@lib"
import { renderSSR } from "../utils"

vi.mock("animejs", () => ({
  animate: vi.fn(() => ({ cancel: vi.fn(), revert: vi.fn() })),
  createAnimatable: vi.fn(() => ({ revert: vi.fn() })),
  createDraggable: vi.fn(() => ({ revert: vi.fn() })),
  createLayout: vi.fn(() => ({ revert: vi.fn() })),
  svg: { createDrawable: vi.fn(() => [{}]) },
  splitText: vi.fn(() => ({ revert: vi.fn(), lines: [], words: [], chars: [] })),
  waapi: { animate: vi.fn(() => ({ cancel: vi.fn() })) },
  createTimer: vi.fn(() => ({ cancel: vi.fn() })),
  createTimeline: vi.fn(() => ({ cancel: vi.fn(), revert: vi.fn() })),
}))

const mock_animate = vi.mocked(animate)
const mock_createAnimatable = vi.mocked(createAnimatable)
const mock_createDraggable = vi.mocked(createDraggable)
const mock_createLayout = vi.mocked(createLayout)
const mock_createDrawable = vi.mocked(svg.createDrawable)
const mock_splitText = vi.mocked(splitText)
const mock_waapiAnimate = vi.mocked(waapi.animate)
const mock_createTimer = vi.mocked(createTimer)
const mock_createTimeline = vi.mocked(createTimeline)

describe("SSR safety", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("useAnimate does not create an animation for a non-ref selector target", async () => {
    const result = await renderSSR(() => useAnimate(".target", { opacity: [0, 1] }))
    expect(mock_animate).not.toHaveBeenCalled()
    expect(result.animation.value).toBeUndefined()
  })

  it("useAnimatable does not create an animatable for a non-ref selector target", async () => {
    const result = await renderSSR(() => useAnimatable(".target"))
    expect(mock_createAnimatable).not.toHaveBeenCalled()
    expect(result.animatable.value).toBeUndefined()
  })

  it("useDraggable does not touch doc.body for a non-ref selector target", async () => {
    const result = await renderSSR(() => useDraggable(".target"))
    expect(mock_createDraggable).not.toHaveBeenCalled()
    expect(result.draggable.value).toBeUndefined()
  })

  it("useLayout does not read window.scrollX/scrollY for a non-ref selector root", async () => {
    const result = await renderSSR(() => useLayout(".target"))
    expect(mock_createLayout).not.toHaveBeenCalled()
    expect(result.layout.value).toBeUndefined()
  })

  it("useSvgDrawable does not touch the target for a non-ref selector", async () => {
    const result = await renderSSR(() => useSvgDrawable(".target"))
    expect(mock_createDrawable).not.toHaveBeenCalled()
    expect(result.drawable.value).toBeUndefined()
  })

  it("useText does not construct a ResizeObserver/doc.fonts for a non-ref selector target", async () => {
    const result = await renderSSR(() => useText(".target"))
    expect(mock_splitText).not.toHaveBeenCalled()
    expect(result.splitter.value).toBeUndefined()
  })

  it("useWaapi does not create a WAAPI animation for a non-ref selector target", async () => {
    const result = await renderSSR(() => useWaapi(".target"))
    expect(mock_waapiAnimate).not.toHaveBeenCalled()
    expect(result.animation.value).toBeUndefined()
  })

  it("useTimer does not start a ticking timer during SSR", async () => {
    const result = await renderSSR(() => useTimer({ duration: 1000 }))
    expect(mock_createTimer).not.toHaveBeenCalled()
    expect(result.timer.value).toBeUndefined()
  })

  it("useTimeline does not start a ticking timeline during SSR", async () => {
    const result = await renderSSR(() => useTimeline({ autoplay: true }))
    expect(mock_createTimeline).not.toHaveBeenCalled()
    expect(result.timeline.value).toBeUndefined()
  })
})