import { describe, it, expect, vi, beforeEach } from "vite-plus/test"
import { defineComponent, h, nextTick, ref, type Ref, vShow, withDirectives } from "vue"
import { mount } from "@vue/test-utils"
import { AnimeTransition, type AnimeTransitionProps } from "@lib"
import { animate, type JSAnimation } from "animejs"

// Real animejs, spied on: what's tested is which inline styles Anime.js leaves on the element, which a mock can't show
vi.mock("animejs", async importOriginal => {
  const actual = await importOriginal<typeof import("animejs")>()
  return { ...actual, animate: vi.fn(actual.animate) }
})

const mock_animate = vi.mocked(animate)

/** Mounts `<AnimeTransition v-bind="props"><p v-if="show" :style="style" /></AnimeTransition>`. */
function mountToggle(props: AnimeTransitionProps, show: Ref<boolean>, style?: Record<string, string>) {
  return mount(
    defineComponent(() => () => h(AnimeTransition, props, () => (show.value ? h("p", { id: "t", style }) : null))),
    { global: { stubs: { transition: false } }, attachTo: document.body }
  )
}

function animation(n: number): JSAnimation {
  return mock_animate.mock.results[n].value
}

function element(): HTMLElement {
  return document.querySelector("#t")!
}

describe("AnimeTransition with real Anime.js", () => {
  beforeEach(() => {
    mock_animate.mockClear()
    document.body.innerHTML = ""
  })

  it("leaves no inline style once an enter completes, so the element's classes apply again", async () => {
    const show = ref(false)
    mountToggle({ enter: { opacity: [0, 1], duration: 300 } }, show)
    show.value = true
    await nextTick()
    animation(0).complete()
    expect(element().style.opacity).toBe("")
    expect(element().hasAttribute("style")).toBe(false)
  })

  it("puts back the element's own inline style once an enter completes", async () => {
    const show = ref(false)
    mountToggle({ enter: { opacity: [0, 1], duration: 300 } }, show, { opacity: "0.3" })
    show.value = true
    await nextTick()
    animation(0).complete()
    expect(element().style.opacity).toBe("0.3")
  })

  it("starts a leave from where the interrupted enter was, without snapping back", async () => {
    const show = ref(false)
    mountToggle(
      { enter: { opacity: [0, 1], duration: 300, ease: "linear" }, leave: { opacity: 0, duration: 300 } },
      show
    )
    show.value = true
    await nextTick()
    animation(0).seek(150)
    expect(element().style.opacity).toBe("0.5")
    show.value = false
    await nextTick()
    expect(element().style.opacity).toBe("0.5")
    animation(1).seek(0)
    expect(element().style.opacity).toBe("0.5")
  })

  it("clears a leave's end values from a `v-show` element, so the next enter starts from the element's style", async () => {
    const show = ref(true)
    mount(
      defineComponent(
        () => () =>
          h(
            AnimeTransition,
            { enter: { opacity: { from: 0 }, duration: 300 }, leave: { opacity: 0, duration: 300 } },
            () => withDirectives(h("p", { id: "t" }), [[vShow, show.value]])
          )
      ),
      { global: { stubs: { transition: false } }, attachTo: document.body }
    )
    show.value = false
    await nextTick()
    animation(0).complete()
    expect(element().style.display).toBe("none")
    expect(element().style.opacity).toBe("")
  })
})