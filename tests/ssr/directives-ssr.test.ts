// @vitest-environment node
import { describe, it, expect } from "vitest"
import { type Directive, defineComponent, h, withDirectives } from "vue"
import { vAnimate, vSvgDrawable, vTextSplit, vWaapi } from "@lib"
import { renderSSRApp } from "../utils"

const directives: [string, Directive][] = [
  ["vAnimate", vAnimate],
  ["vWaapi", vWaapi],
]

describe.each(directives)("%s server style", (_, directive) => {
  function render(value: unknown, props: Record<string, unknown> = {}): Promise<string> {
    return renderSSRApp(() => withDirectives(h("div", props), [[directive, value]]))
  }

  it("renders the 'from' state and lists its keys", async () => {
    await expect(render({ opacity: [0, 1], translateY: [20, 0], duration: 800 })).resolves.toBe(
      '<div style="opacity:0;transform:translateY(20px);" data-anime-ssr="opacity,transform"></div>'
    )
  })

  it("renders nothing for unsupported params", async () => {
    await expect(render({ translateX: 250, opacity: () => 0 })).resolves.toBe("<div></div>")
  })

  it("renders nothing without a binding value", async () => {
    await expect(render(undefined)).resolves.toBe("<div></div>")
  })

  it("keeps the user's :style, with the directive winning on conflicting keys", async () => {
    await expect(render({ opacity: [0, 1] }, { style: { color: "red", opacity: 0.5 } })).resolves.toBe(
      '<div style="color:red;opacity:0;" data-anime-ssr="opacity"></div>'
    )
  })

  // SFCs are compiled to `ssrGetDirectiveProps`, a different path from render functions' `applySSRDirectives`
  it("renders the 'from' state from a compiled template", async () => {
    const component = defineComponent({
      directives: { anime: directive },
      template: `<div :style="{ color: 'red' }" v-anime="{ scale: [0.5, 1] }" />`,
    })
    await expect(renderSSRApp(component)).resolves.toBe(
      '<div style="color:red;transform:scale(0.5);" data-anime-ssr="transform"></div>'
    )
  })
})

describe("vSvgDrawable server state", () => {
  function render(value: unknown, props: Record<string, unknown> = {}): Promise<string> {
    return renderSSRApp(() => h("svg", [withDirectives(h("path", props), [[vSvgDrawable, value]])]))
  }

  it("renders the path's starting draw state as attributes and lists them", async () => {
    await expect(render({ draw: ["0.25 0.5", "0 1"] })).resolves.toBe(
      '<svg><path pathLength="1000" stroke-dasharray="250 760" stroke-dashoffset="-250" data-anime-ssr-attrs="pathLength,stroke-dasharray,stroke-dashoffset"></path></svg>'
    )
  })

  it("renders nothing drawn without a static from, like createDrawable's first paint", async () => {
    await expect(render(undefined)).resolves.toContain('stroke-dasharray="0 1010" stroke-dashoffset="0"')
  })

  it("lets the directive win over the user's own attribute on the server", async () => {
    const html = await render({ draw: "0 1" }, { pathLength: 1 })
    expect(html).toContain('pathLength="1000"')
    expect(html).not.toContain('pathLength="1"')
  })

  // Compiled templates render `pathlength` lowercased; the HTML parser adjusts it back to `pathLength`
  // inside <svg> (checked in Chrome), so the marker's camelCase name still matches on the client.
  it("renders the starting draw state from a compiled template", async () => {
    const component = defineComponent({
      directives: { drawable: vSvgDrawable },
      template: `<svg><path d="M0 0L10 10" v-drawable="{ draw: ['0 1', '0 0'] }" /></svg>`,
    })
    await expect(renderSSRApp(component)).resolves.toBe(
      '<svg><path d="M0 0L10 10" pathlength="1000" stroke-dasharray="1000 0" stroke-dashoffset="0" data-anime-ssr-attrs="pathLength,stroke-dasharray,stroke-dashoffset"></path></svg>'
    )
  })
})

describe("vTextSplit server state", () => {
  function render(value: unknown): Promise<string> {
    return renderSSRApp(() => withDirectives(h("p", "Hello world"), [[vTextSplit, value]]))
  }

  it("hides the element with ssrHidden", async () => {
    await expect(render({ words: true, ssrHidden: true })).resolves.toBe(
      '<p style="visibility:hidden;" data-anime-ssr="visibility">Hello world</p>'
    )
  })

  it("renders the text as-is without ssrHidden", async () => {
    await expect(render({ words: true, animation: { opacity: [0, 1] } })).resolves.toBe("<p>Hello world</p>")
  })
})