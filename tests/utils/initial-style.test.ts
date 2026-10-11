import { describe, it, expect } from "vitest"
import { animate, stagger, type AnimationParams } from "animejs"
import { reactive, ref } from "vue"
import { asPrimitive, getFrom, getInitialStyle, isNumeric, transformUnit, withUnit } from "@src/utils/initial-style.ts"

describe("getInitialStyle", () => {
  it("returns nothing without params", () => {
    expect(getInitialStyle(undefined)).toEqual({})
  })

  describe("supported forms", () => {
    it("emits the first value of a [from, to] array", () => {
      expect(getInitialStyle({ opacity: [0, 1] })).toEqual({ opacity: "0" })
    })

    it("emits `from` of a { from } object", () => {
      expect(getInitialStyle({ opacity: { from: 0.2 } })).toEqual({ opacity: "0.2" })
    })

    it("emits `from` of a { from, to } object", () => {
      expect(getInitialStyle({ opacity: { from: 0, to: 1 } })).toEqual({ opacity: "0" })
    })
  })

  describe("skipped forms", () => {
    it.each<[string, AnimationParams]>([
      ["a single target value", { opacity: 1 }],
      ["a { to } object", { opacity: { to: 1 } }],
      ["a function value", { opacity: () => 0 }],
      ["a function `from` in an array", { opacity: [() => 0, 1] }],
      ["a function `from` in an object", { opacity: { from: () => 0 } }],
      ["stagger()", { translateX: stagger(10) }],
      ["a value keyframes array", { opacity: [0, 0.5, 1] }],
      ["a keyframes array of objects", { opacity: [{ to: 0 }, { to: 1 }] }],
      ["top-level keyframes", { keyframes: [{ opacity: 0 }, { opacity: 1 }] }],
      ["a relative value", { translateX: ["+=20", 0] }],
      ["a bare number on a unit-dependent property", { width: [10, 20] }],
      ["a unitless string on a unit-dependent property", { width: ["10", "20"] }],
      ["a non-numeric unitless value", { opacity: ["auto", 1] }],
      ["a color", { backgroundColor: ["#f00", "#00f"] }],
      ["animation options", { duration: 800, delay: 200, ease: "outQuad", autoplay: false, loop: 2 }],
    ])("skips %s", (_, params) => {
      expect(getInitialStyle(params)).toEqual({})
    })
  })

  describe("transforms", () => {
    it("applies Anime.js default units", () => {
      expect(
        getInitialStyle({
          translateX: [-20, 0],
          rotate: [45, 0],
          skewY: [10, 0],
          perspective: [100, 0],
          scale: [0.5, 1],
        })
      ).toEqual({ transform: "perspective(100px) translateX(-20px) rotate(45deg) scale(0.5) skewY(10deg)" })
    })

    it("keeps explicit units", () => {
      expect(getInitialStyle({ translateY: ["-50%", 0], rotateX: { from: "1turn" } })).toEqual({
        transform: "translateY(-50%) rotateX(1turn)",
      })
    })

    it("treats numeric strings as unitless numbers", () => {
      expect(getInitialStyle({ translateX: ["-20", 0], scale: ["0.5", 1] })).toEqual({
        transform: "translateX(-20px) scale(0.5)",
      })
    })

    it("maps the x/y/z aliases to translateX/Y/Z", () => {
      expect(getInitialStyle({ x: [-20, 0], y: [10, 0], z: [5, 0] })).toEqual({
        transform: "translateX(-20px) translateY(10px) translateZ(5px)",
      })
    })

    it("uses Anime.js's canonical order, not param order", () => {
      expect(getInitialStyle({ scale: [0.5, 1], rotate: [90, 0], translateX: [-20, 0] })).toEqual({
        transform: "translateX(-20px) rotate(90deg) scale(0.5)",
      })
    })

    it("skips only the unsupported transforms", () => {
      expect(getInitialStyle({ translateX: stagger(10), scale: [0.5, 1] })).toEqual({ transform: "scale(0.5)" })
    })
  })

  describe("CSS properties", () => {
    it("emits unitless properties as-is and in kebab-case", () => {
      expect(getInitialStyle({ zIndex: [1, 2], flexGrow: ["0", 1] })).toEqual({ "z-index": "1", "flex-grow": "0" })
    })

    it("emits unit-dependent properties only with an explicit unit, in kebab-case", () => {
      expect(
        getInitialStyle({ fontSize: ["12px", "20px"], width: ["50%", "100%"], marginTop: { from: "2rem" } })
      ).toEqual({ "font-size": "12px", width: "50%", "margin-top": "2rem" })
    })

    it("passes CSS variables through", () => {
      expect(getInitialStyle({ "--progress": [0, 1], "--color": { from: "red" } })).toEqual({
        "--progress": "0",
        "--color": "red",
      })
    })
  })

  describe("edge cases", () => {
    it("emits zero from values", () => {
      expect(getInitialStyle({ translateX: [0, 100], scale: [0, 1], opacity: [0, 1] })).toEqual({
        opacity: "0",
        transform: "translateX(0px) scale(0)",
      })
    })

    it("renders -0 as 0", () => {
      expect(getInitialStyle({ translateX: [-0, 10] })).toEqual({ transform: "translateX(0px)" })
    })

    it("emits negative unitless values", () => {
      expect(getInitialStyle({ zIndex: [-1, 1] })).toEqual({ "z-index": "-1" })
    })

    it("keeps an exponent numeric string as written", () => {
      expect(getInitialStyle({ opacity: ["1e-1", 1] })).toEqual({ opacity: "1e-1" })
    })

    it("accepts kebab-case property names", () => {
      expect(getInitialStyle({ "font-size": ["12px", "20px"] })).toEqual({ "font-size": "12px" })
    })

    it("emits a combined scale and per-axis scale separately, in Anime.js's order", () => {
      expect(getInitialStyle({ scaleX: [2, 1], scale: [0.5, 1] })).toEqual({ transform: "scale(0.5) scaleX(2)" })
    })

    it("reads reactive params, as a directive binding can be", () => {
      expect(getInitialStyle(reactive({ opacity: [0, 1], translateX: { from: -20 } }))).toEqual({
        opacity: "0",
        transform: "translateX(-20px)",
      })
    })

    it.each<[string, Record<string, unknown>]>([
      ["null", { opacity: null }],
      ["undefined", { translateX: undefined }],
      ["a -= relative value", { translateX: ["-=10", 0] }],
      ["a *= relative value", { scale: ["*=2", 1] }],
      ["an empty string", { opacity: ["", 1], translateX: ["", 0], width: ["", "10px"] }],
    ])("skips a property set to %s", (_, params) => {
      expect(getInitialStyle(params as AnimationParams)).toEqual({})
    })

    // Regression: an empty value rendered as `--var:;` on the server, while Anime.js reads it as 0
    it("skips an empty CSS variable", () => {
      expect(getInitialStyle({ "--progress": ["", 1] })).toEqual({})
    })

    // Known divergence: Anime.js paints `opacity: 50%`, but unitless properties only accept plain
    // numbers here. Skipping is safe, it only means no server style for that property.
    it("skips a percentage on a unitless property", () => {
      expect(getInitialStyle({ opacity: ["50%", 1] })).toEqual({})
    })
  })

  it("combines mixed params", () => {
    expect(
      getInitialStyle({
        opacity: [0, 1],
        translateY: [20, 0],
        scale: { from: 0.8 },
        backgroundColor: ["#f00", "#00f"],
        duration: 600,
        delay: stagger(50),
      })
    ).toEqual({ opacity: "0", transform: "translateY(20px) scale(0.8)" })
  })

  // The handoff is only seamless if the server style matches what Anime.js paints on creation.
  it.each<AnimationParams>([
    { opacity: [0, 1] },
    { translateX: [-20, 0], scale: [0.5, 1] },
    { scale: [0.5, 1], rotate: [-45, 0], translateY: ["1rem", 0] },
    { fontSize: ["12px", "20px"], zIndex: [1, 2] },
    { translateX: [0, 100], scale: [0, 1], opacity: [0, 1] },
    { scaleX: [2, 1], scale: [0.5, 1] },
    { "font-size": ["12px", "20px"], zIndex: [-1, 1] },
  ])("matches what Anime.js paints on creation: %o", params => {
    const server = document.createElement("div")
    for (const [key, value] of Object.entries(getInitialStyle(params))) server.style.setProperty(key, value)

    const client = document.createElement("div")
    document.body.append(client)
    animate(client, { ...params, autoplay: false })

    expect(normalize(server.style.cssText)).toEqual(normalize(client.style.cssText))
    client.remove()
  })
})

