import { describe, it, expect, vi, beforeEach } from "vitest"
import { defineComponent, nextTick, ref } from "vue"
import { mount } from "@vue/test-utils"
import { vAnimate } from "@lib"
import { makeAnimationMock } from "../mocks"
import { animate } from "animejs"

const mock_animate = vi.mocked(animate)
const mock_animation = makeAnimationMock()

vi.mock("animejs", () => ({
  animate: vi.fn(() => mock_animation),
}))

function mountWithDirective(opts: object | undefined, extra_data?: Record<string, unknown>) {
  return mount(
    defineComponent({
      directives: { animate: vAnimate },
      template: '<div v-animate="opts" v-bind="extra" />',
      setup() {
        return { opts, extra: extra_data ?? {} }
      },
    })
  )
}

describe("vAnimate", () => {
  beforeEach(() => {
    mock_animate.mockClear()
    Object.values(mock_animation).forEach(fn => fn.mockClear())
  })

  it("calls animate on mount when a value is provided", () => {
    const wrapper = mountWithDirective({ translateX: 100 })
    expect(mock_animate).toHaveBeenCalledOnce()
    expect(mock_animate).toHaveBeenCalledWith(wrapper.element, { translateX: 100 })
  })

  it("does not call animate on mount when no value is provided", () => {
    mountWithDirective(undefined)
    expect(mock_animate).not.toHaveBeenCalled()
  })

  it("recreates animation when binding value reference changes", async () => {
    const options = ref<object | undefined>({ translateX: 100 })
    const wrapper = mount(
      defineComponent({
        directives: { animate: vAnimate },
        template: '<div v-animate="options" />',
        setup() {
          return { options }
        },
      })
    )
    mock_animate.mockClear()
    options.value = { translateX: 200 }
    await nextTick()
    expect(mock_animate).toHaveBeenCalledOnce()
    expect(mock_animate).toHaveBeenCalledWith(wrapper.element, { translateX: 200 })
  })

  it("does not recreate animation when binding value reference is unchanged", async () => {
    const stable_opts = { translateX: 100 }
    const trigger = ref(0)
    mount(
      defineComponent({
        directives: { animate: vAnimate },
        template: '<div v-animate="stableOpts" :data-x="trigger" />',
        setup() {
          return { stableOpts: stable_opts, trigger }
        },
      })
    )
    mock_animate.mockClear()
    trigger.value++ // causes re-render without changing the v-animate binding reference
    await nextTick()
    expect(mock_animate).not.toHaveBeenCalled()
  })

  it("cancels and reverts previous animation before recreating", async () => {
    const options = ref({ translateX: 100 })
    mount(
      defineComponent({
        directives: { animate: vAnimate },
        template: '<div v-animate="options" />',
        setup() {
          return { options }
        },
      })
    )
    mock_animation.cancel.mockClear()
    mock_animation.revert.mockClear()
    options.value = { translateX: 200 }
    await nextTick()
    expect(mock_animation.cancel).toHaveBeenCalledOnce()
    expect(mock_animation.revert).toHaveBeenCalledOnce()
  })

  it("cancels and reverts animation on unmount", () => {
    const wrapper = mountWithDirective({ translateX: 100 })
    mock_animation.cancel.mockClear()
    mock_animation.revert.mockClear()
    wrapper.unmount()
    expect(mock_animation.cancel).toHaveBeenCalledOnce()
    expect(mock_animation.revert).toHaveBeenCalledOnce()
  })

  it("does not throw on unmount when no value was provided", () => {
    const wrapper = mountWithDirective(undefined)
    expect(() => wrapper.unmount()).not.toThrow()
  })

  it("does not call animate when value is set to undefined on update", async () => {
    const options = ref<object | undefined>({ translateX: 100 })
    mount(
      defineComponent({
        directives: { animate: vAnimate },
        template: '<div v-animate="options" />',
        setup() {
          return { options }
        },
      })
    )
    mock_animate.mockClear()
    options.value = undefined
    await nextTick()
    expect(mock_animate).not.toHaveBeenCalled()
  })

  it("cancels and reverts when value changes to undefined", async () => {
    const options = ref<object | undefined>({ translateX: 100 })
    mount(
      defineComponent({
        directives: { animate: vAnimate },
        template: '<div v-animate="options" />',
        setup() {
          return { options }
        },
      })
    )
    mock_animation.cancel.mockClear()
    mock_animation.revert.mockClear()
    options.value = undefined
    await nextTick()
    expect(mock_animation.cancel).toHaveBeenCalledOnce()
    expect(mock_animation.revert).toHaveBeenCalledOnce()
  })
})