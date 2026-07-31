import { describe, it, expect, vi, beforeEach } from "vitest"
import { defineComponent, nextTick, ref } from "vue"
import { mount } from "@vue/test-utils"
import { vWaapi } from "@lib"
import { makeWaapiAnimationMock } from "../mocks"
import { waapi } from "animejs"

const mock_waapi = vi.mocked(waapi)
const mock_animation = makeWaapiAnimationMock()

vi.mock("animejs", () => ({
  waapi: {
    animate: vi.fn(() => mock_animation),
  },
}))

function mountWithDirective(opts: object | undefined) {
  return mount(
    defineComponent({
      directives: { waapi: vWaapi },
      template: '<div v-waapi="opts" />',
      setup() {
        return { opts }
      },
    })
  )
}

describe("vWaapi", () => {
  beforeEach(() => {
    mock_waapi.animate.mockClear()
    Object.values(mock_animation).forEach(fn => fn.mockClear())
  })

  it("calls waapi.animate on mount with provided options", () => {
    const wrapper = mountWithDirective({ translateX: 250, duration: 800 })
    expect(mock_waapi.animate).toHaveBeenCalledOnce()
    expect(mock_waapi.animate).toHaveBeenCalledWith(wrapper.element, { translateX: 250, duration: 800 })
  })

  it("does not call waapi.animate on mount when no value is provided", () => {
    mountWithDirective(undefined)
    expect(mock_waapi.animate).not.toHaveBeenCalled()
  })

  it("cancels previous animation and recreates when binding value changes", async () => {
    const options = ref<object | undefined>({ translateX: 250 })
    const wrapper = mount(
      defineComponent({
        directives: { waapi: vWaapi },
        template: '<div v-waapi="options" />',
        setup() {
          return { options }
        },
      })
    )
    mock_animation.cancel.mockClear()
    mock_waapi.animate.mockClear()
    options.value = { translateX: 500 }
    await nextTick()
    expect(mock_animation.cancel).toHaveBeenCalledOnce()
    expect(mock_waapi.animate).toHaveBeenCalledOnce()
    expect(mock_waapi.animate).toHaveBeenCalledWith(wrapper.element, { translateX: 500 })
  })

  it("does not recreate when binding value reference is unchanged", async () => {
    const stable_opts = { translateX: 250 }
    const trigger = ref(0)
    mount(
      defineComponent({
        directives: { waapi: vWaapi },
        template: '<div v-waapi="stableOpts" :data-x="trigger" />',
        setup() {
          return { stableOpts: stable_opts, trigger }
        },
      })
    )
    mock_waapi.animate.mockClear()
    trigger.value++
    await nextTick()
    expect(mock_waapi.animate).not.toHaveBeenCalled()
  })

  it("restores originalStyle and cancels animation on update", async () => {
    const options = ref<object | undefined>({ translateX: 250 })
    const wrapper = mount(
      defineComponent({
        directives: { waapi: vWaapi },
        template: '<div v-waapi="options" style="color: red;" />',
        setup() {
          return { options }
        },
      })
    )
    const original_style = wrapper.element.style.cssText
    wrapper.element.style.cssText = "transform: translateX(250px);"
    mock_animation.cancel.mockClear()
    options.value = { translateX: 500 }
    await nextTick()
    expect(mock_animation.cancel).toHaveBeenCalledOnce()
    expect(wrapper.element.style.cssText).toBe(original_style)
  })

  it("cancels animation on unmount", () => {
    const wrapper = mountWithDirective({ translateX: 250 })
    mock_animation.cancel.mockClear()
    wrapper.unmount()
    expect(mock_animation.cancel).toHaveBeenCalledOnce()
  })

  it("does not throw on unmount when no value was provided", () => {
    const wrapper = mountWithDirective(undefined)
    expect(() => wrapper.unmount()).not.toThrow()
  })

  it("cancels animation when value changes to undefined", async () => {
    const options = ref<object | undefined>({ translateX: 250 })
    mount(
      defineComponent({
        directives: { waapi: vWaapi },
        template: '<div v-waapi="options" />',
        setup() {
          return { options }
        },
      })
    )
    mock_animation.cancel.mockClear()
    mock_waapi.animate.mockClear()
    options.value = undefined
    await nextTick()
    expect(mock_animation.cancel).toHaveBeenCalledOnce()
    expect(mock_waapi.animate).not.toHaveBeenCalled()
  })
})