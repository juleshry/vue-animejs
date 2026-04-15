import { describe, it, expect, vi, beforeEach } from "vitest"
import { nextTick, ref } from "vue"
import { useAnimatable } from "@lib"
import { withSetup } from "./utils"
import { makeAnimatableMock } from "./mocks"
import { AnimatableParams, createAnimatable } from "animejs"

const mock_createAnimatable = vi.mocked(createAnimatable)

const mock_animatable = makeAnimatableMock()

vi.mock("animejs", () => ({
  createAnimatable: vi.fn(() => mock_animatable),
}))

describe("useAnimatable", () => {
  beforeEach(() => {
    mock_createAnimatable.mockClear()
    Object.values(mock_animatable).forEach(fn => fn.mockClear())
    vi.spyOn(console, "warn").mockImplementation(() => {})
  })

  it("creates animatable immediately for a non-ref target", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useAnimatable(el, { opacity: {} }))
    await nextTick()
    expect(mock_createAnimatable).toHaveBeenCalledWith(el, { opacity: {} })
    expect(result.animatable.value).toBeDefined()
  })

  it("does not create animatable immediately when target is a ref", async () => {
    const el_ref = ref<HTMLElement | null>(null)
    withSetup(() => useAnimatable(el_ref))
    await nextTick()
    expect(mock_createAnimatable).not.toHaveBeenCalled()
  })

  it("warns and leaves animatable undefined when target is null", async () => {
    const [result] = withSetup(() => useAnimatable(null as any))
    await nextTick()
    expect(console.warn).toHaveBeenCalledWith("Targets element is null or undefined")
    expect(result.animatable.value).toBeUndefined()
  })

  it("delegates revert to the animatable instance", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useAnimatable(el))
    await nextTick()
    result.revert()
    expect(mock_animatable.revert).toHaveBeenCalledOnce()
  })

  it("returns undefined from revert when animatable is not set", () => {
    const el_ref = ref<HTMLElement | null>(null)
    const [result] = withSetup(() => useAnimatable(el_ref))
    expect(result.revert()).toBeUndefined()
  })

  it("reverts on unmount", async () => {
    const el = document.createElement("div")
    const [, wrapper] = withSetup(() => useAnimatable(el))
    await nextTick()
    mock_animatable.revert.mockClear()
    wrapper.unmount()
    expect(mock_animatable.revert).toHaveBeenCalled()
  })

  it("recreates animatable when options ref changes", async () => {
    const el = document.createElement("div")
    const options = ref<AnimatableParams>({ opacity: {} })
    withSetup(() => useAnimatable(el, options))
    await nextTick()
    mock_createAnimatable.mockClear()
    options.value = { translateX: {} }
    await nextTick()
    expect(mock_createAnimatable).toHaveBeenCalledWith(el, { translateX: {} })
  })
})
