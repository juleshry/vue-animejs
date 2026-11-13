// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vite-plus/test"
import { createSSRApp, defineComponent, h, withDirectives } from "vue"
import { renderToString } from "@vue/server-renderer"
import { animate, stagger as animeStagger } from "animejs"
import { stagger, useAnimate, vAnimate } from "@lib"

vi.mock("animejs", async importOriginal => {
  const original = await importOriginal<typeof import("animejs")>()
  return { ...original, animate: vi.fn(original.animate), stagger: vi.fn(original.stagger) }
})

describe("stagger on the server", () => {
  beforeEach(() => {
    vi.mocked(animate).mockClear()
    vi.mocked(animeStagger).mockClear()
  })

  it("can be created in setup and passed to a composable without touching Anime.js", async () => {
    const html = await renderToString(
      createSSRApp(
        defineComponent({
          setup() {
            useAnimate(".item", { opacity: [0, 1], delay: stagger(40, { from: "center" }) })
            return () => h("div", { class: "item" })
          },
        })
      )
    )
    expect(html).toBe('<div class="item"></div>')
    expect(animeStagger).not.toHaveBeenCalled()
    expect(animate).not.toHaveBeenCalled()
  })

  it("is skipped by a directive's server style, like any function value", async () => {
    const html = await renderToString(
      createSSRApp(
        defineComponent({
          render: () => withDirectives(h("div"), [[vAnimate, { opacity: [0, 1], translateX: stagger(10) }]]),
        })
      )
    )
    expect(html).toContain("opacity:0")
    expect(html).not.toContain("transform")
    expect(animeStagger).not.toHaveBeenCalled()
  })
})