import { describe, it, expect, vi, beforeEach } from "vitest"
import { nextTick, ref } from "vue"
import { useWaapi } from "@lib"
import { withSetup } from "./utils"
import { makeWaapiAnimationMock } from "./mocks"
import { waapi } from "animejs"

const mock_waapi = vi.mocked(waapi)

const mock_animation = makeWaapiAnimationMock()

vi.mock("animejs", () => ({
  waapi: {
    animate: vi.fn(() => mock_animation),
    convertEase: vi.fn(() => "linear(0, 1)"),
  },
}))

describe("useWaapi", () => {
  beforeEach(() => {
    mock_waapi.animate.mockClear()
    mock_waapi.convertEase.mockClear()
    Object.values(mock_animation).forEach(fn => fn.mockClear())
  })

  it("creates animation immediately for a non-ref target", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useWaapi(el, { opacity: [0, 1] }))
    await nextTick()
    expect(mock_waapi.animate).toHaveBeenCalledWith(el, { opacity: [0, 1] })
    expect(result.animation.value).toBeDefined()
  })

  it("does not create animation immediately when target is a ref", async () => {
    const el_ref = ref<HTMLElement | null>(null)
    withSetup(() => useWaapi(el_ref))
    await nextTick()
    expect(mock_waapi.animate).not.toHaveBeenCalled()
  })

  it("delegates play to the animation instance", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useWaapi(el))
    await nextTick()
    result.play()
    expect(mock_animation.play).toHaveBeenCalledOnce()
  })

  it("delegates pause to the animation instance", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useWaapi(el))
    await nextTick()
    result.pause()
    expect(mock_animation.pause).toHaveBeenCalledOnce()
  })

  it("delegates seek and unwraps ref time", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useWaapi(el))
    await nextTick()
    result.seek(ref(300), ref(false))
    expect(mock_animation.seek).toHaveBeenCalledWith(300, false)
  })

  it("delegates cancel to the animation instance", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useWaapi(el))
    await nextTick()
    result.cancel()
    expect(mock_animation.cancel).toHaveBeenCalledOnce()
  })

  it("control methods return undefined when animation is not set", () => {
    const el_ref = ref<HTMLElement | null>(null)
    const [result] = withSetup(() => useWaapi(el_ref))
    expect(result.play()).toBeUndefined()
    expect(result.cancel()).toBeUndefined()
  })

  it("convertEase calls waapi.convertEase with unwrapped args", () => {
    const [result] = withSetup(() => useWaapi(document.createElement("div")))
    const ease_fn = (t: number) => t
    result.convertEase(ease_fn, 50)
    expect(mock_waapi.convertEase).toHaveBeenCalledWith(ease_fn, 50)
  })

  it("convertEase unwraps ref args", () => {
    const [result] = withSetup(() => useWaapi(document.createElement("div")))
    const ease_fn = (t: number) => t
    result.convertEase(ref(ease_fn), ref(100))
    expect(mock_waapi.convertEase).toHaveBeenCalledWith(ease_fn, 100)
  })

  it("recreates animation when options ref changes", async () => {
    const el = document.createElement("div")
    const options = ref({ opacity: 0 })
    withSetup(() => useWaapi(el, options))
    await nextTick()
    mock_waapi.animate.mockClear()
    options.value = { opacity: 1 }
    await nextTick()
    expect(mock_waapi.animate).toHaveBeenCalledWith(el, { opacity: 1 })
  })
})
