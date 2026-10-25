import { describe, it, expect, vi, beforeEach } from "vite-plus/test"
import { defineComponent, h, nextTick, ref, type Ref } from "vue"
import { mount } from "@vue/test-utils"
import { AnimeTransition, type AnimeTransitionProps } from "@lib"
import { animate, type AnimationParams } from "animejs"

const mock_animate = vi.mocked(animate)

vi.mock("animejs", () => ({
  animate: vi.fn(() => ({ cancel: vi.fn() })),
}))

const enter: AnimationParams = { opacity: [0, 1], duration: 300 }
const leave: AnimationParams = { opacity: 0, duration: 300 }

/** Mounts `<AnimeTransition v-bind="props"><p v-if="show" /></AnimeTransition>` with the real `<Transition>`. */
function mountToggle(props: AnimeTransitionProps & Record<string, unknown>, show: Ref<boolean>) {
  return mount(
    defineComponent(() => () => h(AnimeTransition, props, () => (show.value ? h("p", { id: "t" }, "hi") : null))),
    // @vue/test-utils stubs <Transition> by default, which would skip every hook
    { global: { stubs: { transition: false } }, attachTo: document.body }
  )
}

/** Calls the `onComplete` of the `n`-th `animate()` call (0-based), as Anime.js would when it finishes. */
function complete(n: number) {
  const params = mock_animate.mock.calls[n][1] as AnimationParams
  params.onComplete?.(mock_animate.mock.results[n].value)
}

function lastAnimation(): { cancel: ReturnType<typeof vi.fn> } {
  const results = mock_animate.mock.results
  return results[results.length - 1].value
}

describe("AnimeTransition", () => {
  beforeEach(() => {
    mock_animate.mockClear()
    document.body.innerHTML = ""
  })

  it("animates the entering element with `enter`, and finishes the enter on complete", async () => {
    const show = ref(false)
    const after_enter = vi.fn()
    const wrapper = mountToggle({ enter, onAfterEnter: after_enter }, show)
    show.value = true
    await nextTick()
    expect(mock_animate).toHaveBeenCalledOnce()
    expect(mock_animate).toHaveBeenCalledWith(wrapper.find("#t").element, expect.objectContaining(enter))
    expect(after_enter).not.toHaveBeenCalled()
    complete(0)
    expect(after_enter).toHaveBeenCalledOnce()
  })

  it("keeps the leaving element until the `leave` animation completes", async () => {
    const show = ref(true)
    mountToggle({ enter, leave }, show)
    show.value = false
    await nextTick()
    expect(mock_animate).toHaveBeenCalledWith(expect.any(HTMLElement), expect.objectContaining(leave))
    // The wrapper's root is the v-if placeholder by now: look the leaving element up in the document
    expect(document.querySelector("#t")).not.toBeNull()
    complete(0)
    await nextTick()
    expect(document.querySelector("#t")).toBeNull()
  })

  it("enters and leaves instantly without `enter` / `leave`", async () => {
    const show = ref(false)
    const wrapper = mountToggle({}, show)
    show.value = true
    await nextTick()
    expect(wrapper.find("#t").exists()).toBe(true)
    show.value = false
    await nextTick()
    await nextTick()
    expect(wrapper.find("#t").exists()).toBe(false)
    expect(mock_animate).not.toHaveBeenCalled()
  })

  it("still calls the user's own onComplete", async () => {
    const show = ref(false)
    const on_complete = vi.fn()
    mountToggle({ enter: { ...enter, onComplete: on_complete } }, show)
    show.value = true
    await nextTick()
    complete(0)
    expect(on_complete).toHaveBeenCalledOnce()
  })

  it("cancels the enter animation when the element starts leaving midway", async () => {
    const show = ref(false)
    mountToggle({ enter, leave }, show)
    show.value = true
    await nextTick()
    const entering = lastAnimation()
    show.value = false
    await nextTick()
    expect(entering.cancel).toHaveBeenCalledOnce()
    expect(mock_animate).toHaveBeenLastCalledWith(expect.any(HTMLElement), expect.objectContaining(leave))
  })

  it("does not animate the initial render without `appear`", async () => {
    mountToggle({ enter }, ref(true))
    await nextTick()
    await nextTick()
    expect(mock_animate).not.toHaveBeenCalled()
  })

  // On a client mount, <Transition>'s own appear hook runs; the hydration case is in tests/ssr/hydration.test.ts
  it("animates the initial client render with `appear`", async () => {
    const wrapper = mountToggle({ enter, appear: true }, ref(true))
    await nextTick()
    expect(mock_animate).toHaveBeenCalledOnce()
    expect(mock_animate).toHaveBeenCalledWith(wrapper.find("#t").element, expect.objectContaining(enter))
  })

  it("treats a bare `appear` attribute as true", async () => {
    // What `<AnimeTransition appear>` compiles to
    mountToggle({ enter, appear: "" as unknown as boolean }, ref(true))
    await nextTick()
    expect(mock_animate).toHaveBeenCalledOnce()
  })

  it("cancels a running animation on unmount", async () => {
    const show = ref(false)
    const wrapper = mountToggle({ enter }, show)
    show.value = true
    await nextTick()
    const entering = lastAnimation()
    wrapper.unmount()
    expect(entering.cancel).toHaveBeenCalled()
  })

  it("waits for the leave to finish before entering the next element in `out-in` mode", async () => {
    const key = ref("a")
    mount(
      defineComponent(
        () => () => h(AnimeTransition, { enter, leave, mode: "out-in" }, () => h("p", { key: key.value }, key.value))
      ),
      { global: { stubs: { transition: false } }, attachTo: document.body }
    )
    key.value = "b"
    await nextTick()
    expect(mock_animate).toHaveBeenCalledOnce() // only the leave of "a"
    expect(document.body.textContent).toBe("a")
    complete(0)
    await nextTick()
    expect(document.body.textContent).toBe("b")
    expect(mock_animate).toHaveBeenLastCalledWith(expect.any(HTMLElement), expect.objectContaining(enter))
  })
})