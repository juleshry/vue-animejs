import { describe, it, expect, vi, beforeEach } from "vite-plus/test"
import { defineComponent, h, nextTick, ref, type ComponentPublicInstance } from "vue"
import { mount } from "@vue/test-utils"
import { useText } from "@lib"
import { expectInstanceStaysRaw, withSetup, mountWithTarget, recordTargetFound, type TargetForm } from "../utils"
import { makeTextSplitterMock } from "../mocks"
import { splitText } from "animejs"

const mock_splitText = vi.mocked(splitText)

const mock_splitter = makeTextSplitterMock()

vi.mock("animejs", () => ({
  splitText: vi.fn(() => mock_splitter),
}))

describe("useText", () => {
  beforeEach(() => {
    mock_splitText.mockClear()
    mock_splitter.revert.mockClear()
    mock_splitter.refresh.mockClear()
  })

  it("creates splitter on mount for a non-ref target", async () => {
    const el = document.createElement("p")
    el.textContent = "Hello world"
    const [result] = withSetup(() => useText(el))
    await nextTick()
    expect(mock_splitText).toHaveBeenCalledWith(el, undefined)
    expect(result.splitter.value).toBeDefined()
  })

  it("does not deep-wrap the splitter instance (regression: readonly(shallowRef) stack overflow)", async () => {
    const el = document.createElement("p")
    el.textContent = "Hello world"
    const [result] = withSetup(() => useText(el))
    await nextTick()
    expectInstanceStaysRaw(result.splitter.value)
  })

  it("waits for a ref target that is still empty at mount", async () => {
    const el_ref = ref<HTMLElement | null>(null)
    withSetup(() => useText(el_ref))
    await nextTick()
    expect(mock_splitText).not.toHaveBeenCalled()
  })

  it("passes params to splitText", async () => {
    const el = document.createElement("p")
    const params = { lines: true, words: true }
    withSetup(() => useText(el, params))
    await nextTick()
    expect(mock_splitText).toHaveBeenCalledWith(el, params)
  })

  it("lines computed ref reflects splitter.lines", async () => {
    const el = document.createElement("p")
    const [result] = withSetup(() => useText(el))
    await nextTick()
    expect(result.lines.value).toBe(mock_splitter.lines)
  })

  it("words computed ref reflects splitter.words", async () => {
    const el = document.createElement("p")
    const [result] = withSetup(() => useText(el))
    await nextTick()
    expect(result.words.value).toBe(mock_splitter.words)
  })

  it("chars computed ref reflects splitter.chars", async () => {
    const el = document.createElement("p")
    const [result] = withSetup(() => useText(el))
    await nextTick()
    expect(result.chars.value).toBe(mock_splitter.chars)
  })

  it("lines/words/chars are empty arrays before target resolves", () => {
    const el_ref = ref<HTMLElement | null>(null)
    const [result] = withSetup(() => useText(el_ref))
    expect(result.lines.value).toEqual([])
    expect(result.words.value).toEqual([])
    expect(result.chars.value).toEqual([])
  })

  it("delegates revert to the splitter instance", async () => {
    const el = document.createElement("p")
    const [result] = withSetup(() => useText(el))
    await nextTick()
    result.revert()
    expect(mock_splitter.revert).toHaveBeenCalledOnce()
  })

  it("delegates refresh to the splitter instance", async () => {
    const el = document.createElement("p")
    const [result] = withSetup(() => useText(el))
    await nextTick()
    result.refresh()
    expect(mock_splitter.refresh).toHaveBeenCalledOnce()
  })

  it("clears the splitter on unmount", async () => {
    const el = document.createElement("p")
    const [result, wrapper] = withSetup(() => useText(el))
    await nextTick()
    expect(result.splitter.value).toBeDefined()
    wrapper.unmount()
    expect(result.splitter.value).toBeUndefined()
  })

  it("skips splitText when element resolves to null", async () => {
    const el_ref = ref<HTMLElement | null>(null)
    const params = ref({})
    const [result] = withSetup(() => useText(el_ref, params))
    params.value = { lines: true }
    await nextTick()
    expect(mock_splitText).not.toHaveBeenCalled()
    expect(result.splitter.value).toBeUndefined()
  })

  it("resolves a Vue component ref to its $el", async () => {
    const ChildComp = defineComponent({ render: () => h("p", "Hello world") })
    const wrapper = mount(
      defineComponent({
        setup() {
          const child_ref = ref<ComponentPublicInstance | null>(null)
          useText(child_ref)
          return () => h(ChildComp, { ref: child_ref })
        },
      })
    )
    await nextTick()
    expect(mock_splitText).toHaveBeenCalledWith(wrapper.findComponent(ChildComp).element, undefined)
  })

  // Regression: a non-ref target used to be resolved in setup(), before the component's own template
  // existed (and during hydration, before Vue had hydrated the server HTML).
  it.each<TargetForm>(["selector", "template ref"])(
    "builds exactly once on mount from the component's own template (%s)",
    async form => {
      const record = recordTargetFound(mock_splitText)
      const wrapper = mountWithTarget(form, target => useText(target as Parameters<typeof useText>[0], { words: true }))
      await nextTick()
      expect(mock_splitText).toHaveBeenCalledOnce()
      expect(record.found).toBe(true)
      wrapper.unmount()
    }
  )
})