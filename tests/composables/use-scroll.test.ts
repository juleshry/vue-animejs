import { describe, it, expect, vi, beforeEach } from "vitest"
import { ref } from "vue"
import { useScroll } from "@lib"
import { expectInstanceStaysRaw, withSetup } from "../utils"
import { makeScrollObserverMock } from "../mocks"
import { onScroll } from "animejs"

const mock_onScroll = vi.mocked(onScroll)

const mock_observer = makeScrollObserverMock()

vi.mock("animejs", () => ({
  onScroll: vi.fn(() => mock_observer),
}))

describe("useScroll", () => {
  beforeEach(() => {
    mock_onScroll.mockClear()
    Object.values(mock_observer).forEach(fn => fn.mockClear())
  })

  it("does not call onScroll before observer/autoplay is read", () => {
    const container = document.createElement("div")
    const target = document.createElement("div")
    withSetup(() => useScroll(container, target))
    expect(mock_onScroll).not.toHaveBeenCalled()
  })

  it("creates the observer when read, given a resolvable container and target", () => {
    const container = document.createElement("div")
    const target = document.createElement("div")
    const [result] = withSetup(() => useScroll(container, target, { sync: true }))
    expect(result.observer.value).toBeDefined()
    expect(mock_onScroll).toHaveBeenCalledWith({ sync: true, container, target })
  })

  it("does not deep-wrap the observer instance (regression: readonly(shallowRef) stack overflow)", () => {
    const container = document.createElement("div")
    const target = document.createElement("div")
    const [result] = withSetup(() => useScroll(container, target))
    expectInstanceStaysRaw(result.observer.value)
  })

  it("returns undefined and does not call onScroll while the target ref is unresolved", () => {
    const container = document.createElement("div")
    const target_ref = ref<HTMLElement | null>(null)
    const [result] = withSetup(() => useScroll(container, target_ref))
    expect(result.observer.value).toBeUndefined()
    expect(mock_onScroll).not.toHaveBeenCalled()
  })

  it("returns the same observer across repeated reads without a dependency change (mount-time dedup)", () => {
    const container = document.createElement("div")
    const target = document.createElement("div")
    const [result] = withSetup(() => useScroll(container, target))

    void result.observer.value
    void result.observer.value
    void result.autoplay.value

    expect(mock_onScroll).toHaveBeenCalledOnce()
  })

  it("exposes autoplay as false until the observer exists", () => {
    const container = document.createElement("div")
    const target_ref = ref<HTMLElement | null>(null)
    const [result] = withSetup(() => useScroll(container, target_ref))
    expect(result.autoplay.value).toBe(false)
  })

  it("exposes autoplay as the observer once created", () => {
    const container = document.createElement("div")
    const target = document.createElement("div")
    const [result] = withSetup(() => useScroll(container, target))
    expect(result.autoplay.value).toBe(mock_observer)
  })

  it("exposes autoplayComputed as { autoplay } mirroring the autoplay ref", () => {
    const container = document.createElement("div")
    const target_ref = ref<HTMLElement | null>(null)
    const [result] = withSetup(() => useScroll(container, target_ref))
    expect(result.autoplayComputed.value).toEqual({ autoplay: false })

    target_ref.value = document.createElement("div")
    expect(result.autoplayComputed.value).toEqual({ autoplay: mock_observer })
  })

  it("recreates the observer when a target ref changes to a new element", () => {
    const container = document.createElement("div")
    const target_ref = ref(document.createElement("div"))
    const [result] = withSetup(() => useScroll(container, target_ref))

    void result.observer.value
    expect(mock_onScroll).toHaveBeenCalledOnce()

    target_ref.value = document.createElement("div")
    void result.observer.value

    expect(mock_onScroll).toHaveBeenCalledTimes(2)
    expect(mock_observer.revert).toHaveBeenCalledOnce()
  })

  it("delegates refresh to the observer instance", () => {
    const container = document.createElement("div")
    const target = document.createElement("div")
    const [result] = withSetup(() => useScroll(container, target))
    result.refresh()
    expect(mock_observer.refresh).toHaveBeenCalledOnce()
  })

  it("delegates debug to the observer instance", () => {
    const container = document.createElement("div")
    const target = document.createElement("div")
    const [result] = withSetup(() => useScroll(container, target))
    result.debug()
    expect(mock_observer.debug).toHaveBeenCalledOnce()
  })

  it("delegates removeDebug to the observer instance", () => {
    const container = document.createElement("div")
    const target = document.createElement("div")
    const [result] = withSetup(() => useScroll(container, target))
    result.removeDebug()
    expect(mock_observer.removeDebug).toHaveBeenCalledOnce()
  })

  it("delegates link to the observer instance", () => {
    const container = document.createElement("div")
    const target = document.createElement("div")
    const [result] = withSetup(() => useScroll(container, target))
    // oxlint-disable-next-line typescript/no-explicit-any
    const linked = {} as any
    result.link(linked)
    expect(mock_observer.link).toHaveBeenCalledWith(linked)
  })

  it("control methods return undefined when nothing is resolvable", () => {
    const container = document.createElement("div")
    const target_ref = ref<HTMLElement | null>(null)
    const [result] = withSetup(() => useScroll(container, target_ref))
    expect(result.refresh()).toBeUndefined()
    expect(result.removeDebug()).toBeUndefined()
  })

  it("reverts on unmount", () => {
    const container = document.createElement("div")
    const target = document.createElement("div")
    const [result, wrapper] = withSetup(() => useScroll(container, target))
    void result.observer.value
    mock_observer.revert.mockClear()
    wrapper.unmount()
    expect(mock_observer.revert).toHaveBeenCalled()
  })

  it("does not call onScroll on unmount when observer was never read", () => {
    const container = document.createElement("div")
    const target = document.createElement("div")
    const [, wrapper] = withSetup(() => useScroll(container, target))
    wrapper.unmount()
    expect(mock_onScroll).not.toHaveBeenCalled()
  })
})