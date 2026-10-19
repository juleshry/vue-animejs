import { describe, it, expect, vi, beforeEach } from "vite-plus/test"
import { defineComponent, h, nextTick, onMounted, ref, useTemplateRef } from "vue"
import { mount } from "@vue/test-utils"
import { useDraggable } from "@lib"
import { expectInstanceStaysRaw, withSetup, mountWithTarget, recordTargetFound, type TargetForm } from "../utils"
import { makeDraggableMock } from "../mocks"
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

  it("creates draggable on mount for a non-ref target", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useDraggable(el, { container: document.body }))
    await nextTick()
    expect(mock_createDraggable).toHaveBeenCalledWith(el, { container: document.body })
    expect(result.draggable.value).toBeDefined()
  })

  it("does not deep-wrap the draggable instance (regression: readonly(shallowRef) stack overflow)", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useDraggable(el, { container: document.body }))
    await nextTick()
    expectInstanceStaysRaw(result.draggable.value)
  })

  it("waits for a ref target that is still empty at mount", async () => {
    const el_ref = ref<HTMLElement | null>(null)
    withSetup(() => useDraggable(el_ref))
    await nextTick()
    expect(mock_createDraggable).not.toHaveBeenCalled()
  })

  it("warns and leaves draggable undefined when target is null", async () => {
    // oxlint-disable-next-line typescript/no-explicit-any
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

  it("delegates animateInView to the draggable instance", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useDraggable(el))
    await nextTick()
    result.animateInView(500, 20)
    expect(mock_draggable.animateInView).toHaveBeenCalledWith(500, 20, undefined)
  })

  it("delegates scrollInView to the draggable instance", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useDraggable(el))
    await nextTick()
    result.scrollInView(300)
    expect(mock_draggable.scrollInView).toHaveBeenCalledWith(300, undefined, undefined)
  })

  it("delegates stop to the draggable instance", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useDraggable(el))
    await nextTick()
    result.stop()
    expect(mock_draggable.stop).toHaveBeenCalledOnce()
  })

  it("delegates reset to the draggable instance", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useDraggable(el))
    await nextTick()
    result.reset()
    expect(mock_draggable.reset).toHaveBeenCalledOnce()
  })

  it("delegates refresh to the draggable instance", async () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useDraggable(el))
    await nextTick()
    result.refresh()
    expect(mock_draggable.refresh).toHaveBeenCalledOnce()
  })

  // Regression: a non-ref target used to be resolved in setup(), before the component's own template
  // existed (and during hydration, before Vue had hydrated the server HTML).
  it.each<TargetForm>(["selector", "template ref", "array of template refs"])(
    "builds exactly once on mount from the component's own template (%s)",
    async form => {
      const record = recordTargetFound(mock_createDraggable)
      const wrapper = mountWithTarget(form, target => useDraggable(target))
      await nextTick()
      expect(mock_createDraggable).toHaveBeenCalledOnce()
      expect(record.found).toBe(true)
      wrapper.unmount()
    }
  )

  it("recreates the draggable when a ref inside the options changes", async () => {
    const el = document.createElement("div")
    const value = ref(1)
    withSetup(() => useDraggable(el, { releaseMass: value }))
    await nextTick()
    expect(mock_createDraggable).toHaveBeenCalledOnce()
    expect(mock_createDraggable).toHaveBeenCalledWith(el, { releaseMass: 1 })
    value.value = 2
    await nextTick()
    expect(mock_createDraggable).toHaveBeenCalledTimes(2)
    expect(mock_createDraggable).toHaveBeenLastCalledWith(el, { releaseMass: 2 })
  })

  it("builds once, with the element, from a container template ref put straight into the options", async () => {
    let container_el: HTMLElement | null = null
    const wrapper = mount(
      defineComponent({
        setup() {
          const box = useTemplateRef<HTMLElement>("box")
          const container = useTemplateRef<HTMLElement>("container")
          useDraggable(box, { container, containerPadding: 10 })
          onMounted(() => (container_el = container.value))
          return () => h("div", { ref: "container" }, [h("div", { ref: "box" })])
        },
      })
    )
    await nextTick()
    expect(mock_createDraggable).toHaveBeenCalledOnce()
    expect(mock_createDraggable.mock.calls[0][1]).toEqual({ container: container_el, containerPadding: 10 })
    expect(container_el).toBeInstanceOf(HTMLDivElement)
    wrapper.unmount()
  })

  it("resolves a component template ref in the options to the component's root element", async () => {
    const Stage = defineComponent({ setup: () => () => h("section", { class: "stage" }) })
    const wrapper = mount(
      defineComponent({
        setup() {
          const box = useTemplateRef<HTMLElement>("box")
          const container = useTemplateRef<InstanceType<typeof Stage>>("container")
          useDraggable(box, { container })
          return () => h("div", [h(Stage, { ref: "container" }), h("div", { ref: "box" })])
        },
      })
    )
    await nextTick()
    expect(mock_createDraggable).toHaveBeenCalledOnce()
    expect(mock_createDraggable.mock.calls[0][1]?.container).toBe(wrapper.find(".stage").element)
    wrapper.unmount()
  })
})