describe("getFrom", () => {
  it.each<[string, unknown, string | number]>([
    ["a [from, to] number array", [0, 1], 0],
    ["a [from, to] string array", ["-20%", 0], "-20%"],
    ["a { from } object", { from: 0.5 }, 0.5],
    ["a { from, to } object", { from: "1rem", to: "2rem" }, "1rem"],
  ])("returns the start of %s", (_, value, expected) => {
    expect(getFrom(value)).toBe(expected)
  })

  it.each<[string, unknown]>([
    ["a plain number", 1],
    ["a plain string", "0 1"],
    ["a function", () => 0],
    ["null", null],
    ["undefined", undefined],
    ["a single-value array", [0]],
    ["a value keyframes array", [0, 0.5, 1]],
    ["an array with a function from", [() => 0, 1]],
    ["an array of keyframe objects", [{ to: 0 }, { to: 1 }]],
    ["a { to } object", { to: 1 }],
    ["a { from } object with a function from", { from: () => 0 }],
    ["a { from } object with a null from", { from: null }],
  ])("returns undefined for %s", (_, value) => {
    expect(getFrom(value)).toBeUndefined()
  })
})

describe("asPrimitive", () => {
  it.each<string | number>([0, -1.5, "", "1rem", "abc"])("returns %o as-is", value => {
    expect(asPrimitive(value)).toBe(value)
  })

  // Left to isNumeric to reject
  it("returns NaN as-is, since it's a number", () => {
    expect(asPrimitive(Number.NaN)).toBeNaN()
  })

  it.each<[string, unknown]>([
    ["null", null],
    ["undefined", undefined],
    ["a boolean", true],
    ["an object", {}],
    ["an array", [0]],
    ["a function", () => 0],
  ])("returns undefined for %s", (_, value) => {
    expect(asPrimitive(value)).toBeUndefined()
  })

  describe("edge cases", () => {
    it("keeps the sign of -0", () => {
      expect(Object.is(asPrimitive(-0), -0)).toBe(true)
    })

    // Left to isNumeric to reject, like NaN
    it.each<number>([Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])("returns %o as-is", value => {
      expect(asPrimitive(value)).toBe(value)
    })

    it.each<number>([Number.MAX_VALUE, Number.MIN_VALUE, Number.MAX_SAFE_INTEGER])(
      "returns the extreme number %o as-is",
      value => {
        expect(asPrimitive(value)).toBe(value)
      }
    )

    it.each<string>([" ", "\t", "0 1", "+=20", "#f00"])("returns the string %o as-is, unparsed", value => {
      expect(asPrimitive(value)).toBe(value)
    })

    it("returns undefined for false, not only true", () => {
      expect(asPrimitive(false)).toBeUndefined()
    })

    it.each<[string, unknown]>([
      ["a bigint", 1n],
      ["a symbol", Symbol("0")],
      ["a boxed number", Object(5)],
      ["a boxed string", Object("1px")],
      ["a Date", new Date(0)],
      ["a null-prototype object", Object.create(null)],
    ])("returns undefined for %s", (_, value) => {
      expect(asPrimitive(value)).toBeUndefined()
    })

    // Params are read as-is: a ref or reactive value nested inside them isn't unwrapped
    it.each<[string, unknown]>([
      ["a ref", ref(0)],
      ["a reactive array", reactive([0, 1])],
    ])("does not unwrap %s", (_, value) => {
      expect(asPrimitive(value)).toBeUndefined()
    })
  })
})

