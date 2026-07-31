import { describe, it, expect, vi, beforeEach } from "vitest"
import { defineComponent, nextTick, ref } from "vue"
import { mount } from "@vue/test-utils"
import { vSvgDrawable } from "@lib"
import { makeAnimationMock } from "../mocks"
import { animate, svg } from "animejs"

const mock_animate = vi.mocked(animate)
const mock_svg = vi.mocked(svg)
const mock_animation = makeAnimationMock()
const mock_drawable = {}

vi.mock("animejs", () => ({
  animate: vi.fn(() => mock_animation),
  svg: {
    createDrawable: vi.fn(() => [mock_drawable]),
  },
}))

function mountWithDirective(opts: object | undefined) {
  return mount(
    defineComponent({
      directives: { svgDrawable: vSvgDrawable },
      template: '<svg><path v-svg-drawable="opts" /></svg>',
      setup() {
        return { opts }
      },
    })
  )
}

describe("vSvgDrawable", () => {
  beforeEach(() => {
    mock_animate.mockClear()
    mock_svg.createDrawable.mockClear()
    Object.values(mock_animation).forEach(fn => fn.mockClear())
  })

  it("calls svg.createDrawable on mount", () => {
    mountWithDirective({ draw: "0 1", duration: 1200 })
    expect(mock_svg.createDrawable).toHaveBeenCalledOnce()
  })

  it("calls animate with the drawable proxy and params on mount", () => {
    mountWithDirective({ draw: "0 1", duration: 1200 })
    expect(mock_animate).toHaveBeenCalledOnce()
    expect(mock_animate).toHaveBeenCalledWith(mock_drawable, { draw: "0 1", duration: 1200 })
  })

  it("does not call animate when no params are provided", () => {
    mountWithDirective(undefined)
    expect(mock_svg.createDrawable).toHaveBeenCalledOnce()
    expect(mock_animate).not.toHaveBeenCalled()
  })

  it("cancels and reverts previous animation and recreates when binding value changes", async () => {
    const options = ref<object | undefined>({ draw: "0 1" })
    mount(
      defineComponent({
        directives: { svgDrawable: vSvgDrawable },
        template: '<svg><path v-svg-drawable="options" /></svg>',
        setup() {
          return { options }
        },
      })
    )
    mock_animation.cancel.mockClear()
    mock_animation.revert.mockClear()
    mock_animate.mockClear()
    mock_svg.createDrawable.mockClear()
    options.value = { draw: "0 0.5" }
    await nextTick()
    expect(mock_animation.cancel).toHaveBeenCalledOnce()
    expect(mock_animation.revert).toHaveBeenCalledOnce()
    expect(mock_svg.createDrawable).toHaveBeenCalledOnce()
    expect(mock_animate).toHaveBeenCalledOnce()
    expect(mock_animate).toHaveBeenCalledWith(mock_drawable, { draw: "0 0.5" })
  })

  it("does not recreate when binding value reference is unchanged", async () => {
    const stable_opts = { draw: "0 1" }
    const trigger = ref(0)
    mount(
      defineComponent({
        directives: { svgDrawable: vSvgDrawable },
        template: '<svg><path v-svg-drawable="stableOpts" :data-x="trigger" /></svg>',
        setup() {
          return { stableOpts: stable_opts, trigger }
        },
      })
    )
    mock_svg.createDrawable.mockClear()
    mock_animate.mockClear()
    trigger.value++
    await nextTick()
    expect(mock_svg.createDrawable).not.toHaveBeenCalled()
    expect(mock_animate).not.toHaveBeenCalled()
  })

  it("cancels and reverts animation on unmount", () => {
    const wrapper = mountWithDirective({ draw: "0 1" })
    mock_animation.cancel.mockClear()
    mock_animation.revert.mockClear()
    wrapper.unmount()
    expect(mock_animation.cancel).toHaveBeenCalledOnce()
    expect(mock_animation.revert).toHaveBeenCalledOnce()
  })

  it("does not throw on unmount when no params were provided", () => {
    const wrapper = mountWithDirective(undefined)
    expect(() => wrapper.unmount()).not.toThrow()
  })

  it("cancels and reverts when value changes to undefined", async () => {
    const options = ref<object | undefined>({ draw: "0 1" })
    mount(
      defineComponent({
        directives: { svgDrawable: vSvgDrawable },
        template: '<svg><path v-svg-drawable="options" /></svg>',
        setup() {
          return { options }
        },
      })
    )
    mock_animation.cancel.mockClear()
    mock_animation.revert.mockClear()
    mock_animate.mockClear()
    options.value = undefined
    await nextTick()
    expect(mock_animation.cancel).toHaveBeenCalledOnce()
    expect(mock_animation.revert).toHaveBeenCalledOnce()
    expect(mock_animate).not.toHaveBeenCalled()
  })
})