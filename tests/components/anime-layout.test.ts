import { describe, it, expect, vi, beforeEach } from "vite-plus/test"
import { defineComponent, h, markRaw, nextTick, ref } from "vue"
import { mount } from "@vue/test-utils"
import { AnimeLayout, type AnimeLayoutExposed } from "@lib"
import { makeLayoutMock } from "../mocks"
import { createLayout } from "animejs"

const mock_createLayout = vi.mocked(createLayout)

const mock_layout = makeLayoutMock()

vi.mock("animejs", () => ({
  createLayout: vi.fn(() => mock_layout),
}))

describe("AnimeLayout", () => {
  beforeEach(() => {
    mock_createLayout.mockClear()
    Object.values(mock_layout).forEach(fn => fn.mockClear())
  })

  it("renders the default slot without slot props", () => {
    const slot = vi.fn(() => h("span"))
    mount(AnimeLayout, { slots: { default: slot } })
    expect(slot).toHaveBeenCalledWith()
  })

  it("renders a div root with the slot content by default", () => {
    const wrapper = mount(AnimeLayout, { slots: { default: () => h("span", "item") } })
    expect(wrapper.html()).toBe("<div><span>item</span></div>")
  })

  it("renders the tag given in `as`", () => {
    const wrapper = mount(AnimeLayout, { props: { as: "ul" }, slots: { default: () => h("li") } })
    expect(wrapper.element.tagName).toBe("UL")
  })

  it("renders a component given in `as`, with the slot inside its root", async () => {
    const List = defineComponent(
      (_, { slots }) =>
        () =>
          h("ul", { class: "list" }, slots.default?.())
    )
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    // Rendered from a parent, as in a template: mount()'s `props` would be made reactive, component included
    const wrapper = mount(defineComponent(() => () => h(AnimeLayout, { as: List }, () => h("li", "item"))))
    await nextTick()
    expect(wrapper.html()).toBe('<ul class="list">\n  <li>item</li>\n</ul>')
    expect(warn).not.toHaveBeenCalled()
    // The layout tracks the component's root element, resolved from the instance
    expect(mock_createLayout).toHaveBeenCalledWith(wrapper.find("ul").element, {})
  })

  it("re-creates the layout when `as` switches from a tag to a component", async () => {
    const List = defineComponent(
      (_, { slots }) =>
        () =>
          h("ul", slots.default?.())
    )
    const wrapper = mount(AnimeLayout, { props: { as: "div" } })
    await nextTick()
    // markRaw: setProps() makes its values reactive, which a component imported in a template never is
    await wrapper.setProps({ as: markRaw(List) })
    expect(mock_createLayout).toHaveBeenCalledTimes(2)
    expect(mock_createLayout).toHaveBeenLastCalledWith(wrapper.find("ul").element, {})
  })

  it("creates the layout on mount from its root element and options", async () => {
    const options = { duration: 300 }
    const wrapper = mount(AnimeLayout, { props: { options } })
    await nextTick()
    expect(mock_createLayout).toHaveBeenCalledOnce()
    expect(mock_createLayout).toHaveBeenCalledWith(wrapper.element, options)
  })

  it("creates the layout with empty options when none are given", async () => {
    mount(AnimeLayout)
    await nextTick()
    expect(mock_createLayout).toHaveBeenCalledWith(expect.any(HTMLElement), {})
  })

  it("re-creates the layout when the options change", async () => {
    const wrapper = mount(AnimeLayout, { props: { options: { duration: 300 } } })
    await nextTick()
    mock_layout.revert.mockClear()
    await wrapper.setProps({ options: { duration: 600 } })
    expect(mock_createLayout).toHaveBeenCalledTimes(2)
    expect(mock_createLayout).toHaveBeenLastCalledWith(wrapper.element, { duration: 600 })
    expect(mock_layout.revert).toHaveBeenCalledOnce()
  })

  it("re-creates the layout when the root tag changes", async () => {
    const wrapper = mount(AnimeLayout, { props: { as: "div" } })
    await nextTick()
    await wrapper.setProps({ as: "ul" })
    expect(mock_createLayout).toHaveBeenCalledTimes(2)
    expect(mock_createLayout).toHaveBeenLastCalledWith(wrapper.element, {})
  })

  // Regression guard: `:options="{ ... }"` is a new object on every parent render
  it("does not re-create the layout for an inline options literal on an unrelated re-render", async () => {
    const count = ref(0)
    mount(
      defineComponent({
        setup() {
          return () => h("div", [h("p", count.value), h(AnimeLayout, { options: { duration: 300 } })])
        },
      })
    )
    await nextTick()
    count.value++
    await nextTick()
    expect(mock_createLayout).toHaveBeenCalledOnce()
  })

  it("reverts the layout on unmount", async () => {
    const wrapper = mount(AnimeLayout)
    await nextTick()
    mock_layout.revert.mockClear()
    wrapper.unmount()
    expect(mock_layout.revert).toHaveBeenCalled()
  })

  // expose() goes through proxyRefs, so a parent template ref sees `layout` unwrapped, as with defineExpose
  it("exposes the useLayout controls on the component instance, with `layout` unwrapped", async () => {
    const wrapper = mount(AnimeLayout)
    await nextTick()
    // @vue/test-utils types `vm` from its own mount overloads, not from the component's constructor
    const vm = wrapper.vm as unknown as AnimeLayoutExposed
    vm.record()
    vm.animate({ duration: 300 })
    const cb = vi.fn()
    vm.update(cb, { duration: 300 })
    vm.revert()
    expect(mock_layout.record).toHaveBeenCalledOnce()
    expect(mock_layout.animate).toHaveBeenCalledWith({ duration: 300 })
    expect(mock_layout.update).toHaveBeenCalledWith(cb, { duration: 300 })
    expect(mock_layout.revert).toHaveBeenCalled()
    expect(vm.layout).toBe(mock_layout)
  })
})