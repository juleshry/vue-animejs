// @vitest-environment node
import { describe, it, expect } from "vite-plus/test"
import { type Component, defineComponent, h, onMounted, useTemplateRef, withDirectives } from "vue"
import * as lib from "@lib"
import {
  AnimeLayout,
  AnimeScope,
  AnimeTransition,
  useAnimatable,
  useAnimate,
  useDraggable,
  useLayout,
  useRawAnimatable,
  useRawAnimate,
  useScope,
  useScroll,
  useSvg,
  useSvgDrawable,
  useText,
  useTimeline,
  useTimer,
  useWaapi,
  vAnimate,
  vDraggable,
  vSvgDrawable,
  vTextSplit,
  vWaapi,
} from "@lib"
import { renderSSRApp } from "../utils"

// Unmocked on purpose: real `animejs` must import and set up in Node (no window/document)
// without throwing. `ssr-safety.test.ts` covers what gets *called*; this covers what *runs*.

interface Case {
  /** The `@lib` export under test, checked by the coverage guard below. */
  export: string
  name: string
  component: Component
  html: string
}

const box = '<div id="target"></div>'
const path = '<svg><path id="target" d="M0 0L10 10"></path></svg>'

function withTarget(setup: (target: ReturnType<typeof useTemplateRef<HTMLElement>>) => void): Component {
  return defineComponent({
    setup() {
      setup(useTemplateRef<HTMLElement>("target"))
      return () => h("div", { id: "target", ref: "target" })
    },
  })
}

function withSvgTarget(setup: (target: ReturnType<typeof useTemplateRef<SVGPathElement>>) => void): Component {
  return defineComponent({
    setup() {
      setup(useTemplateRef<SVGPathElement>("target"))
      return () => h("svg", [h("path", { id: "target", ref: "target", d: "M0 0L10 10" })])
    },
  })
}

function withoutTarget(
  setup: () => void,
  render: () => ReturnType<typeof h> = () => h("div", { id: "target" })
): Component {
  return defineComponent({
    setup() {
      setup()
      return render
    },
  })
}

const svg_render = () => h("svg", [h("path", { id: "target", d: "M0 0L10 10" })])

