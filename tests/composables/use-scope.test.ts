import { describe, it, expect, vi, beforeEach } from "vite-plus/test"
import { defineComponent, h, nextTick, ref, useTemplateRef } from "vue"
import { mount } from "@vue/test-utils"
import { useScope } from "@lib"
import { expectInstanceStaysRaw, withSetup } from "../utils"
import { makeScopeMock } from "../mocks"
import { createScope } from "animejs"

const mock_createScope = vi.mocked(createScope)

const mock_scope = makeScopeMock()

vi.mock("animejs", () => ({
  createScope: vi.fn(() => mock_scope),
}))

describe("useScope", () => {
  beforeEach(() => {
    mock_createScope.mockClear()
    Object.values(mock_scope).forEach(fn => fn.mockClear())
  })

  it("creates scope synchronously during setup", () => {
    withSetup(() => useScope({}))
    expect(mock_createScope).toHaveBeenCalledWith({})
  })

  it("creates scope with provided params", () => {
    const params = { defaults: { duration: 1000 } }
    withSetup(() => useScope(params))
    expect(mock_createScope).toHaveBeenCalledWith(params)
  })

  it("does not deep-wrap the scope instance (regression: readonly(shallowRef) stack overflow)", () => {
    const [result] = withSetup(() => useScope({}))
    expectInstanceStaysRaw(result.scope.value)
  })

  it("flushes buffered add() calls on mount", () => {
    const method = vi.fn()
    mount(
      defineComponent({
        setup() {
          const { add } = useScope({})
          add(method)
          return () => h("div")
        },
      })
    )
    expect(mock_scope.add).toHaveBeenCalledWith(method)
  })

  it("add() called after mount delegates to scope.add immediately", () => {
    const method = vi.fn()
    const [result] = withSetup(() => useScope({}))
    mock_scope.add.mockClear()
    result.add(method)
    expect(mock_scope.add).toHaveBeenCalledWith(method)
  })

  it("flushes buffered registerMethod() calls on mount", () => {
    const method = vi.fn()
    mount(
      defineComponent({
        setup() {
          const { registerMethod } = useScope({})
          registerMethod("myMethod", method)
          return () => h("div")
        },
      })
    )
    expect(mock_scope.add).toHaveBeenCalledWith("myMethod", method)
  })

  it("flushes buffered addOnce() calls on mount", () => {
    const method = vi.fn()
    mount(
      defineComponent({
        setup() {
          const { addOnce } = useScope({})
          addOnce(method)
          return () => h("div")
        },
      })
    )
    expect(mock_scope.addOnce).toHaveBeenCalledWith(method)
  })

  it("refresh() delegates to scope", () => {
    const [result] = withSetup(() => useScope({}))
    result.refresh()
    expect(mock_scope.refresh).toHaveBeenCalledOnce()
  })

  it("revert() delegates to scope", () => {
    const [result] = withSetup(() => useScope({}))
    result.revert()
    expect(mock_scope.revert).toHaveBeenCalledOnce()
  })

  it("calls scope.revert() on unmount", () => {
    const [, wrapper] = withSetup(() => useScope({}))
    mock_scope.revert.mockClear()
    wrapper.unmount()
    expect(mock_scope.revert).toHaveBeenCalledOnce()
  })

  it("recreates scope when ref params change", async () => {
    const params = ref({ defaults: { duration: 500 } })
    withSetup(() => useScope(params))
    mock_createScope.mockClear()
    params.value = { defaults: { duration: 1000 } }
    await nextTick()
    expect(mock_createScope).toHaveBeenCalledWith({ defaults: { duration: 1000 } })
  })

  it("reverts old scope before recreating on params change", async () => {
    const params = ref({})
    withSetup(() => useScope(params))
    mock_scope.revert.mockClear()
    params.value = { defaults: { duration: 1000 } }
    await nextTick()
    expect(mock_scope.revert).toHaveBeenCalled()
  })

  it("replays every registered method on the new scope when params change (regression: they were dropped)", async () => {
    const params = ref({})
    const before_mount = vi.fn()
    const named = vi.fn()
    const once = vi.fn()
    const after_mount = vi.fn()
    let scope_api!: ReturnType<typeof useScope>
    mount(
      defineComponent({
        setup() {
          scope_api = useScope(params)
          scope_api.add(before_mount)
          scope_api.registerMethod("named", named)
          scope_api.addOnce(once)
          return () => h("div")
        },
      })
    )
    scope_api.add(after_mount)
    mock_scope.add.mockClear()
    mock_scope.addOnce.mockClear()

    params.value = { defaults: { duration: 500 } }
    await nextTick()

    expect(mock_scope.add.mock.calls).toEqual([[before_mount], ["named", named], [after_mount]])
    expect(mock_scope.addOnce).toHaveBeenCalledWith(once)
  })

  it("does not recreate scope for plain object params", async () => {
    withSetup(() => useScope({ defaults: { duration: 500 } }))
    mock_createScope.mockClear()
    await nextTick()
    expect(mock_createScope).not.toHaveBeenCalled()
  })

  it("stops watching params after unmount", async () => {
    const params = ref({})
    const [, wrapper] = withSetup(() => useScope(params))
    wrapper.unmount()
    mock_createScope.mockClear()
    params.value = { defaults: { duration: 1000 } }
    await nextTick()
    expect(mock_createScope).not.toHaveBeenCalled()
  })

  it("registerMethod() called after mount delegates to scope.add immediately", () => {
    const method = vi.fn()
    const [result] = withSetup(() => useScope({}))
    mock_scope.add.mockClear()
    result.registerMethod("myMethod", method)
    expect(mock_scope.add).toHaveBeenCalledWith("myMethod", method)
  })

  it("addOnce() called after mount delegates to scope.addOnce immediately", () => {
    const method = vi.fn()
    const [result] = withSetup(() => useScope({}))
    mock_scope.addOnce.mockClear()
    result.addOnce(method)
    expect(mock_scope.addOnce).toHaveBeenCalledWith(method)
  })

  it("keepTime() delegates to scope.keepTime", () => {
    const [result] = withSetup(() => useScope({}))
    const factory = vi.fn()
    result.keepTime(factory)
    expect(mock_scope.keepTime).toHaveBeenCalledWith(factory)
  })

  it("recreates the scope when a ref inside the params changes", async () => {
    const media_queries = ref({ small: "(max-width: 200px)" })
    withSetup(() => useScope({ mediaQueries: media_queries }))
    expect(mock_createScope).toHaveBeenCalledOnce()
    expect(mock_createScope).toHaveBeenCalledWith({ mediaQueries: { small: "(max-width: 200px)" } })
    media_queries.value = { small: "(max-width: 400px)" }
    await nextTick()
    expect(mock_createScope).toHaveBeenCalledTimes(2)
    expect(mock_createScope).toHaveBeenLastCalledWith({ mediaQueries: { small: "(max-width: 400px)" } })
  })

  it("builds once with root from a component template ref, resolved to the component's root element", async () => {
    const Panel = defineComponent({ setup: () => () => h("section", { class: "panel" }) })
    const wrapper = mount(
      defineComponent({
        setup() {
          const root = useTemplateRef<InstanceType<typeof Panel>>("root")
          useScope({ root })
          return () => h(Panel, { ref: "root" })
        },
      })
    )
    await nextTick()
    expect(mock_createScope).toHaveBeenCalledOnce()
    expect(mock_createScope.mock.calls[0][0]?.root).toBe(wrapper.find(".panel").element)
    wrapper.unmount()
  })
})