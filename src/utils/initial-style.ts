import type { AnimationParams, WAAPIAnimationParams } from "animejs"
import { kebabCase } from "@src/utils/kebab-case.ts"

/**
 * Computes the inline style an element should have before its animation starts, so the server can
 * render the "from" state instead of the final one. Pure: no DOM access.
 *
 * Only unambiguous values are emitted: `prop: [from, to]` and `prop: { from }`. Function values,
 * `stagger()`, keyframes, relative values and bare numbers on unit-dependent properties (which
 * need the element's computed unit) are skipped. Emitting nothing is always safe.
 *
 * @param params - Anime.js `animate()` or `waapi.animate()` parameters.
 */
export function getInitialStyle(params: AnimationParams | WAAPIAnimationParams | undefined): Record<string, string> {
  const style: Record<string, string> = {}
  const transforms: Record<string, string> = {}

  for (const [key, value] of Object.entries(params ?? {})) {
    const from = getFrom(value)
    if (from === undefined) continue

    const transform = SHORT_TRANSFORMS[key] ?? key
    if (TRANSFORMS.includes(transform)) {
      const css_value = withUnit(from, transformUnit(transform))
      if (css_value !== undefined) transforms[transform] = css_value
    } else if (key.startsWith("--")) {
      // An empty value would render as `--var:;`, while Anime.js reads it as 0. Emitting nothing is safe.
      if (from !== "") style[key] = String(from)
    } else if (UNITLESS.has(key)) {
      if (isNumeric(from)) style[kebabCase(key)] = String(from)
    } else if (typeof from === "string" && HAS_UNIT.test(from)) {
      style[kebabCase(key)] = from
    }
  }

  // Anime.js writes transforms in a fixed order regardless of param order, so mirror it.
  const transform = TRANSFORMS.filter(name => name in transforms)
    .map(name => `${name}(${transforms[name]})`)
    .join(" ")
  if (transform) style.transform = transform

  return style
}

/**
 * The static start value of a tween param: the first value of a `[from, to]` array, or `from` of a
 * `{ from }` object. `undefined` for anything else (target-only values, function values, keyframes).
 *
 * @param value - One property's value from the animation params.
 */
export function getFrom(value: unknown): string | number | undefined {
  if (Array.isArray(value)) return value.length === 2 ? asPrimitive(value[0]) : undefined
  if (value !== null && typeof value === "object" && "from" in value) return asPrimitive(value.from)
  return undefined
}

/**
 * The value itself if it's a string or a number, otherwise `undefined`.
 *
 * @param value - Any value.
 */
export function asPrimitive(value: unknown): string | number | undefined {
  return typeof value === "number" || typeof value === "string" ? value : undefined
}

/**
 * Whether a value is a plain number with no unit: a finite number, or a numeric string like `"-20"`,
 * `".5"` or `"1e3"`.
 *
 * @param value - A tween value.
 */
export function isNumeric(value: string | number): boolean {
  return typeof value === "number" ? Number.isFinite(value) : NUMERIC.test(value)
}

/**
 * The unit Anime.js adds to a unitless number for a transform: none for `scale*`, `deg` for
 * `rotate*` / `skew*`, `px` for everything else (`translate*`, `perspective`).
 *
 * @param transform - A full transform name (`translateX`, not the `x` alias).
 */
export function transformUnit(transform: string): string {
  if (transform.startsWith("scale")) return ""
  if (transform.startsWith("rotate") || transform.startsWith("skew")) return "deg"
  return "px"
}

/**
 * A tween value as CSS: a unitless number gets `unit` appended, a number with an explicit unit
 * (`"-50%"`, `"1turn"`) is kept as-is, and anything else (relative values, keywords, `calc()`)
 * gives `undefined`.
 *
 * @param value - A tween value.
 * @param unit - The unit to append to a unitless number, e.g. from `transformUnit`.
 */
export function withUnit(value: string | number, unit: string): string | undefined {
  if (isNumeric(value)) return `${value}${unit}`
  return typeof value === "string" && HAS_UNIT.test(value) ? value : undefined
}

// Order matters: it's the order Anime.js builds the `transform` string in.
const TRANSFORMS = [
  "perspective",
  "translateX",
  "translateY",
  "translateZ",
  "rotate",
  "rotateX",
  "rotateY",
  "rotateZ",
  "scale",
  "scaleX",
  "scaleY",
  "scaleZ",
  "skew",
  "skewX",
  "skewY",
]

const SHORT_TRANSFORMS: Record<string, string> = { x: "translateX", y: "translateY", z: "translateZ" }

const UNITLESS = new Set(["opacity", "zIndex", "order", "flexGrow", "flexShrink", "fontWeight"])

const NUMERIC = /^-?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i
const HAS_UNIT = /^-?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?([a-z]+|%)$/i