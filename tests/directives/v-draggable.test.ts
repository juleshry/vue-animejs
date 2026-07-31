import { describe, it, expect, vi, beforeEach } from "vitest"
import { defineComponent, nextTick, ref } from "vue"
import { mount } from "@vue/test-utils"
import { vDraggable } from "@lib"
import { makeDraggableMock } from "../mocks"
import { createDraggable } from "animejs"

const mock_create_draggable = vi.mocked(createDraggable)
const mock_draggable = makeDraggableMock()

vi.mock("animejs", () => ({
  createDraggable: vi.fn(() => mock_draggable),
}))

function mountWithDirective(opts: object | undefined) {
  return mount(
    defineComponent({
      directives: { draggable: vDraggable },
      template: '<div v-draggable="opts" />',
      setup() {
        return { opts }
      },
    })
  )
}

describe("vDraggable", () => {
  beforeEach(() => {
    mock_create_draggable.mockClear()
    Object.values(mock_draggable).forEach(fn => fn.mockClear())
  })

  it("calls createDraggable on mount with provided options", () => {
    const wrapper = mountWithDirective({ snap: [0, 100] })
    expect(mock_create_draggable).toHaveBeenCalledOnce()
    expect(mock_create_draggable).toHaveBeenCalledWith(wrapper.element, { snap: [0, 100] })
  })

  it("calls createDraggable on mount with empty options when no value is provided", () => {
    const wrapper = mountWithDirective(undefined)
    expect(mock_create_draggable).toHaveBeenCalledOnce()
    expect(mock_create_draggable).toHaveBeenCalledWith(wrapper.element, {})
  })

  it("reverts previous instance and recreates when binding value changes", async () => {
    const options = ref<object | undefined>({ snap: [0, 100] })
    const wrapper = mount(
      defineComponent({
        directives: { draggable: vDraggable },
        template: '<div v-draggable="options" />',
        setup() {
          return { options }
        },
      })
    )
    mock_draggable.revert.mockClear()
    mock_create_draggable.mockClear()
    options.value = { snap: [50, 150] }
    await nextTick()
    expect(mock_draggable.revert).toHaveBeenCalledOnce()
    expect(mock_create_draggable).toHaveBeenCalledOnce()
    expect(mock_create_draggable).toHaveBeenCalledWith(wrapper.element, { snap: [50, 150] })
  })

  it("does not recreate when binding value reference is unchanged", async () => {
    const stable_opts = { snap: [0, 100] }
    const trigger = ref(0)
    mount(
      defineComponent({
        directives: { draggable: vDraggable },
        template: '<div v-draggable="stableOpts" :data-x="trigger" />',
        setup() {
          return { stableOpts: stable_opts, trigger }
        },
      })
    )
    mock_create_draggable.mockClear()
    trigger.value++
    await nextTick()
    expect(mock_create_draggable).not.toHaveBeenCalled()
  })

  it("reverts instance on unmount", () => {
    const wrapper = mountWithDirective({ snap: [0, 100] })
    mock_draggable.revert.mockClear()
    wrapper.unmount()
    expect(mock_draggable.revert).toHaveBeenCalledOnce()
  })
})