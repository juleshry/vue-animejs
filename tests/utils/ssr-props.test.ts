import { describe, it, expect } from "vite-plus/test"
import { ssrRenderAttrs } from "@vue/server-renderer"
import type { StyleValue } from "vue"
import { SSR_ATTRS_ATTR, SSR_STYLE_ATTR, stripSSRProps, toDeclaration, toSSRProps } from "@src/utils/ssr-props.ts"

describe("toSSRProps", () => {
  it("returns the style and a marker listing its keys", () => {
    expect(toSSRProps({ style: { opacity: "0", transform: "scale(0.5)" } })).toEqual({
      style: { opacity: "0", transform: "scale(0.5)" },
      [SSR_STYLE_ATTR]: "opacity,transform",
    })
  })

  it("returns the attributes and a marker listing them", () => {
    expect(toSSRProps({ attrs: { pathLength: "1000", "stroke-dashoffset": "0" } })).toEqual({
      pathLength: "1000",
      "stroke-dashoffset": "0",
      [SSR_ATTRS_ATTR]: "pathLength,stroke-dashoffset",
    })
  })

  it("returns nothing when there is nothing to inject", () => {
    expect(toSSRProps({})).toEqual({})
    expect(toSSRProps({ style: {}, attrs: {} })).toEqual({})
  })

  describe("edge cases", () => {
    it("treats undefined style and attrs like missing ones", () => {
      expect(toSSRProps({ style: undefined, attrs: undefined })).toEqual({})
    })

    it("returns style, attributes and both markers together", () => {
      expect(toSSRProps({ style: { "stroke-linecap": "butt" }, attrs: { pathLength: "1000" } })).toEqual({
        style: { "stroke-linecap": "butt" },
        [SSR_STYLE_ATTR]: "stroke-linecap",
        pathLength: "1000",
        [SSR_ATTRS_ATTR]: "pathLength",
      })
    })

    it("omits the style marker when only attributes are injected, and vice versa", () => {
      expect(toSSRProps({ style: {}, attrs: { pathLength: "1000" } })).not.toHaveProperty(SSR_STYLE_ATTR)
      expect(toSSRProps({ style: { opacity: "0" }, attrs: {} })).not.toHaveProperty(SSR_ATTRS_ATTR)
    })

    it("lists keys in insertion order", () => {
      const props = toSSRProps({ style: { transform: "scale(0.5)", opacity: "0" }, attrs: { b: "1", a: "2" } })
      expect(props[SSR_STYLE_ATTR]).toBe("transform,opacity")
      expect(props[SSR_ATTRS_ATTR]).toBe("b,a")
    })

    it("lists CSS variables as-is", () => {
      expect(toSSRProps({ style: { "--progress": "0" } })[SSR_STYLE_ATTR]).toBe("--progress")
    })

    it("keeps and lists an attribute with an empty value", () => {
      expect(toSSRProps({ attrs: { "stroke-dashoffset": "" } })).toEqual({
        "stroke-dashoffset": "",
        [SSR_ATTRS_ATTR]: "stroke-dashoffset",
      })
    })

    it("does not mutate its input", () => {
      const state = { style: { opacity: "0" }, attrs: { pathLength: "1000" } }
      toSSRProps(state)
      expect(state).toEqual({ style: { opacity: "0" }, attrs: { pathLength: "1000" } })
    })

    // What actually reaches the HTML: Vue's own SSR attribute rendering of the returned props
    it("renders through Vue's ssrRenderAttrs as style, attributes and markers", () => {
      const props = toSSRProps({
        style: { opacity: "0", "--progress": "0.3" },
        attrs: { pathLength: "1000", "stroke-dasharray": "0 1010" },
      })
      expect(ssrRenderAttrs(props, "path")).toBe(
        ' style="opacity:0;--progress:0.3;" data-anime-ssr="opacity,--progress" pathLength="1000" stroke-dasharray="0 1010" data-anime-ssr-attrs="pathLength,stroke-dasharray"'
      )
    })
  })
})

