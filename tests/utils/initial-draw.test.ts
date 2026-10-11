import { describe, it, expect } from "vitest"
import { animate, stagger, svg, type AnimationParams } from "animejs"
import { reactive, readonly } from "vue"
import { getDrawFrom, getInitialDraw, parseDraw } from "@src/utils/initial-draw.ts"

// Expected strings are what Anime.js wrote in a real browser (Chrome) for the same params.
function drawn(dasharray: string, dashoffset: string) {
  return { pathLength: "1000", "stroke-dasharray": dasharray, "stroke-dashoffset": dashoffset }
}

describe("getInitialDraw", () => {
  describe("nothing drawn (createDrawable's own first paint)", () => {
    it.each<[string, AnimationParams | undefined]>([
      ["no params", undefined],
      ["a target-only draw", { draw: "0 1" }],
      ["a function draw", { draw: () => "0 1" }],
      ["a stagger() draw", { draw: stagger(0.1) }],
      ["a [from, to] starting at 0 0", { draw: ["0 0", "0 1"] }],
      ["a malformed from", { draw: ["nope", "0 1"] }],
    ])("for %s", (_, params) => {
      expect(getInitialDraw(params)).toEqual({ attrs: drawn("0 1010", "0"), style: { "stroke-linecap": "butt" } })
    })
  })

  it("uses the from of a [from, to] array", () => {
    expect(getInitialDraw({ draw: ["0.25 0.5", "0 1"] })).toEqual({ attrs: drawn("250 760", "-250"), style: {} })
  })

  it("uses the from of a { from, to } object", () => {
    expect(getInitialDraw({ draw: { from: "0.5 1", to: "0 1" } })).toEqual({
      attrs: drawn("500 510", "-500"),
      style: {},
    })
  })

  it("uses the first value of a keyframes array", () => {
    expect(getInitialDraw({ draw: ["0.2 0.2", "0.5 1", "0 1"] })).toEqual({
      attrs: drawn("0 1010", "-200"),
      style: { "stroke-linecap": "butt" },
    })
  })

  it("drops the 10-unit gap padding for a fully drawn path", () => {
    expect(getInitialDraw({ draw: ["0 1", "0 0"] }).attrs).toEqual(drawn("1000 0", "0"))
    expect(getInitialDraw({ draw: ["1 0", "0 0"] }).attrs).toEqual(drawn("-1000 2000", "-1000"))
  })

  it("adds the initial style of the other params", () => {
    expect(getInitialDraw({ draw: ["0 0", "0 1"], opacity: [0, 1] }).style).toEqual({
      opacity: "0",
      "stroke-linecap": "butt",
    })
  })

  describe("edge cases", () => {
    it("treats empty params like no params", () => {
      expect(getInitialDraw({})).toEqual(getInitialDraw(undefined))
    })

    it("renders nothing drawn when only other params are set", () => {
      expect(getInitialDraw({ opacity: [0, 1] })).toEqual({
        attrs: drawn("0 1010", "0"),
        style: { opacity: "0", "stroke-linecap": "butt" },
      })
    })

    it("switches to a butt cap whenever start equals end, not only at 0", () => {
      expect(getInitialDraw({ draw: ["0.5 0.5", "0 1"] })).toEqual({
        attrs: drawn("0 1010", "-500"),
        style: { "stroke-linecap": "butt" },
      })
      expect(getInitialDraw({ draw: ["1 1", "0 0"] })).toEqual({
        attrs: drawn("0 1010", "-1000"),
        style: { "stroke-linecap": "butt" },
      })
    })

    it("does not clamp values outside 0-1, like Anime.js", () => {
      expect(getInitialDraw({ draw: ["-0.5 1.5", "0 1"] }).attrs).toEqual(drawn("2000 -990", "500"))
      expect(getInitialDraw({ draw: ["0 2", "0 1"] }).attrs).toEqual(drawn("2000 -990", "0"))
    })

    it("keeps a negative dash for a reversed partial range, like Anime.js", () => {
      expect(getInitialDraw({ draw: ["1 0.5", "0 1"] }).attrs).toEqual(drawn("-500 1510", "-1000"))
    })

    it("renders a zero start as 0, not -0", () => {
      expect(getInitialDraw({ draw: ["0 0.5", "0 1"] }).attrs?.["stroke-dashoffset"]).toBe("0")
    })

    it("ignores numbers after the first two", () => {
      expect(getInitialDraw({ draw: ["0 0.5 1", "0 1"] }).attrs).toEqual(drawn("500 510", "0"))
    })

    it("adds transforms from the other params to the style", () => {
      expect(getInitialDraw({ draw: ["0 1", "0 0"], scale: [0.5, 1] }).style).toEqual({ transform: "scale(0.5)" })
    })

    it("returns fresh objects on every call", () => {
      const first = getInitialDraw(undefined)
      first.style!.color = "red"
      first.attrs!.pathLength = "1"
      expect(getInitialDraw(undefined)).toEqual({ attrs: drawn("0 1010", "0"), style: { "stroke-linecap": "butt" } })
    })

    // Known divergence: how Anime.js fills a missing number depends on the `to` value (for "0.5" -> "0 1"
    // it paints a -500 offset), so a malformed from isn't mirrored. It only affects the pre-hydration paint.
    it("renders nothing drawn for a single-value from instead of guessing Anime.js's fill", () => {
      expect(getInitialDraw({ draw: ["0.5", "0 1"] }).attrs).toEqual(drawn("0 1010", "0"))
    })
  })

  it.each<AnimationParams | undefined>([
    undefined,
    { draw: "0 1" },
    { draw: ["0.25 0.5", "0 1"] },
    { draw: { from: "0.5 1", to: "0 1" } },
    { draw: ["0.2 0.2", "0.5 1", "0 1"] },
    { draw: ["0 1", "0 0"] },
    // Regression: Anime.js ignores extra whitespace, parseDraw used to split on single spaces
    { draw: ["0  1", "0 0"] },
    { draw: [" 0.25 0.5 ", "0 1"] },
    { draw: ["1e-1 1", "0 0"] },
    { draw: ["0.5 0.5", "0 1"] },
    { draw: ["1 1", "0 0"] },
    { draw: ["-0.5 1.5", "0 1"] },
    { draw: ["0 2", "0 1"] },
    { draw: ["1 0.5", "0 1"] },
    { draw: ["0 0.5 1", "0 1"] },
    // Floating-point noise: same expressions as Anime.js, so the same strings
    { draw: ["0.57 0.58", "0 1"] },
    { draw: ["0.333 0.667", "0 1"] },
    { draw: ["0\t1", "0 0"] },
    { draw: [".5 .75", "0 1"] },
    { draw: ["+0.5 1", "0 1"] },
    { draw: ["0x1 1", "0 1"] },
    { draw: ["0.5 1", () => "0 1"] },
    { draw: { from: "0.5 1", to: "0 1", duration: 500, ease: "linear" } },
    { draw: [{ to: "0.5 1" }, { to: "0 1" }] },
    { draw: ["", "0 1"] },
  ])("matches the attributes Anime.js paints on creation: %o", params => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
    document.body.append(path)
    const drawable = svg.createDrawable(path)[0]
    if (params) animate(drawable, { ...params, autoplay: false })

    for (const [key, value] of Object.entries(getInitialDraw(params).attrs ?? {})) {
      expect(path.getAttribute(key), key).toBe(value)
    }
    path.remove()
  })
})

