import { describe, it, expect, afterEach } from "vite-plus/test"
import { computed, defineComponent, h, nextTick, useTemplateRef } from "vue"
import { mount } from "@vue/test-utils"
import { useText, type UseTextReturn } from "@lib"

// Real animejs: splitText fills its arrays itself, outside Vue, which a mock can't show

/** Stubs `document.fonts` as still loading; the returned function marks them loaded and resolves `ready`. */
function stubLoadingFonts(): () => Promise<void> {
  let resolveReady!: () => void
  const ready = new Promise<void>(resolve => (resolveReady = resolve))
  const fonts = { status: "loading", ready }
  Object.defineProperty(document, "fonts", { value: fonts, configurable: true })
  return async () => {
    fonts.status = "loaded"
    resolveReady()
    await ready
  }
}

afterEach(() => {
  Reflect.deleteProperty(document, "fonts")
})

describe("useText with real Anime.js", () => {
  // Regression: lines are only split once fonts are ready, into arrays Vue doesn't observe. happy-dom has no layout, so
  // the split gives one empty line and no words: only `lines` can be checked here.
  it("updates lines once fonts have loaded", async () => {
    const fontsLoaded = stubLoadingFonts()
    let text!: UseTextReturn
    const wrapper = mount(
      defineComponent(() => {
        text = useText(useTemplateRef<HTMLElement>("el"), { lines: true })
        return () => h("p", { ref: "el" }, "Hello world")
      }),
      { attachTo: document.body }
    )
    await nextTick()
    // Read before fonts load, as a template or an animation target would
    const line_count = computed(() => text.lines.value.length)
    expect(line_count.value).toBe(0)

    await fontsLoaded()
    await nextTick()
    const el = wrapper.find("p").element
    expect(line_count.value).toBe(1)
    expect(text.lines.value).toEqual([...el.querySelectorAll("[data-line]")])
    wrapper.unmount()
  })
})