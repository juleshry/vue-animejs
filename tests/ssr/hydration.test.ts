import { describe, it, expect, vi, afterEach, beforeAll, type MockInstance } from "vite-plus/test"
import {
  type App,
  type Directive,
  createApp,
  createSSRApp,
  defineComponent,
  getCurrentInstance,
  h,
  nextTick,
  onMounted,
  ref,
  type Ref,
  withDirectives,
} from "vue"
import { renderToString } from "@vue/server-renderer"
import {
  AnimeLayout,
  type AnimeLayoutExposed,
  AnimeScope,
  type AnimeScopeExposed,
  useAnimatable,
  useAnimate,
  useDraggable,
  useLayout,
  useSvgDrawable,
  useText,
  useWaapi,
  vAnimate,
  vDraggable,
  vSvgDrawable,
  vTextSplit,
  vWaapi,
} from "@lib"
import { type AnimationTargets } from "@src/utils/resolve-target.ts"
import { getInitialStyle } from "@src/utils/initial-style.ts"
import { SSR_ATTRS_ATTR, SSR_STYLE_ATTR, toSSRProps } from "@src/utils/ssr-props.ts"
import { targetComponent, type TargetForm } from "../utils"

// Real animejs, real hydration: server-render, put the HTML in the DOM, then hydrate over it.

let app: App | undefined

// happy-dom rejects `Animation.finished` on cancel() as an unhandled rejection; browsers mark that
// promise as handled. Mirror the browser so WAAPI teardown doesn't surface as a test error.
beforeAll(() => {
  // oxlint-disable-next-line typescript/unbound-method -- re-bound with `.call(this)` below
  const cancel = Animation.prototype.cancel
  Animation.prototype.cancel = function (this: Animation) {
    this.finished.catch(() => {})
    cancel.call(this)
  }

  // happy-dom has no `document.fonts`, which splitText reads; fonts are already loaded in a browser here
  const fonts = {
    status: "loaded",
    get ready() {
      return Promise.resolve()
    },
  }
  Object.defineProperty(document, "fonts", { value: fonts, configurable: true })
})

afterEach(() => {
  app?.unmount()
  app = undefined
  document.body.innerHTML = ""
  vi.restoreAllMocks()
})

async function hydrate(
  render: () => ReturnType<typeof h>
): Promise<{ el: HTMLElement; container: HTMLElement; warn: MockInstance<typeof console.warn> }> {
  const html = await renderToString(createSSRApp({ render }))
  const container = document.createElement("div")
  container.innerHTML = html
  document.body.append(container)

  const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
  app = createSSRApp({ render })
  app.mount(container)
  await nextTick() // directives' first mount is deferred until the mount flush has finished
  return { el: container.firstElementChild as HTMLElement, container, warn }
}

function hydrationWarnings(warn: MockInstance<typeof console.warn>): unknown[][] {
  return warn.mock.calls.filter(args => String(args[0]).includes("Hydration"))
}

const directives: [string, Directive][] = [
  ["vAnimate", vAnimate],
  ["vWaapi", vWaapi],
]

describe.each(directives)("%s hydration", (_, directive) => {
  const params = { opacity: [0, 1], translateY: [20, 0], duration: 1000 }

  it("hydrates without a mismatch warning and drops the SSR marker", async () => {
    const { el, warn } = await hydrate(() => withDirectives(h("div"), [[directive, params]]))
    expect(hydrationWarnings(warn)).toEqual([])
    expect(el.hasAttribute(SSR_STYLE_ATTR)).toBe(false)
  })

  it("hydrates without a mismatch warning alongside a user :style", async () => {
    const { el, warn } = await hydrate(() =>
      withDirectives(h("div", { style: { color: "red", opacity: 0.5 } }), [[directive, params]])
    )
    expect(hydrationWarnings(warn)).toEqual([])
    expect(el.style.color).toBe("red")
  })

  // Regression: if the SSR style survived until mount, Anime.js would record it as the element's
  // original inline style and restore it on revert, leaving the element invisible.
  it("leaves no SSR declarations behind after unmount", async () => {
    const { el } = await hydrate(() => withDirectives(h("div"), [[directive, params]]))
    app?.unmount()
    app = undefined
    expect(el.style.opacity).toBe("")
    expect(el.style.transform).toBe("")
  })

  it("restores the user's own value for a conflicting key after unmount", async () => {
    const { el } = await hydrate(() => withDirectives(h("div", { style: { opacity: 0.5 } }), [[directive, params]]))
    app?.unmount()
    app = undefined
    expect(el.style.opacity).toBe("0.5")
  })

  it("leaves no SSR declarations behind after a binding change", async () => {
    const value = ref<Record<string, unknown>>(params)
    const { el } = await hydrate(() => withDirectives(h("div"), [[directive, value.value]]))
    value.value = { translateX: 100, duration: 1000 }
    await nextTick()
    expect(el.style.opacity).toBe("")
  })
})

