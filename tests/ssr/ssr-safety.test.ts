// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vite-plus/test"
import {
  animate,
  createAnimatable,
  createDraggable,
  createLayout,
  createScope,
  createTimeline,
  createTimer,
  onScroll,
  splitText,
  svg,
  waapi,
} from "animejs"
import {
  AnimeLayout,
  AnimeScope,
  AnimeTransition,
  AnimeTransitionGroup,
  useAnimatable,
  useAnimate,
  useDraggable,
  useLayout,
  useRawAnimatable,
  useRawAnimate,
  useScope,
  useScroll,
  useSvg,
  useSvgDrawable,
  useText,
  useTimeline,
  useTimer,
  useWaapi,
} from "@lib"
import { h } from "vue"
import { renderSSR, renderSSRApp } from "../utils"

vi.mock("animejs", () => ({
  animate: vi.fn(() => ({ cancel: vi.fn(), revert: vi.fn() })),
  createAnimatable: vi.fn(() => ({ revert: vi.fn() })),
  createDraggable: vi.fn(() => ({ revert: vi.fn() })),
  createLayout: vi.fn(() => ({ revert: vi.fn() })),
  createScope: vi.fn(() => ({ revert: vi.fn() })),
  onScroll: vi.fn(() => ({ revert: vi.fn() })),
  svg: { createDrawable: vi.fn(() => [{}]), createMotionPath: vi.fn(), morphTo: vi.fn() },
  splitText: vi.fn(() => ({ revert: vi.fn(), lines: [], words: [], chars: [] })),
  waapi: { animate: vi.fn(() => ({ cancel: vi.fn() })) },
  createTimer: vi.fn(() => ({ cancel: vi.fn() })),
  createTimeline: vi.fn(() => ({ cancel: vi.fn(), revert: vi.fn() })),
}))

const mock_animate = vi.mocked(animate)
const mock_createAnimatable = vi.mocked(createAnimatable)
const mock_createDraggable = vi.mocked(createDraggable)
const mock_createLayout = vi.mocked(createLayout)
const mock_createScope = vi.mocked(createScope)
const mock_createDrawable = vi.mocked(svg.createDrawable)
const mock_createMotionPath = vi.mocked(svg.createMotionPath)
const mock_morphTo = vi.mocked(svg.morphTo)
const mock_onScroll = vi.mocked(onScroll)
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

  it("AnimeLayout does not create a layout during SSR", async () => {
    await renderSSRApp(() => h(AnimeLayout, { options: { duration: 300 } }))
    expect(mock_createLayout).not.toHaveBeenCalled()
  })

  it("useScroll does not attach scroll listeners for non-ref selector container/target", async () => {
    const result = await renderSSR(() => useScroll(".container", ".target"))
    expect(mock_onScroll).not.toHaveBeenCalled()
    expect(result.observer.value).toBeUndefined()
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

  it("AnimeScope does not create a scope during SSR", async () => {
    await renderSSRApp(() => h(AnimeScope, { options: { mediaQueries: { narrow: "(max-width: 600px)" } } }))
    expect(mock_createScope).not.toHaveBeenCalled()
  })

  it("AnimeTransition does not animate during SSR, even with appear", async () => {
    await renderSSRApp(() => h(AnimeTransition, { appear: true, enter: { opacity: [0, 1] } }, () => h("p")))
    expect(mock_animate).not.toHaveBeenCalled()
  })

  it("AnimeTransitionGroup does not animate during SSR, even with appear", async () => {
    await renderSSRApp(() =>
      h(AnimeTransitionGroup, { tag: "ul", appear: true, enter: { opacity: [0, 1] } }, () => [h("li", { key: "a" })])
    )
    expect(mock_animate).not.toHaveBeenCalled()
  })

  it("useScope does not create a scope during SSR", async () => {
    const result = await renderSSR(() => useScope({}))
    expect(mock_createScope).not.toHaveBeenCalled()
    expect(result.scope.value).toBeUndefined()
  })

  it("useSvg does not call any SVG helper just by being set up", async () => {
    await renderSSR(() => useSvg())
    expect(mock_createMotionPath).not.toHaveBeenCalled()
    expect(mock_morphTo).not.toHaveBeenCalled()
  })

  // useRaw* are the documented exception: they create their instance immediately and
  // unconditionally. These lock in that contract so a future "fix" can't silently change it.
  it("useRawAnimate creates its animation immediately, even during SSR", async () => {
    await renderSSR(() => useRawAnimate(".target", { opacity: [0, 1] }))
    expect(mock_animate).toHaveBeenCalledOnce()
  })

  it("useRawAnimatable creates its animatable immediately, even during SSR", async () => {
    await renderSSR(() => useRawAnimatable(".target"))
    expect(mock_createAnimatable).toHaveBeenCalledOnce()
  })
})