describe("getDrawFrom", () => {
  it.each<[string, unknown, string]>([
    ["a [from, to] array", ["0.25 0.5", "0 1"], "0.25 0.5"],
    ["a keyframes array", ["0.2 0.2", "0.5 1", "0 1"], "0.2 0.2"],
    ["a { from } object", { from: "0.5 1" }, "0.5 1"],
    ["a { from, to } object", { from: "0.5 1", to: "0 1" }, "0.5 1"],
  ])("returns the start of %s", (_, value, expected) => {
    expect(getDrawFrom(value)).toBe(expected)
  })

  it.each<[string, unknown]>([
    ["undefined", undefined],
    ["null", null],
    ["a target-only string", "0 1"],
    ["a function", () => "0 1"],
    ["a number", 1],
    ["a single-value array", ["0.5 1"]],
    ["an array with a function first", [() => "0 0", "0 1"]],
    ["an array of numbers", [0, 1]],
    ["a { to } object", { to: "0 1" }],
    ["a { from } object with a non-string from", { from: 0.5 }],
    ["a { from } object with a function from", { from: () => "0 0" }],
  ])("returns nothing drawn for %s", (_, value) => {
    expect(getDrawFrom(value)).toBe("0 0")
  })

  // Each case checked against what Anime.js paints, through getInitialDraw
  describe("edge cases", () => {
    it.each<[string, unknown, string]>([
      ["a function to", ["0.5 1", () => "0 1"], "0.5 1"],
      ["tween options next to from", { from: "0.5 1", to: "0 1", duration: 500, ease: "linear" }, "0.5 1"],
      ["an inherited from, like Anime.js", Object.create({ from: "0.5 1" }), "0.5 1"],
      ["a reactive array", reactive(["0.5 1", "0 1"]), "0.5 1"],
      ["a readonly object", readonly({ from: "0.5 1", to: "0 1" }), "0.5 1"],
    ])("returns the start with %s", (_, value, expected) => {
      expect(getDrawFrom(value)).toBe(expected)
    })

    it.each<[string, unknown]>([
      ["an empty array", []],
      ["a sparse array", Object.assign([], { 1: "0 1" })],
      ["a nested array", [["0.5 1"], "0 1"]],
      ["an array of keyframe objects", [{ to: "0.5 1" }, { to: "0 1" }]],
      ["an undefined from", { from: undefined, to: "0 1" }],
      ["a boolean", true],
    ])("returns nothing drawn for %s", (_, value) => {
      expect(getDrawFrom(value)).toBe("0 0")
    })

    // Left to parseDraw, which reads it as nothing drawn
    it.each<[string, unknown]>([
      ["an array", ["", "0 1"]],
      ["an object", { from: "", to: "0 1" }],
    ])("returns an empty from as-is in %s", (_, value) => {
      expect(getDrawFrom(value)).toBe("")
      expect(getInitialDraw({ draw: value } as AnimationParams).attrs).toEqual(drawn("0 1010", "0"))
    })

    // Known divergence: Anime.js throws on a value mixed with a keyframe object, leaving only
    // createDrawable's nothing-drawn paint. The input is invalid and fails on the client anyway.
    it("returns the first value of an invalid mixed array", () => {
      expect(getDrawFrom(["0.2 0.2", { to: "0 1" }])).toBe("0.2 0.2")
    })
  })
})

