import { describe, it, expect, vi } from "vite-plus/test"
import { type Directive, defineComponent, h, nextTick, onMounted, ref, withDirectives } from "vue"
import { mount } from "@vue/test-utils"
import { deferMount } from "@src/utils/deferred-mount.ts"

function makeDirective() {
  const run = vi.fn((_el: Element, _value: unknown) => {})
  const deferred = deferMount<Element, unknown>((el, binding) => run(el, binding.value))
  const directive: Directive<Element, unknown> = {
    mounted: deferred.mounted,
    updated(el, binding, vnode) {
      if (binding.value !== binding.oldValue) deferred.reschedule(el, binding, vnode)
    },
    unmounted: el => deferred.cancel(el),
  }
  return { run, directive }
}

describe("deferMount", () => {
  it("runs after the onMounted of the component whose root carries the directive", async () => {
    const { run, directive } = makeDirective()
    const order: string[] = []
    run.mockImplementation(() => order.push("directive"))
    const Inner = defineComponent({
      setup() {
        onMounted(() => order.push("Inner"))
        return () => h("div")
      },
    })
    mount(defineComponent({ render: () => withDirectives(h(Inner), [[directive, 1]]) }))
    expect(run).not.toHaveBeenCalled()
    await nextTick()
    expect(order).toEqual(["Inner", "directive"])
  })

  it("runs once, with the latest binding, when the value changes before it ran", async () => {
    const { run, directive } = makeDirective()
    const value = ref(1)
    const wrapper = mount(defineComponent({ render: () => withDirectives(h("div"), [[directive, value.value]]) }))
    value.value = 2
    await nextTick()
    expect(run).toHaveBeenCalledOnce()
    expect(run).toHaveBeenCalledWith(wrapper.element, 2)
  })

  it("never runs when unmounted before it ran", async () => {
    const { run, directive } = makeDirective()
    const wrapper = mount(defineComponent({ render: () => withDirectives(h("div"), [[directive, 1]]) }))
    wrapper.unmount()
    await nextTick()
    expect(run).not.toHaveBeenCalled()
  })

  it("reschedule returns false once the mount has run", async () => {
    const deferred = deferMount<Element, unknown>(() => {})
    const el = document.createElement("div")
    const binding = { value: 1 } as Parameters<typeof deferred.mounted>[1]
    const vnode = h("div")
    deferred.mounted(el, binding, vnode)
    expect(deferred.reschedule(el, binding, vnode)).toBe(true)
    await nextTick()
    expect(deferred.reschedule(el, binding, vnode)).toBe(false)
  })
})