// Negative control: proves the warn spy above would catch a mismatch, and that a `created` hook is
// what suppresses it (vuejs/core#11189).
it("warns on hydration when a directive emits a server style without a created hook", async () => {
  const no_created: Directive = { getSSRProps: binding => toSSRProps({ style: getInitialStyle(binding.value) }) }
  const { warn } = await hydrate(() =>
    withDirectives(h("div", { style: { color: "red" } }), [[no_created, { opacity: [0, 1] }]])
  )
  expect(hydrationWarnings(warn)).not.toEqual([])
})

describe("vSvgDrawable hydration", () => {
  const params = { draw: ["0.25 0.5", "0 1"], duration: 1000 }
  const render = () => h("svg", [withDirectives(h("path", { d: "M0 0L10 10" }), [[vSvgDrawable, params]])])

  it("hydrates without a mismatch warning and drops the SSR markers", async () => {
    const { container, warn } = await hydrate(render)
    const path = container.querySelector("path")!
    expect(hydrationWarnings(warn)).toEqual([])
    expect(path.hasAttribute(SSR_ATTRS_ATTR)).toBe(false)
    expect(path.getAttribute("stroke-dasharray")).toBe("250 760")
  })

  // The server attributes must be gone before createDrawable(), which skips its first paint when
  // `pathLength` is already set, so the hydrated path must end up exactly like a client-only one.
  it("ends up like a client-only render, after mount and after unmount", async () => {
    const client = document.createElement("div")
    document.body.append(client)
    const client_app = createApp({ render })
    client_app.mount(client)
    await nextTick()
    const client_path = client.querySelector("path")!
    const client_mounted = client_path.outerHTML
    client_app.unmount()

    const { container } = await hydrate(render)
    const path = container.querySelector("path")!
    expect(path.outerHTML).toBe(client_mounted)
    app?.unmount()
    app = undefined
    expect(path.outerHTML).toBe(client_path.outerHTML)
  })
})

describe("vTextSplit hydration", () => {
  function render(value: Record<string, unknown>, props: Record<string, unknown> = {}) {
    return () => withDirectives(h("p", props, "Hello world"), [[vTextSplit, value]])
  }

  it("hydrates without a mismatch warning and reveals once split and animated", async () => {
    const { el, warn } = await hydrate(
      render(
        { words: true, ssrHidden: true, animation: { opacity: [0, 1], duration: 1000 } },
        { style: { color: "red" } }
      )
    )
    expect(hydrationWarnings(warn)).toEqual([])
    expect(el.style.visibility).toBe("")
    expect(el.style.color).toBe("red")
    expect(el.hasAttribute(SSR_STYLE_ATTR)).toBe(false)
    const words = el.querySelectorAll<HTMLElement>("[data-word]")
    expect(words.length).toBeGreaterThan(0)
    expect(words[0].style.opacity).toBe("0")
  })

  it("stays hidden until the deferred line animation is created", async () => {
    let fontsLoaded!: () => void
    const ready = new Promise<FontFaceSet>(resolve => (fontsLoaded = () => resolve(document.fonts)))
    vi.spyOn(document.fonts, "ready", "get").mockReturnValue(ready)

    const { el } = await hydrate(render({ lines: true, ssrHidden: true, animation: { opacity: [0, 1] } }))
    expect(el.style.visibility).toBe("hidden")
    fontsLoaded()
    await ready
    await nextTick()
    expect(el.style.visibility).toBe("")
  })

  it("restores the user's own visibility", async () => {
    const { el } = await hydrate(render({ words: true, ssrHidden: true }, { style: { visibility: "visible" } }))
    expect(el.style.visibility).toBe("visible")
  })
})

// Regression: during hydration, an element's directive `mounted` runs before the `onMounted` of the
// components whose root it is. Tools like @nuxt/hints compare a component's `outerHTML` between
// `setup()` and its own `onMounted`, so any DOM write in that window (the SSR strip, an animation's
// first frame, a text split) is reported as a mismatch. Directives must wait for the flush to finish.
describe("directives leave the DOM untouched until every onMounted has run", () => {
  const cases: [string, Directive, unknown, string][] = [
    ["vAnimate", vAnimate, { opacity: [0, 1], translateY: [20, 0], duration: 1000 }, "div"],
    ["vWaapi", vWaapi, { opacity: [0, 1], translateY: [20, 0], duration: 1000 }, "div"],
    ["vSvgDrawable", vSvgDrawable, { draw: ["0.25 0.5", "0 1"], duration: 1000 }, "path"],
    ["vTextSplit", vTextSplit, { words: true, ssrHidden: true, animation: { opacity: [0, 1] } }, "p"],
    ["vDraggable", vDraggable, {}, "div"],
  ]

  it.each(cases)("%s on a component root", async (_, directive, value, tag) => {
    const seen: [string, string][] = []
    function recordOnMounted(name: string): void {
      const instance = getCurrentInstance()!
      onMounted(() => seen.push([name, (instance.vnode.el as Element).outerHTML]))
    }

    const Inner = defineComponent({
      setup() {
        recordOnMounted("Inner")
        return () => h(tag, tag === "path" ? { d: "M0 0L10 10" } : {}, tag === "p" ? "Hello world" : undefined)
      },
    })
    // The directive sits on the component vnode, so Vue hands it down to Inner's root element
    const Outer = defineComponent({
      setup() {
        recordOnMounted("Outer")
        return () => withDirectives(h(Inner), [[directive, value]])
      },
    })

    const { container } = await hydrate(() => (tag === "path" ? h("svg", [h(Outer)]) : h(Outer)))
    const server_html = await renderToString(createSSRApp({ render: () => h(Outer) }))
    expect(seen.map(([name]) => name)).toEqual(["Inner", "Outer"])
    for (const [, html] of seen) expect(html).toBe(server_html)
    expect(container.querySelector(tag)!.outerHTML).not.toBe(server_html) // the directive did run, afterwards
  })
})