describe("parseDraw", () => {
  it.each<[string, [number, number]]>([
    ["0 1", [0, 1]],
    ["1 0", [1, 0]],
    ["0.25 0.5", [0.25, 0.5]],
    ["1e-1 1", [0.1, 1]],
    ["-0.5 1.5", [-0.5, 1.5]],
  ])("parses %o", (draw, expected) => {
    expect(parseDraw(draw)).toEqual(expected)
  })

  it.each<[string, [number, number]]>([
    ["0  1", [0, 1]],
    [" 0 1", [0, 1]],
    ["0 1 ", [0, 1]],
  ])("ignores extra whitespace in %o, like Anime.js", (draw, expected) => {
    expect(parseDraw(draw)).toEqual(expected)
  })

  it.each<string>(["", "abc", "0.5", "a 1", "0 b", "0,1"])("returns nothing drawn for the malformed %o", draw => {
    expect(parseDraw(draw)).toEqual([0, 0])
  })

  describe("edge cases", () => {
    it.each<[string, [number, number]]>([
      ["0\t1", [0, 1]],
      ["0\n1", [0, 1]],
      ["0 \t\n 1", [0, 1]],
    ])("treats any whitespace as a separator in %o, like Anime.js", (draw, expected) => {
      expect(parseDraw(draw)).toEqual(expected)
    })

    it("returns nothing drawn for whitespace only", () => {
      expect(parseDraw(" \t ")).toEqual([0, 0])
    })

    it.each<[string, [number, number]]>([
      [".5 .75", [0.5, 0.75]],
      ["+0.5 1", [0.5, 1]],
      ["1. 0.", [1, 0]],
      ["0 0.5e-1", [0, 0.05]],
      ["0x1 1", [1, 1]],
    ])("accepts the number format in %o, like Anime.js", (draw, expected) => {
      expect(parseDraw(draw)).toEqual(expected)
    })

    it("does not clamp large values, like Anime.js", () => {
      expect(parseDraw("1e3 1")).toEqual([1000, 1])
    })

    it("ignores numbers after the first two", () => {
      expect(parseDraw("0 1 2")).toEqual([0, 1])
    })

    // Regression: these parsed as Infinity and rendered `stroke-dasharray="-Infinity Infinity"`
    it.each<string>(["Infinity 1", "0 -Infinity", "1e400 1"])("returns nothing drawn for the non-finite %o", draw => {
      expect(parseDraw(draw)).toEqual([0, 0])
    })

    // Known divergence: Anime.js extracts the numbers and rebuilds the string from the `to` value's
    // template ("1px 2px" -> "1 2" for a "0 1" target), so this isn't mirrored. Malformed input only
    // affects the pre-hydration paint.
    it.each<string>(["1px 2px", "0.5 1abc"])("returns nothing drawn for numbers with units or junk in %o", draw => {
      expect(parseDraw(draw)).toEqual([0, 0])
    })
  })
})