describe("stripSSRProps", () => {
  function serverElement(style: string, keys: string): HTMLElement {
    const el = document.createElement("div")
    el.style.cssText = style
    el.setAttribute(SSR_STYLE_ATTR, keys)
    return el
  }

  function serverPath(attrs: Record<string, string>): SVGPathElement {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "path")
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value)
    el.setAttribute(SSR_ATTRS_ATTR, Object.keys(attrs).join(","))
    return el
  }

  describe("style", () => {
    it("removes the listed declarations and the marker", () => {
      const el = serverElement("opacity: 0; transform: scale(0.5)", "opacity,transform")
      stripSSRProps(el, null)
      expect(el.style.cssText).toBe("")
      expect(el.hasAttribute(SSR_STYLE_ATTR)).toBe(false)
    })

    it("keeps declarations it did not inject", () => {
      const el = serverElement("color: red; opacity: 0", "opacity")
      stripSSRProps(el, { style: { color: "red" } })
      expect(el.style.cssText).toBe("color: red;")
    })

    it("restores the user's value for a key both set (object style)", () => {
      const el = serverElement("opacity: 0; z-index: 1", "opacity,z-index")
      stripSSRProps(el, { style: { opacity: 0.5, zIndex: 3 } })
      expect(el.style.getPropertyValue("opacity")).toBe("0.5")
      expect(el.style.getPropertyValue("z-index")).toBe("3")
    })

    it("restores the user's value for a key both set (string and array styles)", () => {
      const string_el = serverElement("opacity: 0", "opacity")
      stripSSRProps(string_el, { style: "opacity: 0.5 !important" })
      expect(string_el.style.getPropertyValue("opacity")).toBe("0.5")
      expect(string_el.style.getPropertyPriority("opacity")).toBe("important")

      const array_el = serverElement("--progress: 0", "--progress")
      stripSSRProps(array_el, { style: [{ color: "red" }, { "--progress": "0.3" }] })
      expect(array_el.style.getPropertyValue("--progress")).toBe("0.3")
    })
  })

  describe("attributes", () => {
    it("removes the listed attributes and the marker", () => {
      const el = serverPath({ pathLength: "1000", "stroke-dasharray": "0 1010" })
      el.setAttribute("d", "M0 0L10 10")
      stripSSRProps(el, { d: "M0 0L10 10" })
      expect(el.getAttributeNames()).toEqual(["d"])
    })

    it("restores the user's value for an attribute both set", () => {
      const el = serverPath({ pathLength: "1000", "stroke-dasharray": "0 1010" })
      stripSSRProps(el, { pathLength: 1, "stroke-dasharray": null })
      expect(el.getAttribute("pathLength")).toBe("1")
      expect(el.hasAttribute("stroke-dasharray")).toBe(false)
    })
  })

  describe("edge cases", () => {
    it("strips style and attributes injected on the same element", () => {
      const el = serverPath({ pathLength: "1000" })
      el.style.cssText = "stroke-linecap: butt"
      el.setAttribute(SSR_STYLE_ATTR, "stroke-linecap")
      stripSSRProps(el, { d: "M0 0L10 10" })
      expect(el.style.cssText).toBe("")
      expect(el.getAttributeNames()).toEqual([])
    })

    it("strips style on an SVG element", () => {
      const el = serverPath({})
      el.style.cssText = "opacity: 0"
      el.setAttribute(SSR_STYLE_ATTR, "opacity")
      stripSSRProps(el, null)
      expect(el.style.cssText).toBe("")
    })

    it("treats undefined user props like null", () => {
      const el = serverElement("opacity: 0", "opacity")
      stripSSRProps(el, undefined)
      expect(el.style.cssText).toBe("")
    })

    it("tolerates a listed key that is no longer on the element", () => {
      const el = serverElement("color: red", "opacity")
      el.setAttribute(SSR_ATTRS_ATTR, "pathLength")
      expect(() => stripSSRProps(el, null)).not.toThrow()
      expect(el.style.cssText).toBe("color: red;")
      expect(el.hasAttribute(SSR_STYLE_ATTR)).toBe(false)
      expect(el.hasAttribute(SSR_ATTRS_ATTR)).toBe(false)
    })

    it("tolerates empty markers", () => {
      const el = serverElement("color: red", "")
      el.setAttribute(SSR_ATTRS_ATTR, "")
      expect(() => stripSSRProps(el, null)).not.toThrow()
      expect(el.style.cssText).toBe("color: red;")
      expect(el.getAttributeNames()).toEqual(["style"])
    })

    it("is idempotent, keeping restored user values on a second call", () => {
      const el = serverElement("opacity: 0", "opacity")
      stripSSRProps(el, { style: { opacity: 0.5 } })
      stripSSRProps(el, null)
      expect(el.style.getPropertyValue("opacity")).toBe("0.5")
    })

    it("only restores listed keys, never syncing the rest of the user's style", () => {
      const el = serverElement("opacity: 0; color: green", "opacity")
      stripSSRProps(el, { style: { opacity: 0.5, color: "red" } })
      expect(el.style.getPropertyValue("opacity")).toBe("0.5")
      expect(el.style.getPropertyValue("color")).toBe("green")
    })

    it("removes a key the user's style sets to an empty value", () => {
      const el = serverElement("opacity: 0", "opacity")
      stripSSRProps(el, { style: { opacity: "" } })
      expect(el.style.cssText).toBe("")
    })

    it("restores and removes CSS variables", () => {
      const restored = serverElement("--progress: 0", "--progress")
      stripSSRProps(restored, { style: { "--progress": "0.3" } })
      expect(restored.style.getPropertyValue("--progress")).toBe("0.3")

      const removed = serverElement("--progress: 0", "--progress")
      stripSSRProps(removed, null)
      expect(removed.style.getPropertyValue("--progress")).toBe("")
    })

    it("only restores listed attributes, never syncing the user's other attributes", () => {
      const el = serverPath({ pathLength: "1000" })
      el.setAttribute("d", "M0 0L10 10")
      stripSSRProps(el, { d: "M5 5L20 20", pathLength: 1 })
      expect(el.getAttribute("d")).toBe("M0 0L10 10")
      expect(el.getAttribute("pathLength")).toBe("1")
    })

    // Mirrors Vue 3's rule for non-boolean attributes (`patchAttr`): only null / undefined remove,
    // anything else is stringified, `false` included. Regression: `false` used to remove the attribute.
    it.each<[string, unknown, string | null]>([
      ["null", null, null],
      ["undefined", undefined, null],
      ["false", false, "false"],
      ["0", 0, "0"],
      ["an empty string", "", ""],
      ["true", true, "true"],
    ])("handles a user attribute value of %s", (_, value, expected) => {
      const el = serverPath({ "stroke-dashoffset": "-250" })
      stripSSRProps(el, { "stroke-dashoffset": value })
      expect(el.getAttribute("stroke-dashoffset")).toBe(expected)
    })

    it("round-trips what toSSRProps produces, leaving a client-only element", () => {
      const props = toSSRProps({
        style: { opacity: "0", transform: "translateY(20px)" },
        attrs: { pathLength: "1000", "stroke-dasharray": "0 1010" },
      })
      const el = document.createElementNS("http://www.w3.org/2000/svg", "path")
      el.setAttribute("d", "M0 0L10 10")
      el.style.color = "red"
      for (const [key, value] of Object.entries(props)) {
        if (key === "style") Object.assign(el.style, value)
        else el.setAttribute(key, String(value))
      }

      stripSSRProps(el, { d: "M0 0L10 10", style: { color: "red" } })
      expect(el.outerHTML).toBe('<path d="M0 0L10 10" style="color: red;"></path>')
    })
  })

  it("does nothing on an element the server did not touch", () => {
    const el = document.createElement("div")
    el.style.cssText = "opacity: 0"
    el.setAttribute("title", "x")
    stripSSRProps(el, null)
    expect(el.style.cssText).toBe("opacity: 0;")
    expect(el.getAttribute("title")).toBe("x")
  })
})

