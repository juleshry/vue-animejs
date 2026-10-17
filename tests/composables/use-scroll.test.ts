import { describe, it, expect, vi, beforeEach } from "vite-plus/test"
import { defineComponent, h, nextTick, ref, useTemplateRef, watch } from "vue"
import { mount } from "@vue/test-utils"
import { useScroll, useTimeline } from "@lib"
import { expectInstanceStaysRaw, withSetup } from "../utils"
import { makeScrollObserverMock } from "../mocks"
import { createTimeline, onScroll } from "animejs"

const mock_onScroll = vi.mocked(onScroll)
const mock_createTimeline = vi.mocked(createTimeline)

const mock_observer = makeScrollObserverMock()

vi.mock("animejs", () => ({
  onScroll: vi.fn(() => mock_observer),
  createTimeline: vi.fn(() => ({ revert: vi.fn(), cancel: vi.fn() })),
}))

describe("useScroll", () => {
  beforeEach(() => {
    mock_onScroll.mockClear()
    mock_createTimeline.mockClear()
    Object.values(mock_observer).forEach(fn => fn.mockClear())
  })

  it("creates the observer on mount, not in setup(), even when a selector already matches (regression: hydration)", () => {
    const container = document.createElement("div")
    container.id = "scroll-container"
    const target = document.createElement("div")
    target.id = "scroll-target"
    document.body.append(container, target)
    let created_in_setup: boolean | undefined
    let read_in_setup: unknown
    const [result, wrapper] = withSetup(() => {
      const scroll = useScroll("#scroll-container", "#scroll-target")
      // A consumer reading it in setup(), like useTimeline's watch getter does
      read_in_setup = scroll.autoplayComputed.value
      created_in_setup = mock_onScroll.mock.calls.length > 0
      return scroll
    })
    expect(created_in_setup).toBe(false)
    expect(read_in_setup).toEqual({ autoplay: false })
    expect(mock_onScroll).toHaveBeenCalledOnce()
    expect(mock_onScroll).toHaveBeenCalledWith({ container: "#scroll-container", target: "#scroll-target" })
    expect(result.observer.value).toBe(mock_observer)
    wrapper.unmount()
    container.remove()
    target.remove()
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

  it("exposes autoplayComputed as { autoplay } mirroring the autoplay ref", async () => {
    const container = document.createElement("div")
    const target_ref = ref<HTMLElement | null>(null)
    const [result] = withSetup(() => useScroll(container, target_ref))
    expect(result.autoplayComputed.value).toEqual({ autoplay: false })

    target_ref.value = document.createElement("div")
    await nextTick()
    expect(result.autoplayComputed.value).toEqual({ autoplay: mock_observer })
  })

  it("recreates the observer when a target ref changes to a new element", async () => {
    const container = document.createElement("div")
    const target_ref = ref(document.createElement("div"))
    withSetup(() => useScroll(container, target_ref))
    expect(mock_onScroll).toHaveBeenCalledOnce()

    target_ref.value = document.createElement("div")
    await nextTick()

    expect(mock_onScroll).toHaveBeenCalledTimes(2)
    expect(mock_observer.revert).toHaveBeenCalledOnce()
  })

  it("recreates the observer when options change", async () => {
    const container = document.createElement("div")
    const target = document.createElement("div")
    const options = ref({ sync: false })
    withSetup(() => useScroll(container, target, options))
    options.value = { sync: true }
    await nextTick()
    expect(mock_onScroll).toHaveBeenCalledTimes(2)
    expect(mock_onScroll).toHaveBeenLastCalledWith({ sync: true, container, target })
    expect(mock_observer.revert).toHaveBeenCalledOnce()
  })

  it("builds a consuming useTimeline once, with the observer as autoplay (regression: double build)", async () => {
    let creations = 0
    const wrapper = mount(
      defineComponent({
        setup() {
          const container = useTemplateRef<HTMLElement>("container")
          const target = useTemplateRef<HTMLElement>("target")
          const { autoplayComputed } = useScroll(container, target, { sync: true })
          const { timeline } = useTimeline(autoplayComputed)
          watch(timeline, instance => {
            if (instance) creations++
          })
          return () => h("div", { ref: "container" }, [h("div", { ref: "target" })])
        },
      })
    )
    await nextTick()
    await nextTick()
    expect(mock_createTimeline).toHaveBeenCalledOnce()
    expect(mock_createTimeline).toHaveBeenCalledWith({ autoplay: mock_observer })
    expect(creations).toBe(1)
    wrapper.unmount()
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
})