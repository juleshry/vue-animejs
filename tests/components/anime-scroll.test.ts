import { describe, it, expect, vi, beforeEach } from "vite-plus/test"
import { defineComponent, h, markRaw, nextTick, ref, useTemplateRef } from "vue"
import { mount } from "@vue/test-utils"
import { AnimeScroll, type AnimeScrollExposed } from "@lib"
import { makeScrollObserverMock } from "../mocks"
import { onScroll } from "animejs"

const mock_onScroll = vi.mocked(onScroll)

const mock_observer = makeScrollObserverMock()

vi.mock("animejs", () => ({
  onScroll: vi.fn(() => mock_observer),
}))

describe("AnimeScroll", () => {
  beforeEach(() => {
    mock_onScroll.mockClear()
    Object.values(mock_observer).forEach(fn => fn.mockClear())
  })

  it("renders the default slot without slot props", () => {
    const slot = vi.fn(() => h("span"))
    mount(AnimeScroll, { slots: { default: slot } })
    expect(slot).toHaveBeenCalledWith()
  })

  it("renders a div root with the slot content by default", () => {
    const wrapper = mount(AnimeScroll, { slots: { default: () => h("span", "item") } })
    expect(wrapper.html()).toBe("<div><span>item</span></div>")
  })

  it("renders the tag given in `as`", () => {
    const wrapper = mount(AnimeScroll, { props: { as: "section" } })
    expect(wrapper.element.tagName).toBe("SECTION")
  })

  it("observes its root element in the document body by default, with its options", async () => {
    const options = { sync: true }
    const wrapper = mount(AnimeScroll, { props: { options } })
    await nextTick()
    expect(mock_onScroll).toHaveBeenCalledOnce()
    expect(mock_onScroll).toHaveBeenCalledWith({ ...options, container: "body", target: wrapper.element })
  })

  it("observes the element a component given in `as` renders", async () => {
    const Section = defineComponent(
      (_, { slots }) =>
        () =>
          h("section", { class: "s" }, slots.default?.())
    )
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    // Rendered from a parent, as in a template: mount()'s `props` would be made reactive, component included
    const wrapper = mount(defineComponent(() => () => h(AnimeScroll, { as: Section }, () => h("p"))))
    await nextTick()
    expect(wrapper.html()).toBe('<section class="s">\n  <p></p>\n</section>')
    expect(warn).not.toHaveBeenCalled()
    expect(mock_onScroll).toHaveBeenCalledWith({ container: "body", target: wrapper.find("section").element })
  })

  it("observes within the given container", async () => {
    const wrapper = mount(AnimeScroll, { props: { container: "#scroller" } })
    await nextTick()
    expect(mock_onScroll).toHaveBeenCalledWith({ container: "#scroller", target: wrapper.element })
  })

  it("waits for a container template ref to resolve instead of falling back to the body", async () => {
    const wrapper = mount(
      defineComponent(() => {
        const scroller = useTemplateRef<HTMLElement>("scroller")
        return () => h("div", { ref: "scroller" }, [h(AnimeScroll, { container: scroller.value })])
      })
    )
    await nextTick()
    await nextTick()
    expect(mock_onScroll).toHaveBeenCalledOnce()
    expect(mock_onScroll).toHaveBeenCalledWith({
      container: wrapper.element,
      target: wrapper.element.firstElementChild,
    })
  })

  it("re-creates the observer when the options change", async () => {
    const wrapper = mount(AnimeScroll, { props: { options: { sync: true } } })
    await nextTick()
    await wrapper.setProps({ options: { sync: false } })
    expect(mock_onScroll).toHaveBeenCalledTimes(2)
    expect(mock_onScroll).toHaveBeenLastCalledWith({ sync: false, container: "body", target: wrapper.element })
    expect(mock_observer.revert).toHaveBeenCalledOnce()
  })

  it("re-creates the observer on the new root when `as` changes", async () => {
    const Section = defineComponent(
      (_, { slots }) =>
        () =>
          h("section", slots.default?.())
    )
    const wrapper = mount(AnimeScroll, { props: { as: "div" } })
    await nextTick()
    // markRaw: setProps() makes its values reactive, which a component imported in a template never is
    await wrapper.setProps({ as: markRaw(Section) })
    expect(mock_onScroll).toHaveBeenCalledTimes(2)
    expect(mock_onScroll).toHaveBeenLastCalledWith({ container: "body", target: wrapper.find("section").element })
  })

  // Regression guard: `:options="{ ... }"` is a new object on every parent render
  it("does not re-create the observer for an inline options literal on an unrelated re-render", async () => {
    const count = ref(0)
    mount(
      defineComponent({
        setup() {
          return () => h("div", [h("p", count.value), h(AnimeScroll, { options: { sync: true, onEnter: () => {} } })])
        },
      })
    )
    await nextTick()
    count.value++
    await nextTick()
    expect(mock_onScroll).toHaveBeenCalledOnce()
  })

  it("reverts the observer on unmount", async () => {
    const wrapper = mount(AnimeScroll)
    await nextTick()
    wrapper.unmount()
    expect(mock_observer.revert).toHaveBeenCalled()
  })

  // expose() goes through proxyRefs, so a parent template ref sees `observer` / `autoplay` unwrapped
  it("exposes the useScroll controls on the component instance, with refs unwrapped", async () => {
    const wrapper = mount(AnimeScroll)
    await nextTick()
    // @vue/test-utils types `vm` from its own mount overloads, not from the component's constructor
    const vm = wrapper.vm as unknown as AnimeScrollExposed & { autoplayComputed?: unknown }
    expect(vm.observer).toBe(mock_observer)
    expect(vm.autoplay).toBe(mock_observer)
    expect(vm.autoplayComputed).toBeUndefined()
    const linked = {} as Parameters<AnimeScrollExposed["link"]>[0]
    vm.link(linked)
    vm.refresh()
    vm.debug()
    vm.removeDebug()
    vm.revert()
    expect(mock_observer.link).toHaveBeenCalledWith(linked)
    expect(mock_observer.refresh).toHaveBeenCalledOnce()
    expect(mock_observer.debug).toHaveBeenCalledOnce()
    expect(mock_observer.removeDebug).toHaveBeenCalledOnce()
    expect(mock_observer.revert).toHaveBeenCalledOnce()
  })
})