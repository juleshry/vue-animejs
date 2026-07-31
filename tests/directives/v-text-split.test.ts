import { describe, it, expect, vi, beforeEach } from "vitest"
import { defineComponent, nextTick, ref } from "vue"
import { mount } from "@vue/test-utils"
import { vTextSplit } from "@lib"
import { makeAnimationMock, makeTextSplitterMock } from "../mocks"
import { animate, splitText } from "animejs"

const mock_animate = vi.mocked(animate)
const mock_split_text = vi.mocked(splitText)

let mock_animation = makeAnimationMock()
let mock_splitter = makeTextSplitterMock()

vi.mock("animejs", () => ({
  animate: vi.fn(() => mock_animation),
  splitText: vi.fn(() => mock_splitter),
}))

function mountWithDirective(value: object | undefined) {
  return mount(
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

  it("calls splitText on mount with the binding value (minus animation)", () => {
    const wrapper = mountWithDirective({ words: true, animation: { translateY: [20, 0] } })
    expect(mock_split_text).toHaveBeenCalledOnce()
    expect(mock_split_text).toHaveBeenCalledWith(wrapper.element, { words: true })
  })

  it("calls splitText with empty object when no value is provided", () => {
    const wrapper = mountWithDirective(undefined)
    expect(mock_split_text).toHaveBeenCalledWith(wrapper.element, {})
  })

  it("animates splitter.words when words: true", () => {
    mountWithDirective({ words: true, animation: { translateY: [20, 0], duration: 400 } })
    expect(mock_animate).toHaveBeenCalledOnce()
    expect(mock_animate).toHaveBeenCalledWith(mock_splitter.words, { translateY: [20, 0], duration: 400 })
  })

  it("animates splitter.chars when chars: true", () => {
    mountWithDirective({ chars: true, animation: { opacity: [0, 1] } })
    expect(mock_animate).toHaveBeenCalledWith(mock_splitter.chars, { opacity: [0, 1] })
  })

  it("animates splitter.lines when lines: true (deferred via microtask)", async () => {
    mountWithDirective({ lines: true, animation: { translateX: [-20, 0] } })
    expect(mock_animate).not.toHaveBeenCalled()
    await Promise.resolve()
    expect(mock_animate).toHaveBeenCalledWith(mock_splitter.lines, { translateX: [-20, 0] })
  })

  it("lines: true — skips animation if element is unmounted before deferred callback runs", async () => {
    const wrapper = mountWithDirective({ lines: true, animation: { translateX: [-20, 0] } })
    wrapper.unmount()
    await Promise.resolve()
    expect(mock_animate).not.toHaveBeenCalled()
  })

  it("does not call animate when no animation is provided", () => {
    mountWithDirective({ words: true })
    expect(mock_animate).not.toHaveBeenCalled()
  })

  it("does not call animate when value is undefined", () => {
    mountWithDirective(undefined)
    expect(mock_animate).not.toHaveBeenCalled()
  })

  it("reverts splitter and cancels animation on unmount", () => {
    const wrapper = mountWithDirective({ words: true, animation: { translateY: [20, 0] } })
    mock_animation.cancel.mockClear()
    mock_splitter.revert.mockClear()
    wrapper.unmount()
    expect(mock_animation.cancel).toHaveBeenCalledOnce()
    expect(mock_splitter.revert).toHaveBeenCalledOnce()
  })

  it("reverts splitter on unmount even when no animation was created", () => {
    const wrapper = mountWithDirective({ words: true })
    wrapper.unmount()
    expect(mock_splitter.revert).toHaveBeenCalledOnce()
  })

  it("recreates splitter and animation when binding value changes", async () => {
    const value = ref<object>({ words: true, animation: { translateY: [20, 0] } })
    mount(
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
    mount(
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