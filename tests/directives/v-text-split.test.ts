import { describe, it, expect, vi, beforeEach, afterEach } from "vite-plus/test"
import { defineComponent, nextTick, ref } from "vue"
import { vTextSplit } from "@lib"
import { makeAnimationMock, makeTextSplitterMock } from "../mocks"
import { mountDirective } from "../utils"
import { animate, splitText } from "animejs"

const mock_animate = vi.mocked(animate)
const mock_split_text = vi.mocked(splitText)

let mock_animation = makeAnimationMock()
let mock_splitter = makeTextSplitterMock()

vi.mock("animejs", () => ({
  animate: vi.fn(() => mock_animation),
  splitText: vi.fn(() => mock_splitter),
}))

/** Stubs `document.fonts` with a `ready` promise that resolves when the returned function is called. */
function holdFonts(): () => Promise<void> {
  let resolveReady!: () => void
  const ready = new Promise<void>(resolve => (resolveReady = resolve))
  Object.defineProperty(document, "fonts", { value: { ready }, configurable: true })
  return async () => {
    resolveReady()
    await ready
  }
}

async function mountWithDirective(value: object | undefined) {
  return mountDirective(
    defineComponent({
      directives: { textSplit: vTextSplit },
      template: '<p v-text-split="value">Hello world</p>',
      setup() {
        return { value }
      },
    })
  )
}

describe("vTextSplit", () => {
  beforeEach(() => {
    mock_animation = makeAnimationMock()
    mock_splitter = makeTextSplitterMock()
    mock_animate.mockClear()
    mock_split_text.mockClear()
  })

  afterEach(() => {
    Reflect.deleteProperty(document, "fonts")
  })

  it("calls splitText on mount with the binding value (minus animation)", async () => {
    const wrapper = await mountWithDirective({ words: true, animation: { translateY: [20, 0] } })
    expect(mock_split_text).toHaveBeenCalledOnce()
    expect(mock_split_text).toHaveBeenCalledWith(wrapper.element, { words: true })
  })

  it("does not pass ssrHidden to splitText", async () => {
    const wrapper = await mountWithDirective({ words: true, ssrHidden: true })
    expect(mock_split_text).toHaveBeenCalledWith(wrapper.element, { words: true })
  })

  it("calls splitText with empty object when no value is provided", async () => {
    const wrapper = await mountWithDirective(undefined)
    expect(mock_split_text).toHaveBeenCalledWith(wrapper.element, {})
  })

  it("animates splitter.words when words: true", async () => {
    await mountWithDirective({ words: true, animation: { translateY: [20, 0], duration: 400 } })
    expect(mock_animate).toHaveBeenCalledOnce()
    expect(mock_animate).toHaveBeenCalledWith(mock_splitter.words, { translateY: [20, 0], duration: 400 })
  })

  it("animates splitter.chars when chars: true", async () => {
    await mountWithDirective({ chars: true, animation: { opacity: [0, 1] } })
    expect(mock_animate).toHaveBeenCalledWith(mock_splitter.chars, { opacity: [0, 1] })
  })

  it("animates splitter.lines when lines: true (deferred until fonts are ready)", async () => {
    const loadFonts = holdFonts()
    await mountWithDirective({ lines: true, animation: { translateX: [-20, 0] } })
    expect(mock_animate).not.toHaveBeenCalled()
    await loadFonts()
    expect(mock_animate).toHaveBeenCalledWith(mock_splitter.lines, { translateX: [-20, 0] })
  })

  it("lines: true — skips animation if element is unmounted before deferred callback runs", async () => {
    const loadFonts = holdFonts()
    const wrapper = await mountWithDirective({ lines: true, animation: { translateX: [-20, 0] } })
    wrapper.unmount()
    await loadFonts()
    expect(mock_animate).not.toHaveBeenCalled()
  })

  it("does not call animate when no animation is provided", async () => {
    await mountWithDirective({ words: true })
    expect(mock_animate).not.toHaveBeenCalled()
  })

  it("does not call animate when value is undefined", async () => {
    await mountWithDirective(undefined)
    expect(mock_animate).not.toHaveBeenCalled()
  })

  it("reverts splitter and cancels animation on unmount", async () => {
    const wrapper = await mountWithDirective({ words: true, animation: { translateY: [20, 0] } })
    mock_animation.cancel.mockClear()
    mock_splitter.revert.mockClear()
    wrapper.unmount()
    expect(mock_animation.cancel).toHaveBeenCalledOnce()
    expect(mock_splitter.revert).toHaveBeenCalledOnce()
  })

  it("reverts splitter on unmount even when no animation was created", async () => {
    const wrapper = await mountWithDirective({ words: true })
    wrapper.unmount()
    expect(mock_splitter.revert).toHaveBeenCalledOnce()
  })

  it("recreates splitter and animation when binding value changes", async () => {
    const value = ref<object>({ words: true, animation: { translateY: [20, 0] } })
    await mountDirective(
      defineComponent({
        directives: { textSplit: vTextSplit },
        template: '<p v-text-split="value">Hello</p>',
        setup() {
          return { value }
        },
      })
    )
    const first_splitter = mock_splitter
    const first_animation = mock_animation

    mock_splitter = makeTextSplitterMock()
    mock_animation = makeAnimationMock()

    value.value = { words: true, animation: { translateY: [40, 0] } }
    await nextTick()

    expect(first_animation.cancel).toHaveBeenCalledOnce()
    expect(first_splitter.revert).toHaveBeenCalledOnce()
    expect(mock_split_text).toHaveBeenCalledTimes(2)
    expect(mock_animate).toHaveBeenCalledTimes(2)
    expect(mock_animate).toHaveBeenLastCalledWith(mock_splitter.words, { translateY: [40, 0] })
  })

  it("does not recreate when binding value reference is unchanged", async () => {
    const stable = { words: true, animation: { translateY: [20, 0] } }
    const trigger = ref(0)
    await mountDirective(
      defineComponent({
        directives: { textSplit: vTextSplit },
        template: '<p v-text-split="stable" :data-t="trigger">Hello</p>',
        setup() {
          return { stable, trigger }
        },
      })
    )
    mock_split_text.mockClear()
    mock_animate.mockClear()
    trigger.value++
    await nextTick()
    expect(mock_split_text).not.toHaveBeenCalled()
    expect(mock_animate).not.toHaveBeenCalled()
  })
})