// Regression: a non-ref target (selector, element, array of refs) used to build its Anime.js instance
// synchronously in setup(). During hydration the server HTML is already in the document there, so
// Anime.js wrote to DOM Vue hadn't hydrated yet: style mismatches, or a throw for useDraggable,
// useLayout and useText. The first build now waits for mount.
describe("composables with a DOM target hydrate without touching the server HTML first", () => {
  const all_forms: TargetForm[] = ["selector", "template ref", "array of template refs"]
  const single_forms: TargetForm[] = ["selector", "template ref"]
  const motion = { opacity: [0, 1], translateY: [20, 0], duration: 1000 }

  // Each case calls the composable and returns its instance ref
  const cases: [string, (target: AnimationTargets) => Readonly<Ref<unknown>>, TargetForm[], string?][] = [
    ["useAnimate", t => useAnimate(t, motion).animation, all_forms],
    ["useWaapi", t => useWaapi(t, motion).animation, all_forms],
    ["useAnimatable", t => useAnimatable(t, { opacity: 500 }).animatable, all_forms],
    ["useDraggable", t => useDraggable(t).draggable, all_forms],
    ["useLayout", t => useLayout(t as Parameters<typeof useLayout>[0]).layout, single_forms],
    ["useText", t => useText(t as Parameters<typeof useText>[0], { words: true }).splitter, single_forms],
    ["useSvgDrawable", t => useSvgDrawable(t as Parameters<typeof useSvgDrawable>[0]).drawable, single_forms, "path"],
  ]

  describe.each(cases)("%s", (_, use, forms, tag) => {
    const variants = forms.flatMap(form => [
      [form, "without"],
      [form, "with"],
    ])

    it.each(variants)("%s target, %s a user :style", async (form, style) => {
      let instance!: Readonly<Ref<unknown>>
      const props = style === "with" ? { style: { color: "red", opacity: 0.5 } } : {}
      const Comp = targetComponent(form as TargetForm, t => (instance = use(t)), { tag, props })

      const error = vi.spyOn(console, "error").mockImplementation(() => {})
      const { warn } = await hydrate(() => h(Comp))
      expect(hydrationWarnings(warn)).toEqual([])
      expect(error).not.toHaveBeenCalled()
      expect(instance.value).toBeDefined()
    })
  })

  it("useText splits the text only once hydration is done", async () => {
    const Comp = targetComponent("selector", t => useText(t as Parameters<typeof useText>[0], { words: true }), {
      tag: "p",
    })
    const { container, warn } = await hydrate(() => h(Comp))
    expect(hydrationWarnings(warn)).toEqual([])
    expect(container.querySelectorAll("#t [data-word]").length).toBe(2)
  })
})

describe("AnimeLayout hydration", () => {
  it("hydrates without a mismatch warning and creates the layout on its root", async () => {
    const layout = ref<AnimeLayoutExposed>()
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    const { el, warn } = await hydrate(() =>
      h(AnimeLayout, { ref: layout, as: "ul", style: { color: "red" } }, () => [h("li", "a"), h("li", "b")])
    )
    expect(hydrationWarnings(warn)).toEqual([])
    expect(error).not.toHaveBeenCalled()
    expect(el.tagName).toBe("UL")
    expect(el.style.color).toBe("red")
    expect(layout.value?.layout).toBeDefined()
  })
})

describe("AnimeScope hydration", () => {
  it("hydrates without a mismatch warning and creates the scope on its root", async () => {
    const scope = ref<AnimeScopeExposed>()
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    const { el, warn } = await hydrate(() =>
      h(AnimeScope, { ref: scope, as: "section", style: { color: "red" } }, () => h("p", "item"))
    )
    expect(hydrationWarnings(warn)).toEqual([])
    expect(error).not.toHaveBeenCalled()
    expect(el.tagName).toBe("SECTION")
    expect(el.style.color).toBe("red")
    expect(scope.value?.scope?.root).toBe(el)
  })
})