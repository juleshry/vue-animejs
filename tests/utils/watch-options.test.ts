import { describe, it, expect, vi } from "vite-plus/test"
import { computed, defineComponent, h, nextTick, onMounted, reactive, ref } from "vue"
import { mount } from "@vue/test-utils"
import { watchOptions } from "@src/utils/watch-options.ts"
import { renderSSR, withSetup } from "../utils"

describe("watchOptions", () => {
  it("builds once on mount, not during setup()", () => {
    const build = vi.fn()
    let built_in_setup = true
    mount(
      defineComponent({
        setup() {
          watchOptions({ loop: true }, build)
          built_in_setup = build.mock.calls.length > 0
          return () => h("div")
        },
      })
    )
    expect(built_in_setup).toBe(false)
    expect(build).toHaveBeenCalledOnce()
    expect(build).toHaveBeenCalledWith({ loop: true })
  })

  it("never builds during SSR", async () => {
    const build = vi.fn()
    await renderSSR(() => watchOptions(ref({ loop: true }), build))
    expect(build).not.toHaveBeenCalled()
  })

  it("rebuilds when the options ref changes", async () => {
    const build = vi.fn()
    const options = ref({ loop: false })
    withSetup(() => watchOptions(options, build))
    options.value = { loop: true }
    await nextTick()
    expect(build).toHaveBeenCalledTimes(2)
    expect(build).toHaveBeenLastCalledWith({ loop: true })
  })

  it("rebuilds when the options object is mutated in place", async () => {
    const build = vi.fn()
    const options = ref({ loop: false })
    withSetup(() => watchOptions(options, build))
    options.value.loop = true
    await nextTick()
    expect(build).toHaveBeenCalledTimes(2)
  })

  it("builds once when options resolve at mount (mount-time watch tick)", async () => {
    const build = vi.fn()
    const ready = ref(false)
    const options = { a: { loop: false }, b: { loop: true } }
    mount(
      defineComponent({
        setup() {
          onMounted(() => (ready.value = true))
          watchOptions(
            computed(() => (ready.value ? options.b : options.a)),
            build
          )
          return () => h("div")
        },
      })
    )
    await nextTick()
    expect(build).toHaveBeenCalledOnce()
    expect(build).toHaveBeenCalledWith(options.b)
  })

  it("does not build before mount when options change between setup() and mount (regression: useTimer's pre-flush watcher)", async () => {
    const build = vi.fn()
    let mounted = false
    build.mockImplementation(() => expect(mounted).toBe(true))
    const show = ref(false)
    const Child = defineComponent({
      setup() {
        onMounted(() => (mounted = true))
        const options = ref({ loop: false })
        watchOptions(options, build)
        options.value = { loop: true }
        return () => h("div")
      },
    })
    mount(defineComponent({ setup: () => () => (show.value ? h(Child) : h("div")) }))
    show.value = true
    await nextTick()
    expect(build).toHaveBeenCalledOnce()
    expect(build).toHaveBeenCalledWith({ loop: true })
  })

  it("stops rebuilding once the returned handle is stopped", async () => {
    const build = vi.fn()
    const options = ref({ loop: false })
    const [handle] = withSetup(() => watchOptions(options, build))
    handle.stop()
    options.value = { loop: true }
    await nextTick()
    expect(build).toHaveBeenCalledOnce()
  })

  it("rebuilds exactly once when a ref inside the options changes", async () => {
    const build = vi.fn()
    const loop = ref(false)
    withSetup(() => watchOptions({ loop, duration: 400 }, build))
    expect(build).toHaveBeenCalledOnce()
    expect(build).toHaveBeenCalledWith({ loop: false, duration: 400 })

    loop.value = true
    await nextTick()
    expect(build).toHaveBeenCalledTimes(2)
    expect(build).toHaveBeenLastCalledWith({ loop: true, duration: 400 })
  })

  it("builds exactly once on mount with refs inside the options", async () => {
    const build = vi.fn()
    withSetup(() => watchOptions({ loop: ref(true) }, build))
    await nextTick()
    expect(build).toHaveBeenCalledOnce()
  })

  it("rebuilds when a reactive() options object is mutated in place", async () => {
    const build = vi.fn()
    const options = reactive({ loop: false })
    withSetup(() => watchOptions(options, build))
    options.loop = true
    await nextTick()
    expect(build).toHaveBeenCalledTimes(2)
    expect(build).toHaveBeenLastCalledWith({ loop: true })
  })

  it("accepts a getter for the whole options object", async () => {
    const build = vi.fn()
    const loop = ref(false)
    withSetup(() => watchOptions(() => ({ loop: loop.value }), build))
    loop.value = true
    await nextTick()
    expect(build).toHaveBeenCalledTimes(2)
    expect(build).toHaveBeenLastCalledWith({ loop: true })
  })

  it("picks up a ref change made before mount in the mount build, with no extra build", async () => {
    const build = vi.fn()
    const loop = ref(false)
    mount(
      defineComponent({
        setup() {
          watchOptions({ loop }, build)
          loop.value = true
          return () => h("div")
        },
      })
    )
    await nextTick()
    expect(build).toHaveBeenCalledOnce()
    expect(build).toHaveBeenCalledWith({ loop: true })
  })
})