describe("isNumeric", () => {
  it.each<string | number>([0, -20, 0.5, 1e3])("accepts the finite number %o", value => {
    expect(isNumeric(value)).toBe(true)
  })

  it.each<number>([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "rejects the non-finite number %o",
    value => {
      expect(isNumeric(value)).toBe(false)
    }
  )

  it.each<string>(["0", "-20", "0.5", ".5", "5.", "1e3", "1E-3", "-2.5e+2"])("accepts the numeric string %o", value => {
    expect(isNumeric(value)).toBe(true)
  })

  it.each<string>(["", " 1", "1 ", "1px", "50%", "+1", "+=20", "abc", "1.2.3", "--1", "e3", "."])(
    "rejects the string %o",
    value => {
      expect(isNumeric(value)).toBe(false)
    }
  )
})

describe("transformUnit", () => {
  it.each<string>(["scale", "scaleX", "scaleY", "scaleZ"])("adds no unit to %s", transform => {
    expect(transformUnit(transform)).toBe("")
  })

  it.each<string>(["rotate", "rotateX", "rotateY", "rotateZ", "skew", "skewX", "skewY"])(
    "uses deg for %s",
    transform => {
      expect(transformUnit(transform)).toBe("deg")
    }
  )

  it.each<string>(["translateX", "translateY", "translateZ", "perspective"])("uses px for %s", transform => {
    expect(transformUnit(transform)).toBe("px")
  })
})

describe("withUnit", () => {
  it.each<[number, string, string]>([
    [-20, "px", "-20px"],
    [45, "deg", "45deg"],
    [0.5, "", "0.5"],
    [0, "px", "0px"],
  ])("appends the unit to the number %o", (value, unit, expected) => {
    expect(withUnit(value, unit)).toBe(expected)
  })

  it.each<[string, string, string]>([
    ["-20", "px", "-20px"],
    [".5", "", ".5"],
    ["1e3", "deg", "1e3deg"],
  ])("appends the unit to the numeric string %o", (value, unit, expected) => {
    expect(withUnit(value, unit)).toBe(expected)
  })

  it.each<string>(["-50%", "2rem", "1turn", "0.5rad", "1e2px"])("keeps the explicit unit of %o", value => {
    expect(withUnit(value, "px")).toBe(value)
  })

  // The explicit unit isn't checked against the default: withUnit doesn't know which property it's for
  it("keeps an explicit unit that differs from the default", () => {
    expect(withUnit("10deg", "px")).toBe("10deg")
  })

  it.each<string | number>([
    "+=20",
    "-=10px",
    "abc",
    "",
    "calc(10px + 1rem)",
    "10 px",
    Number.NaN,
    Number.POSITIVE_INFINITY,
  ])("returns undefined for %o", value => {
    expect(withUnit(value, "px")).toBeUndefined()
  })
})

function normalize(css_text: string): string[] {
  return css_text
    .split(";")
    .map(declaration => declaration.trim())
    .filter(Boolean)
    .sort()
}