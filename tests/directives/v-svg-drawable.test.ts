import { describe, it, expect, vi, beforeEach } from "vite-plus/test"
import { defineComponent, nextTick, ref } from "vue"
import { vSvgDrawable } from "@lib"
import { makeAnimationMock } from "../mocks"
import { mountDirective } from "../utils"
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

async function mountWithDirective(opts: object | undefined) {
  return mountDirective(
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

  it("calls svg.createDrawable on mount", async () => {
    await mountWithDirective({ draw: "0 1", duration: 1200 })
    expect(mock_svg.createDrawable).toHaveBeenCalledOnce()
  })

  it("calls animate with the drawable proxy and params on mount", async () => {
    await mountWithDirective({ draw: "0 1", duration: 1200 })
    expect(mock_animate).toHaveBeenCalledOnce()
    expect(mock_animate).toHaveBeenCalledWith(mock_drawable, { draw: "0 1", duration: 1200 })
  })

  it("does not call animate when no params are provided", async () => {
    await mountWithDirective(undefined)
    expect(mock_svg.createDrawable).toHaveBeenCalledOnce()
    expect(mock_animate).not.toHaveBeenCalled()
  })

  it("cancels and reverts previous animation and recreates when binding value changes", async () => {
    const options = ref<object | undefined>({ draw: "0 1" })
    await mountDirective(
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

  it("resets what createDrawable wrote before recreating, keeping the user's own attributes (regression: skipped its first paint)", async () => {
    const options = ref<object>({ draw: "0 1" })
    const wrapper = await mountDirective(
      defineComponent({
        directives: { svgDrawable: vSvgDrawable },
        template: '<svg><path v-svg-drawable="options" stroke-dasharray="4 2" /></svg>',
        setup() {
          return { options }
        },
      })
    )
    const path = wrapper.find("path").element as SVGPathElement
    let attrs_at_recreate: Record<string, string | null> = {}
    mock_svg.createDrawable.mockImplementationOnce((el: unknown) => {
      const target = el as SVGPathElement
      attrs_at_recreate = {
        pathLength: target.getAttribute("pathLength"),
        dasharray: target.getAttribute("stroke-dasharray"),
        dashoffset: target.getAttribute("stroke-dashoffset"),
        linecap: target.style.getPropertyValue("stroke-linecap"),
      }
      return [mock_drawable] as never
    })
    // What a real createDrawable() + animation leave on the element
    path.setAttribute("pathLength", "1000")
    path.setAttribute("stroke-dasharray", "500 510")
    path.setAttribute("stroke-dashoffset", "-250")
    path.style.setProperty("stroke-linecap", "butt")

    options.value = { draw: "0 0.5" }
    await nextTick()

    expect(attrs_at_recreate).toEqual({ pathLength: null, dasharray: "4 2", dashoffset: null, linecap: "" })
  })

  it("does not recreate when binding value reference is unchanged", async () => {
    const stable_opts = { draw: "0 1" }
    const trigger = ref(0)
    await mountDirective(
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

  it("does not recreate when an inline binding re-renders with the same content", async () => {
    const trigger = ref(0)
    await mountDirective(
      defineComponent({
        directives: { svgDrawable: vSvgDrawable },
        template: `<svg><path v-svg-drawable="{ draw: ['0 0', '0 1'], duration: 800 }" :data-x="trigger" /></svg>`,
        setup() {
          return { trigger }
        },
      })
    )
    mock_svg.createDrawable.mockClear()
    trigger.value++
    await nextTick()
    expect(mock_svg.createDrawable).not.toHaveBeenCalled()
  })

  it("cancels and reverts animation on unmount", async () => {
    const wrapper = await mountWithDirective({ draw: "0 1" })
    mock_animation.cancel.mockClear()
    mock_animation.revert.mockClear()
    wrapper.unmount()
    expect(mock_animation.cancel).toHaveBeenCalledOnce()
    expect(mock_animation.revert).toHaveBeenCalledOnce()
  })

  it("does not throw on unmount when no params were provided", async () => {
    const wrapper = await mountWithDirective(undefined)
    expect(() => wrapper.unmount()).not.toThrow()
  })

  it("cancels and reverts when value changes to undefined", async () => {
    const options = ref<object | undefined>({ draw: "0 1" })
    await mountDirective(
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