const cases: Case[] = [
  {
    export: "useAnimate",
    name: "template ref",
    component: withTarget(t => useAnimate(t, { opacity: [0, 1] })),
    html: box,
  },
  {
    export: "useAnimate",
    name: "selector",
    component: withoutTarget(() => useAnimate("#target", { opacity: [0, 1] })),
    html: box,
  },
  {
    export: "useRawAnimate",
    name: "inside onMounted",
    component: withoutTarget(() => onMounted(() => useRawAnimate("#target", { opacity: [0, 1] }))),
    html: box,
  },
  {
    export: "useAnimatable",
    name: "template ref",
    component: withTarget(t => useAnimatable(t, { x: 100 })),
    html: box,
  },
  {
    export: "useAnimatable",
    name: "selector",
    component: withoutTarget(() => useAnimatable("#target", { x: 100 })),
    html: box,
  },
  {
    export: "useRawAnimatable",
    name: "inside onMounted",
    component: withoutTarget(() => onMounted(() => useRawAnimatable("#target", { x: 100 }))),
    html: box,
  },
  { export: "useDraggable", name: "template ref", component: withTarget(t => useDraggable(t)), html: box },
  { export: "useDraggable", name: "selector", component: withoutTarget(() => useDraggable("#target")), html: box },
  { export: "useLayout", name: "template ref", component: withTarget(t => useLayout(t)), html: box },
  { export: "useLayout", name: "selector", component: withoutTarget(() => useLayout("#target")), html: box },
  {
    export: "AnimeLayout",
    name: "component",
    component: () => h(AnimeLayout, { as: "ul", options: { duration: 300 } }, () => h("li", "item")),
    html: "<ul><li>item</li></ul>",
  },
  {
    export: "AnimeLayout",
    name: "component as root",
    component: () =>
      h(
        AnimeLayout,
        {
          as: defineComponent(
            (_, { slots }) =>
              () =>
                h("ul", slots.default?.())
          ),
        },
        () => h("li", "item")
      ),
    html: "<ul><li>item</li></ul>",
  },
  {
    export: "AnimeTransition",
    name: "without appear",
    component: () => h(AnimeTransition, { enter: { opacity: [0, 1] } }, () => h("p", "hi")),
    html: "<p>hi</p>",
  },
  {
    export: "AnimeTransition",
    name: "appear renders enter's starting values",
    component: () =>
      h(AnimeTransition, { appear: true, enter: { opacity: [0, 1], translateY: [20, 0] } }, () => h("p", "hi")),
    html: '<p style="opacity:0;transform:translateY(20px);" data-anime-ssr="opacity,transform">hi</p>',
  },
  {
    export: "AnimeTransition",
    name: "appear with nothing rendered",
    component: () => h(AnimeTransition, { appear: true, enter: { opacity: [0, 1] } }, () => null),
    html: "<!---->",
  },
  { export: "useScope", name: "no target", component: withoutTarget(() => useScope({})), html: box },
  {
    export: "AnimeScope",
    name: "component",
    component: () => h(AnimeScope, { as: "section", options: { defaults: { duration: 300 } } }, () => h("p", "item")),
    html: "<section><p>item</p></section>",
  },
  { export: "useScroll", name: "template ref", component: withTarget(t => useScroll(t, t)), html: box },
  { export: "useScroll", name: "selector", component: withoutTarget(() => useScroll("#target", "#target")), html: box },
  { export: "useSvg", name: "no target", component: withoutTarget(() => useSvg()), html: box },
  { export: "useSvgDrawable", name: "template ref", component: withSvgTarget(t => useSvgDrawable(t)), html: path },
  {
    export: "useSvgDrawable",
    name: "selector",
    component: withoutTarget(() => useSvgDrawable("#target"), svg_render),
    html: path,
  },
  { export: "useText", name: "template ref", component: withTarget(t => useText(t)), html: box },
  { export: "useText", name: "selector", component: withoutTarget(() => useText("#target")), html: box },
  {
    export: "useTimeline",
    name: "no target",
    component: withoutTarget(() => useTimeline({ autoplay: true })),
    html: box,
  },
  { export: "useTimer", name: "no target", component: withoutTarget(() => useTimer({ duration: 1000 })), html: box },
  { export: "useWaapi", name: "template ref", component: withTarget(t => useWaapi(t, { opacity: [0, 1] })), html: box },
  {
    export: "useWaapi",
    name: "selector",
    component: withoutTarget(() => useWaapi("#target", { opacity: [0, 1] })),
    html: box,
  },
  {
    export: "vAnimate",
    name: "directive",
    component: () => withDirectives(h("div", { id: "target" }), [[vAnimate, { translateX: 100 }]]),
    html: box,
  },
  {
    export: "vWaapi",
    name: "directive",
    component: () => withDirectives(h("div", { id: "target" }), [[vWaapi, { translateX: 100 }]]),
    html: box,
  },
  {
    export: "vDraggable",
    name: "directive",
    component: () => withDirectives(h("div", { id: "target" }), [[vDraggable]]),
    html: box,
  },
  {
    export: "vSvgDrawable",
    name: "directive",
    component: () =>
      h("svg", [withDirectives(h("path", { id: "target", d: "M0 0L10 10" }), [[vSvgDrawable, { draw: "0 1" }]])]),
    // Starting draw state; details covered in directives-ssr.test.ts
    html: '<svg><path id="target" d="M0 0L10 10" style="stroke-linecap:butt;" data-anime-ssr="stroke-linecap" pathLength="1000" stroke-dasharray="0 1010" stroke-dashoffset="0" data-anime-ssr-attrs="pathLength,stroke-dasharray,stroke-dashoffset"></path></svg>',
  },
  {
    export: "vTextSplit",
    name: "directive",
    component: () =>
      withDirectives(h("p", { id: "target" }, "Hello"), [
        [vTextSplit, { words: true, animation: { opacity: [0, 1] } }],
      ]),
    html: '<p id="target">Hello</p>',
  },
]

describe("SSR render (real animejs)", () => {
  it.each(cases)("$export ($name) renders to string", async ({ component, html }) => {
    await expect(renderSSRApp(component)).resolves.toBe(html)
  })

  it("covers every public composable, directive and component", () => {
    const covered = new Set(cases.map(c => c.export))
    const missing = Object.keys(lib).filter(key => /^(use|v|Anime)[A-Z]/.test(key) && !covered.has(key))
    expect(missing).toEqual([])
  })
})