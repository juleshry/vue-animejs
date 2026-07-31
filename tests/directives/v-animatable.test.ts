import { describe, it, expect, vi, beforeEach } from "vitest"
import { defineComponent, nextTick, ref } from "vue"
import { mount } from "@vue/test-utils"
import { vAnimatable } from "@lib"
import { createAnimatable } from "animejs"

const mock_create_animatable = vi.mocked(createAnimatable)

function makeAnimatableMock() {
  return {
    x: vi.fn().mockReturnThis(),
    y: vi.fn().mockReturnThis(),
    opacity: vi.fn().mockReturnThis(),
    revert: vi.fn().mockReturnThis(),
  }
}

let mock_animatable = makeAnimatableMock()

vi.mock("animejs", () => ({
  createAnimatable: vi.fn(() => mock_animatable),
}))

function mountWithDirective(value: object | undefined) {
  return mount(
    defineComponent({
      directives: { animatable: vAnimatable },
      template: '<div v-animatable="value" />',
      setup() {
        return { value }
      },
    })
  )
}

describe("vAnimatable", () => {
  beforeEach(() => {
    mock_animatable = makeAnimatableMock()
    mock_create_animatable.mockClear()
  })

  it("calls createAnimatable on mount with the full binding value", () => {
    const wrapper = mountWithDirective({ x: 0, duration: 600, ease: "out(3)" })
    expect(mock_create_animatable).toHaveBeenCalledOnce()
    expect(mock_create_animatable).toHaveBeenCalledWith(wrapper.element, { x: 0, duration: 600, ease: "out(3)" })
  })

  it("calls createAnimatable with empty object when no value is provided", () => {
    const wrapper = mountWithDirective(undefined)
    expect(mock_create_animatable).toHaveBeenCalledOnce()
    expect(mock_create_animatable).toHaveBeenCalledWith(wrapper.element, {})
  })

  it("calls property setters with initial values on mount", () => {
    mountWithDirective({ x: 100, opacity: 0.5 })
    expect(mock_animatable.x).toHaveBeenCalledWith(100)
    expect(mock_animatable.opacity).toHaveBeenCalledWith(0.5)
  })

  it("calls setters only for changed properties on update", async () => {
    const value = ref({ x: 0, y: 0, duration: 600 })
    mount(
      defineComponent({
        directives: { animatable: vAnimatable },
        template: '<div v-animatable="value" />',
        setup() {
          return { value }
        },
      })
    )
    mock_animatable.x.mockClear()
    mock_animatable.y.mockClear()
    value.value = { x: 200, y: 0, duration: 600 }
    await nextTick()
    expect(mock_animatable.x).toHaveBeenCalledWith(200)
    expect(mock_animatable.y).not.toHaveBeenCalled()
  })

  it("does not update when binding value reference is unchanged", async () => {
    const stable = { x: 0, duration: 600 }
    const trigger = ref(0)
    mount(
      defineComponent({
        directives: { animatable: vAnimatable },
        template: '<div v-animatable="stable" :data-t="trigger" />',
        setup() {
          return { stable, trigger }
        },
      })
    )
    mock_animatable.x.mockClear()
    trigger.value++
    await nextTick()
    expect(mock_animatable.x).not.toHaveBeenCalled()
  })

  it("recreates the animatable when a default option changes", async () => {
    const value = ref({ x: 100, duration: 600 })
    const wrapper = mount(
      defineComponent({
        directives: { animatable: vAnimatable },
        template: '<div v-animatable="value" />',
        setup() {
          return { value }
        },
      })
    )
    const first_instance = mock_animatable
    mock_create_animatable.mockClear()

    value.value = { x: 100, duration: 1200 }
    await nextTick()

    expect(first_instance.revert).toHaveBeenCalledOnce()
    expect(mock_create_animatable).toHaveBeenCalledOnce()
    expect(mock_create_animatable).toHaveBeenCalledWith(wrapper.element, { x: 100, duration: 1200 })
  })

  it("applies all props after recreating on option change", async () => {
    const value = ref({ x: 100, duration: 600 })
    mount(
      defineComponent({
        directives: { animatable: vAnimatable },
        template: '<div v-animatable="value" />',
        setup() {
          return { value }
        },
      })
    )
    mock_animatable.x.mockClear()
    value.value = { x: 100, duration: 1200 }
    await nextTick()
    expect(mock_animatable.x).toHaveBeenCalledWith(100)
  })

  it("reverts the instance on unmount", () => {
    const wrapper = mountWithDirective({ x: 0 })
    mock_animatable.revert.mockClear()
    wrapper.unmount()
    expect(mock_animatable.revert).toHaveBeenCalledOnce()
  })
})