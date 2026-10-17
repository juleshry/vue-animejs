import { describe, it, expect, vi, beforeEach } from "vite-plus/test"
import { defineComponent, nextTick, ref } from "vue"
import { vWaapi } from "@lib"
import { makeWaapiAnimationMock } from "../mocks"
import { mountDirective } from "../utils"
import { waapi } from "animejs"

const mock_waapi = vi.mocked(waapi)
const mock_animation = makeWaapiAnimationMock()

vi.mock("animejs", () => ({
  waapi: {
    animate: vi.fn(() => mock_animation),
  },
}))

async function mountWithDirective(opts: object | undefined) {
  return mountDirective(
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

  it("calls waapi.animate on mount with provided options", async () => {
    const wrapper = await mountWithDirective({ translateX: 250, duration: 800 })
    expect(mock_waapi.animate).toHaveBeenCalledOnce()
    expect(mock_waapi.animate).toHaveBeenCalledWith(wrapper.element, { translateX: 250, duration: 800 })
  })

  it("does not call waapi.animate on mount when no value is provided", async () => {
    await mountWithDirective(undefined)
    expect(mock_waapi.animate).not.toHaveBeenCalled()
  })

  it("cancels previous animation and recreates when binding value changes", async () => {
    const options = ref<object | undefined>({ translateX: 250 })
    const wrapper = await mountDirective(
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
    await mountDirective(
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

  it("does not recreate when an inline binding re-renders with the same content", async () => {
    const trigger = ref(0)
    await mountDirective(
      defineComponent({
        directives: { waapi: vWaapi },
        template: '<div v-waapi="{ translateX: [0, 250], duration: 800 }" :data-x="trigger" />',
        setup() {
          return { trigger }
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
    const wrapper = await mountDirective(
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

  // Regression: originalStyle used to be read after waapi.animate(), capturing the styles it writes
  it("restores the style from before the animation was created on unmount", async () => {
    mock_waapi.animate.mockImplementationOnce(target => {
      ;(target as HTMLElement).style.transform = "translateX(var(--translateX))"
      return mock_animation as never
    })
    const wrapper = await mountDirective(
      defineComponent({
        directives: { waapi: vWaapi },
        template: '<div v-waapi="{ translateX: 250 }" style="color: red;" />',
      })
    )
    const element = wrapper.element as HTMLElement
    wrapper.unmount()
    expect(element.style.cssText).toBe("color: red;")
  })

  it("cancels animation on unmount", async () => {
    const wrapper = await mountWithDirective({ translateX: 250 })
    mock_animation.cancel.mockClear()
    wrapper.unmount()
    expect(mock_animation.cancel).toHaveBeenCalledOnce()
  })

  it("does not throw on unmount when no value was provided", async () => {
    const wrapper = await mountWithDirective(undefined)
    expect(() => wrapper.unmount()).not.toThrow()
  })

  it("cancels animation when value changes to undefined", async () => {
    const options = ref<object | undefined>({ translateX: 250 })
    await mountDirective(
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