describe("toDeclaration", () => {
  it.each<[string, undefined | null | string]>([
    ["undefined", undefined],
    ["null", null],
    ["an empty string", ""],
  ])("returns an empty declaration for %s", (_, style) => {
    expect(toDeclaration(style).cssText).toBe("")
  })

  it("parses a string style, keeping !important", () => {
    const declaration = toDeclaration("color: red; opacity: 0.5 !important")
    expect(declaration.getPropertyValue("color")).toBe("red")
    expect(declaration.getPropertyValue("opacity")).toBe("0.5")
    expect(declaration.getPropertyPriority("opacity")).toBe("important")
  })

  it("converts camelCase object keys to kebab-case", () => {
    const declaration = toDeclaration({ zIndex: 3, backgroundColor: "red" })
    expect(declaration.getPropertyValue("z-index")).toBe("3")
    expect(declaration.getPropertyValue("background-color")).toBe("red")
  })

  it("accepts kebab-case object keys", () => {
    expect(toDeclaration({ "z-index": 2 }).getPropertyValue("z-index")).toBe("2")
  })

  it("keeps CSS variables as-is", () => {
    expect(toDeclaration({ "--progress": 0.3 }).getPropertyValue("--progress")).toBe("0.3")
  })

  it("stringifies number values", () => {
    expect(toDeclaration({ opacity: 0 }).getPropertyValue("opacity")).toBe("0")
  })

  it("skips null and undefined values", () => {
    // `null` isn't in Vue's StyleValue type, but `:style="{ color: cond ? 'red' : null }"` is common
    const style = { color: null, opacity: undefined, zIndex: 1 } as unknown as StyleValue
    const declaration = toDeclaration(style)
    expect(declaration.cssText).toBe("z-index: 1;")
  })

  it("merges an array style, later entries winning", () => {
    const declaration = toDeclaration([{ color: "red", opacity: 0 }, { color: "blue" }])
    expect(declaration.getPropertyValue("color")).toBe("blue")
    expect(declaration.getPropertyValue("opacity")).toBe("0")
  })

  it("merges string entries inside an array style", () => {
    const declaration = toDeclaration(["color: red", { opacity: 0 }])
    expect(declaration.getPropertyValue("color")).toBe("red")
    expect(declaration.getPropertyValue("opacity")).toBe("0")
  })

  it("returns a declaration detached from the document", () => {
    toDeclaration({ color: "red" })
    expect(document.body.style.color).toBe("")
    expect(document.querySelectorAll("[style]")).toHaveLength(0)
  })
})