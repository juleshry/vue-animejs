import { describe, it, expect, vi, beforeEach } from "vitest"
import { nextTick, ref } from "vue"
import { useDraggable } from "@lib"
import { withSetup } from "./utils"
import { makeDraggableMock } from "./mocks"
import { createDraggable } from "animejs"

const mock_createDraggable = vi.mocked(createDraggable)

const mock_draggable = makeDraggableMock()

vi.mock("animejs", () => ({
  createDraggable: vi.fn(() => mock_draggable),
}))

describe("useDraggable", () => {
  beforeEach(() => {
    mock_createDraggable.mockClear()
    Object.values(mock_draggable).forEach(fn => fn.mockClear())
    vi.spyOn(console, "warn").mockImplementation(() => {})
  })

  it("creates draggable immediately for a non-ref target", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useDraggable(el, { container: document.body }))
    await nextTick()
    expect(mock_createDraggable).toHaveBeenCalledWith(el, { container: document.body })
    expect(result.draggable.value).toBeDefined()
  })

  it("does not create draggable immediately when target is a ref", async () => {
    const el_ref = ref<HTMLElement | null>(null)
    withSetup(() => useDraggable(el_ref))
    await nextTick()
    expect(mock_createDraggable).not.toHaveBeenCalled()
  })

  it("warns and leaves draggable undefined when target is null", async () => {
    const [result] = withSetup(() => useDraggable(null as any))
    await nextTick()
    expect(console.warn).toHaveBeenCalledWith("Targets element is null or undefined")
    expect(result.draggable.value).toBeUndefined()
  })

  it("delegates disable to the draggable instance", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useDraggable(el))
    await nextTick()
    result.disable()
    expect(mock_draggable.disable).toHaveBeenCalledOnce()
  })

  it("delegates enable to the draggable instance", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useDraggable(el))
    await nextTick()
    result.enable()
    expect(mock_draggable.enable).toHaveBeenCalledOnce()
  })

  it("delegates setX with args to the draggable instance", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useDraggable(el))
    await nextTick()
    result.setX(100, true)
    expect(mock_draggable.setX).toHaveBeenCalledWith(100, true)
  })

  it("delegates setY with args to the draggable instance", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useDraggable(el))
    await nextTick()
    result.setY(50)
    expect(mock_draggable.setY).toHaveBeenCalledWith(50, undefined)
  })

  it("control methods return undefined when draggable is not set", () => {
    const el_ref = ref<HTMLElement | null>(null)
    const [result] = withSetup(() => useDraggable(el_ref))
    expect(result.disable()).toBeUndefined()
    expect(result.enable()).toBeUndefined()
  })

  it("reverts on unmount", async () => {
    const el = document.createElement("div")
    const [, wrapper] = withSetup(() => useDraggable(el))
    await nextTick()
    mock_draggable.revert.mockClear()
    wrapper.unmount()
    expect(mock_draggable.revert).toHaveBeenCalled()
  })
})
