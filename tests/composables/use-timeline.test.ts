import { describe, it, expect, vi, beforeEach } from "vitest"
import { defineComponent, h, nextTick, ref, type ComponentPublicInstance } from "vue"
import { mount } from "@vue/test-utils"
import { useTimeline } from "@lib"
import { withSetup } from "../utils"
import { makeTimelineMock } from "../mocks"
import { createTimeline } from "animejs"

const mock_createTimeline = vi.mocked(createTimeline)

const mock_timeline = makeTimelineMock()

vi.mock("animejs", () => ({
  createTimeline: vi.fn(() => mock_timeline),
}))

describe("useTimeline", () => {
  beforeEach(() => {
    mock_createTimeline.mockClear()
    Object.values(mock_timeline).forEach(fn => fn.mockClear())
    vi.spyOn(console, "warn").mockImplementation(() => {})
  })

  it("creates timeline synchronously with provided options", () => {
    withSetup(() => useTimeline({ loop: true }))
    expect(mock_createTimeline).toHaveBeenCalledWith({ loop: true })
  })

  it("exposes the timeline instance", () => {
    const [result] = withSetup(() => useTimeline())
    expect(result.timeline.value).toBeDefined()
  })

  it("calls timeline.add directly when already mounted", () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useTimeline())
    // is_mounted = true after withSetup
    result.add(el, { opacity: 1 })
    expect(mock_timeline.add).toHaveBeenCalledWith(el, { opacity: 1 }, undefined)
  })

  it("flushes queued add calls after mount", () => {
    const el = document.createElement("div")
    mount(
      defineComponent({
        setup() {
          const tl = useTimeline()
          tl.add(el, { opacity: 1 }) // called during setup, before onMounted
          return () => h("div")
        },
      })
    )
    // onMounted has fired by the time mount() returns
    expect(mock_timeline.add).toHaveBeenCalledWith(el, { opacity: 1 }, undefined)
  })

  it("flushes queued set calls after mount", () => {
    const el = document.createElement("div")
    mount(
      defineComponent({
        setup() {
          const tl = useTimeline()
          tl.set(el, { opacity: 0 })
          return () => h("div")
        },
      })
    )
    expect(mock_timeline.set).toHaveBeenCalledWith(el, { opacity: 0 }, undefined)
  })

  it("warns when remove is called before mount", () => {
    const el = document.createElement("div")
    mount(
      defineComponent({
        setup() {
          const tl = useTimeline()
          tl.remove(el)
          return () => h("div")
        },
      })
    )
    expect(console.warn).toHaveBeenCalledWith("Cannot remove from timeline before mount")
  })

  it("unwraps ref targets when flushing the queue", () => {
    const el = document.createElement("div")
    const el_ref = ref(el)
    mount(
      defineComponent({
        setup() {
          const tl = useTimeline()
          tl.add(el_ref, { opacity: 1 })
          return () => h("div")
        },
      })
    )
    expect(mock_timeline.add).toHaveBeenCalledWith(el, { opacity: 1 }, undefined)
  })

  it("passes position to timeline.add", () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useTimeline())
    result.add(el, { opacity: 1 }, "+=500")
    expect(mock_timeline.add).toHaveBeenCalledWith(el, { opacity: 1 }, "+=500")
  })

  it("delegates play to the timeline instance", () => {
    const [result] = withSetup(() => useTimeline())
    result.play()
    expect(mock_timeline.play).toHaveBeenCalledOnce()
  })

  it("delegates pause to the timeline instance", () => {
    const [result] = withSetup(() => useTimeline())
    result.pause()
    expect(mock_timeline.pause).toHaveBeenCalledOnce()
  })

  it("delegates seek with args to the timeline instance", () => {
    const [result] = withSetup(() => useTimeline())
    result.seek(1000)
    expect(mock_timeline.seek).toHaveBeenCalledWith(1000, undefined, undefined)
  })

  it("cancels the timeline on unmount", () => {
    const [, wrapper] = withSetup(() => useTimeline())
    mock_timeline.cancel.mockClear()
    wrapper.unmount()
    expect(mock_timeline.cancel).toHaveBeenCalled()
  })

  it("recreates timeline when options ref changes", async () => {
    const options = ref({ loop: false })
    withSetup(() => useTimeline(options))
    mock_createTimeline.mockClear()
    options.value = { loop: true }
    await nextTick()
    expect(mock_createTimeline).toHaveBeenCalledWith({ loop: true })
  })

  it("reverts the timeline before recreating on options change", async () => {
    const options = ref({ loop: false })
    withSetup(() => useTimeline(options))
    mock_timeline.revert.mockClear()
    options.value = { loop: true }
    await nextTick()
    expect(mock_timeline.revert).toHaveBeenCalled()
  })

  it("replays queued add calls on the new timeline when options change", async () => {
    const el = document.createElement("div")
    const options = ref({ loop: false })
    mount(
      defineComponent({
        setup() {
          const tl = useTimeline(options)
          tl.add(el, { opacity: 1 })
          return () => h("div")
        },
      })
    )
    mock_timeline.add.mockClear()
    options.value = { loop: true }
    await nextTick()
    expect(mock_timeline.add).toHaveBeenCalledWith(el, { opacity: 1 }, undefined)
  })

  it("replays queued set calls on the new timeline when options change", async () => {
    const el = document.createElement("div")
    const options = ref({ loop: false })
    mount(
      defineComponent({
        setup() {
          const tl = useTimeline(options)
          tl.set(el, { opacity: 0 })
          return () => h("div")
        },
      })
    )
    mock_timeline.set.mockClear()
    options.value = { loop: true }
    await nextTick()
    expect(mock_timeline.set).toHaveBeenCalledWith(el, { opacity: 0 }, undefined)
  })

  it("replays add calls made after mount when options change", async () => {
    const el = document.createElement("div")
    const options = ref({ loop: false })
    const [result] = withSetup(() => useTimeline(options))
    result.add(el, { translateX: 100 })
    mock_timeline.add.mockClear()
    options.value = { loop: true }
    await nextTick()
    expect(mock_timeline.add).toHaveBeenCalledWith(el, { translateX: 100 }, undefined)
  })

  it("delegates set directly when already mounted", () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useTimeline())
    result.set(el, { opacity: 0 })
    expect(mock_timeline.set).toHaveBeenCalledWith(el, { opacity: 0 }, undefined)
  })

  it("delegates remove after mount to the timeline instance", () => {
    const el = document.createElement("div")
    const [result] = withSetup(() => useTimeline())
    result.remove(el)
    expect(mock_timeline.remove).toHaveBeenCalledWith(el, undefined)
  })

  it("delegates reverse to the timeline instance", () => {
    const [result] = withSetup(() => useTimeline())
    result.reverse()
    expect(mock_timeline.reverse).toHaveBeenCalledOnce()
  })

  it("delegates restart to the timeline instance", () => {
    const [result] = withSetup(() => useTimeline())
    result.restart()
    expect(mock_timeline.restart).toHaveBeenCalledOnce()
  })

  it("delegates alternate to the timeline instance", () => {
    const [result] = withSetup(() => useTimeline())
    result.alternate()
    expect(mock_timeline.alternate).toHaveBeenCalledOnce()
  })

  it("delegates resume to the timeline instance", () => {
    const [result] = withSetup(() => useTimeline())
    result.resume()
    expect(mock_timeline.resume).toHaveBeenCalledOnce()
  })

  it("delegates complete to the timeline instance", () => {
    const [result] = withSetup(() => useTimeline())
    result.complete()
    expect(mock_timeline.complete).toHaveBeenCalledOnce()
  })

  it("delegates reset with arg to the timeline instance", () => {
    const [result] = withSetup(() => useTimeline())
    result.reset(true)
    expect(mock_timeline.reset).toHaveBeenCalledWith(true)
  })

  it("delegates revert directly to the timeline instance", () => {
    const [result] = withSetup(() => useTimeline())
    result.revert()
    expect(mock_timeline.revert).toHaveBeenCalledOnce()
  })

  it("delegates stretch to the timeline instance", () => {
    const [result] = withSetup(() => useTimeline())
    result.stretch(2000)
    expect(mock_timeline.stretch).toHaveBeenCalledWith(2000)
  })

  it("delegates refresh to the timeline instance", () => {
    const [result] = withSetup(() => useTimeline())
    result.refresh()
    expect(mock_timeline.refresh).toHaveBeenCalledOnce()
  })

  it("delegates sync to the timeline instance", () => {
    const [result] = withSetup(() => useTimeline())
    result.sync(undefined, 0)
    expect(mock_timeline.sync).toHaveBeenCalledWith(undefined, 0)
  })

  it("delegates label to the timeline instance", () => {
    const [result] = withSetup(() => useTimeline())
    result.label("start", 0)
    expect(mock_timeline.label).toHaveBeenCalledWith("start", 0)
  })

  it("delegates call to the timeline instance", () => {
    const [result] = withSetup(() => useTimeline())
    const cb = vi.fn()
    result.call(cb, 0)
    expect(mock_timeline.call).toHaveBeenCalledWith(cb, 0)
  })

  it("delegates init to the timeline instance", () => {
    const [result] = withSetup(() => useTimeline())
    result.init()
    expect(mock_timeline.init).toHaveBeenCalledOnce()
  })

  describe("with a Vue component ref", () => {
    it("resolves $el in add when flushing the queue on mount", () => {
      const ChildComp = defineComponent({ render: () => h("div") })
      const wrapper = mount(
        defineComponent({
          setup() {
            const child_ref = ref<ComponentPublicInstance | null>(null)
            const tl = useTimeline()
            tl.add(child_ref, { opacity: 1 })
            return () => h(ChildComp, { ref: child_ref })
          },
        })
      )
      expect(mock_timeline.add).toHaveBeenCalledWith(
        wrapper.findComponent(ChildComp).element,
        { opacity: 1 },
        undefined
      )
    })

    it("resolves $el in set when flushing the queue on mount", () => {
      const ChildComp = defineComponent({ render: () => h("div") })
      const wrapper = mount(
        defineComponent({
          setup() {
            const child_ref = ref<ComponentPublicInstance | null>(null)
            const tl = useTimeline()
            tl.set(child_ref, { opacity: 0 })
            return () => h(ChildComp, { ref: child_ref })
          },
        })
      )
      expect(mock_timeline.set).toHaveBeenCalledWith(
        wrapper.findComponent(ChildComp).element,
        { opacity: 0 },
        undefined
      )
    })

    it("resolves $el in remove after mount", () => {
      const ChildComp = defineComponent({ render: () => h("div") })
      const child_wrapper = mount(ChildComp)
      const child_ref = ref(child_wrapper.vm)
      const [result] = withSetup(() => useTimeline())
      result.remove(child_ref)
      expect(mock_timeline.remove).toHaveBeenCalledWith(child_wrapper.element, undefined)
    })
  })
})