import { describe, it, expect, vi, beforeEach } from "vite-plus/test"
import { defineComponent, h, markRaw, nextTick, ref } from "vue"
import { mount } from "@vue/test-utils"
import { AnimeScope, type AnimeScopeExposed } from "@lib"
import { makeScopeMock } from "../mocks"
import { createScope } from "animejs"

const mock_createScope = vi.mocked(createScope)

const mock_scope = makeScopeMock()

vi.mock("animejs", () => ({
  createScope: vi.fn(() => mock_scope),
}))

describe("AnimeScope", () => {
  beforeEach(() => {
    mock_createScope.mockClear()
    Object.values(mock_scope).forEach(fn => fn.mockClear())
  })

  it("renders the default slot without slot props", () => {
    const slot = vi.fn(() => h("span"))
    mount(AnimeScope, { slots: { default: slot } })
    expect(slot).toHaveBeenCalledWith()
  })

  it("renders a div root with the slot content by default", () => {
    const wrapper = mount(AnimeScope, { slots: { default: () => h("span", "item") } })
    expect(wrapper.html()).toBe("<div><span>item</span></div>")
  })

  it("renders the tag given in `as`", () => {
    const wrapper = mount(AnimeScope, { props: { as: "section" } })
    expect(wrapper.element.tagName).toBe("SECTION")
  })

  it("creates the scope on mount, rooted on its root element, with its options", async () => {
    const options = { defaults: { duration: 300 } }
    const wrapper = mount(AnimeScope, { props: { options } })
    await nextTick()
    expect(mock_createScope).toHaveBeenCalledOnce()
    expect(mock_createScope).toHaveBeenCalledWith({ ...options, root: wrapper.element })
  })

  it("roots the scope on the element a component given in `as` renders", async () => {
    const Section = defineComponent(
      (_, { slots }) =>
        () =>
          h("section", { class: "s" }, slots.default?.())
    )
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    // Rendered from a parent, as in a template: mount()'s `props` would be made reactive, component included
    const wrapper = mount(defineComponent(() => () => h(AnimeScope, { as: Section }, () => h("p"))))
    await nextTick()
    expect(wrapper.html()).toBe('<section class="s">\n  <p></p>\n</section>')
    expect(warn).not.toHaveBeenCalled()
    expect(mock_createScope).toHaveBeenCalledWith({ root: wrapper.find("section").element })
  })

  it("re-creates the scope when the options change", async () => {
    const wrapper = mount(AnimeScope, { props: { options: { defaults: { duration: 300 } } } })
    await nextTick()
    await wrapper.setProps({ options: { defaults: { duration: 600 } } })
    expect(mock_createScope).toHaveBeenCalledTimes(2)
    expect(mock_createScope).toHaveBeenLastCalledWith({ defaults: { duration: 600 }, root: wrapper.element })
    expect(mock_scope.revert).toHaveBeenCalledOnce()
  })

  it("re-creates the scope on the new root when `as` changes", async () => {
    const Section = defineComponent(
      (_, { slots }) =>
        () =>
          h("section", slots.default?.())
    )
    const wrapper = mount(AnimeScope, { props: { as: "div" } })
    await nextTick()
    // markRaw: setProps() makes its values reactive, which a component imported in a template never is
    await wrapper.setProps({ as: markRaw(Section) })
    expect(mock_createScope).toHaveBeenCalledTimes(2)
    expect(mock_createScope).toHaveBeenLastCalledWith({ root: wrapper.find("section").element })
  })

  // Regression guard: `:options="{ ... }"` is a new object on every parent render
  it("does not re-create the scope for an inline options literal on an unrelated re-render", async () => {
    const count = ref(0)
    mount(
      defineComponent({
        setup() {
          return () => h("div", [h("p", count.value), h(AnimeScope, { options: { defaults: { duration: 300 } } })])
        },
      })
    )
    await nextTick()
    count.value++
    await nextTick()
    expect(mock_createScope).toHaveBeenCalledOnce()
  })

  it("reverts the scope on unmount", async () => {
    const wrapper = mount(AnimeScope)
    await nextTick()
    wrapper.unmount()
    expect(mock_scope.revert).toHaveBeenCalled()
  })

  // expose() goes through proxyRefs, so a parent template ref sees `scope` unwrapped, as with defineExpose
  it("exposes the useScope controls on the component instance, with `scope` unwrapped", async () => {
    const wrapper = mount(AnimeScope)
    await nextTick()
    // @vue/test-utils types `vm` from its own mount overloads, not from the component's constructor
    const vm = wrapper.vm as unknown as AnimeScopeExposed
    const method = vi.fn()
    vm.add(method)
    vm.addOnce(method)
    vm.registerMethod("go", method)
    vm.refresh()
    vm.revert()
    expect(mock_scope.add).toHaveBeenCalledWith(method)
    expect(mock_scope.add).toHaveBeenCalledWith("go", method)
    expect(mock_scope.addOnce).toHaveBeenCalledWith(method)
    expect(mock_scope.refresh).toHaveBeenCalledOnce()
    expect(mock_scope.revert).toHaveBeenCalledOnce()
    expect(vm.scope).toBe(mock_scope)
  })

  it("lets a parent add methods from its own onMounted, after the scope exists", async () => {
    const method = vi.fn()
    mount(
      defineComponent({
        setup() {
          const scope = ref<AnimeScopeExposed>()
          // Children mount before their parent, so the scope is already created here
          return { scope, method }
        },
        mounted() {
          this.scope?.add(this.method)
        },
        render() {
          return h(AnimeScope, { ref: "scope" })
        },
      })
    )
    await nextTick()
    expect(mock_scope.add).toHaveBeenCalledWith(method)
  })
})