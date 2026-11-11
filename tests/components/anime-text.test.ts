import { describe, it, expect, vi, beforeEach } from "vite-plus/test"
import { defineComponent, h, markRaw, nextTick, ref } from "vue"
import { mount } from "@vue/test-utils"
import { AnimeText, type AnimeTextExposed } from "@lib"
import { makeTextSplitterMock } from "../mocks"
import { splitText } from "animejs"

const mock_splitText = vi.mocked(splitText)

const mock_splitter = makeTextSplitterMock()

vi.mock("animejs", () => ({
  splitText: vi.fn(() => mock_splitter),
}))

describe("AnimeText", () => {
  beforeEach(() => {
    mock_splitText.mockClear()
    mock_splitter.revert.mockClear()
    mock_splitter.refresh.mockClear()
  })

  it("renders the default slot without slot props", () => {
    const slot = vi.fn(() => "Hello")
    mount(AnimeText, { slots: { default: slot } })
    expect(slot).toHaveBeenCalledWith()
  })

  it("renders a div root with the slot content by default", () => {
    const wrapper = mount(AnimeText, { slots: { default: () => "Hello" } })
    expect(wrapper.html()).toBe("<div>Hello</div>")
  })

  it("renders the tag given in `as`", () => {
    const wrapper = mount(AnimeText, { props: { as: "h1" }, slots: { default: () => "Hello" } })
    expect(wrapper.element.tagName).toBe("H1")
  })

  it("splits the text of the element a component given in `as` renders", async () => {
    const Title = defineComponent(
      (_, { slots }) =>
        () =>
          h("h2", { class: "title" }, slots.default?.())
    )
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    // Rendered from a parent, as in a template: mount()'s `props` would be made reactive, component included
    const wrapper = mount(defineComponent(() => () => h(AnimeText, { as: Title }, () => "Hello")))
    await nextTick()
    expect(wrapper.html()).toBe('<h2 class="title">Hello</h2>')
    expect(warn).not.toHaveBeenCalled()
    expect(mock_splitText).toHaveBeenCalledWith(wrapper.find("h2").element, {})
  })

  it("splits the text on mount from its root element and options", async () => {
    const options = { chars: true }
    const wrapper = mount(AnimeText, { props: { options }, slots: { default: () => "Hello" } })
    await nextTick()
    expect(mock_splitText).toHaveBeenCalledOnce()
    expect(mock_splitText).toHaveBeenCalledWith(wrapper.element, options)
  })

  it("re-splits the text when the options change", async () => {
    const wrapper = mount(AnimeText, { props: { options: { chars: true } } })
    await nextTick()
    await wrapper.setProps({ options: { words: true } })
    expect(mock_splitText).toHaveBeenCalledTimes(2)
    expect(mock_splitText).toHaveBeenLastCalledWith(wrapper.element, { words: true })
    expect(mock_splitter.revert).toHaveBeenCalledOnce()
  })

  it("re-splits the text on the new root when `as` changes", async () => {
    const Title = defineComponent(
      (_, { slots }) =>
        () =>
          h("h2", slots.default?.())
    )
    const wrapper = mount(AnimeText, { props: { as: "p" } })
    await nextTick()
    // markRaw: setProps() makes its values reactive, which a component imported in a template never is
    await wrapper.setProps({ as: markRaw(Title) })
    expect(mock_splitText).toHaveBeenCalledTimes(2)
    expect(mock_splitText).toHaveBeenLastCalledWith(wrapper.find("h2").element, {})
  })

  // splitText() replaces the root's content: patching the old vnodes would update detached nodes
  it("renders a new root and re-splits it when the slot content changes", async () => {
    const message = ref("Hello")
    const wrapper = mount(defineComponent(() => () => h(AnimeText, { as: "p" }, () => message.value)))
    await nextTick()
    const first_root = wrapper.find("p").element
    message.value = "Goodbye"
    await nextTick()
    const second_root = wrapper.find("p").element
    expect(second_root).not.toBe(first_root)
    expect(second_root.textContent).toBe("Goodbye")
    expect(mock_splitText).toHaveBeenCalledTimes(2)
    expect(mock_splitText).toHaveBeenLastCalledWith(second_root, {})
  })

  it("renders a new root when text nested in the slot changes", async () => {
    const name = ref("world")
    const wrapper = mount(
      defineComponent(() => () => h(AnimeText, { as: "p" }, () => ["Hello, ", h("strong", name.value)]))
    )
    await nextTick()
    const first_root = wrapper.find("p").element
    name.value = "Vue"
    await nextTick()
    expect(wrapper.find("p").element).not.toBe(first_root)
    expect(wrapper.find("p").text()).toBe("Hello, Vue")
    expect(mock_splitText).toHaveBeenCalledTimes(2)
  })

  it("keeps the root and its split when a re-render renders the same content", async () => {
    const color = ref("red")
    const wrapper = mount(
      defineComponent(() => () => h(AnimeText, { as: "p", style: { color: color.value } }, () => "Hello"))
    )
    await nextTick()
    const first_root = wrapper.find("p").element
    color.value = "blue"
    await nextTick()
    expect(wrapper.find("p").element).toBe(first_root)
    expect(first_root.style.color).toBe("blue")
    expect(mock_splitText).toHaveBeenCalledOnce()
  })

  // Regression guard: `:options="{ ... }"` is a new object on every parent render
  it("does not re-split the text for an inline options literal on an unrelated re-render", async () => {
    const count = ref(0)
    mount(
      defineComponent({
        setup() {
          return () => h("div", [h("p", count.value), h(AnimeText, { options: { chars: true } }, () => "Hello")])
        },
      })
    )
    await nextTick()
    count.value++
    await nextTick()
    expect(mock_splitText).toHaveBeenCalledOnce()
  })

  it("reverts the split on unmount", async () => {
    const wrapper = mount(AnimeText)
    await nextTick()
    wrapper.unmount()
    expect(mock_splitter.revert).toHaveBeenCalled()
  })

  // expose() goes through proxyRefs, so a parent template ref sees the refs unwrapped, as with defineExpose
  it("exposes the useText controls on the component instance, with refs unwrapped", async () => {
    const wrapper = mount(AnimeText, { slots: { default: () => "Hello" } })
    await nextTick()
    // @vue/test-utils types `vm` from its own mount overloads, not from the component's constructor
    const vm = wrapper.vm as unknown as AnimeTextExposed
    expect(vm.splitter).toBe(mock_splitter)
    expect(vm.lines).toEqual(mock_splitter.lines)
    expect(vm.words).toEqual(mock_splitter.words)
    expect(vm.chars).toEqual(mock_splitter.chars)
    vm.refresh()
    vm.revert()
    expect(mock_splitter.refresh).toHaveBeenCalledOnce()
    expect(mock_splitter.revert).toHaveBeenCalledOnce()
  })
})