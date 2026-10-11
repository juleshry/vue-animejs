import type { AnimationParams } from "animejs"
import { getInitialStyle } from "@src/utils/initial-style.ts"
import type { SSRInitialState } from "@src/utils/ssr-props.ts"

/**
 * Computes the attributes and style an SVG geometry element has once `svg.createDrawable()` and
 * `animate()` have painted their first frame, so the server can render the path's starting draw
 * state. Pure: no DOM access.
 *
 * `createDrawable` always paints `draw: "0 0"` (nothing drawn) first. A static `from` (`draw: [from, …]`
 * or `draw: { from }`) then replaces it, while a target-only, function or `stagger()` value keeps it.
 * Other params (e.g. `opacity`) go through `getInitialStyle`.
 *
 * Mirrors Anime.js's own arithmetic, assuming the element has no `vector-effect: non-scaling-stroke`
 * (its scale factor depends on layout, which the server can't know).
 *
 * @param params - The `v-svg-drawable` binding value.
 */
export function getInitialDraw(params: AnimationParams | undefined): SSRInitialState {
  const [start, end] = parseDraw(getDrawFrom(params?.draw))

  // Same expressions as Anime.js's drawable proxy, so the strings match what it writes
  const offset = start * -PATH_LENGTH
  const dash = end * PATH_LENGTH + offset
  const is_full = (start === 0 && end === 1) || (start === 1 && end === 0)
  const gap = PATH_LENGTH + (is_full ? 0 : 10) - dash

  const style = getInitialStyle(params)
  // Anime.js switches a non-butt cap to butt while nothing is drawn, so round caps don't show as dots
  if (start === end) style["stroke-linecap"] = "butt"

  return {
    attrs: { pathLength: `${PATH_LENGTH}`, "stroke-dasharray": `${dash} ${gap}`, "stroke-dashoffset": `${offset}` },
    style,
  }
}

/**
 * The static start value of a `draw` param: the first value of an array (`[from, to]` or keyframes),
 * or `from` of a `{ from }` object. Otherwise `"0 0"`, the nothing-drawn state `createDrawable` paints
 * before the animation starts (target-only, function or `stagger()` values).
 *
 * @param value - The `draw` value from the animation params.
 */
export function getDrawFrom(value: unknown): string {
  if (Array.isArray(value)) return value.length >= 2 && typeof value[0] === "string" ? value[0] : NOTHING_DRAWN
  if (value !== null && typeof value === "object" && "from" in value && typeof value.from === "string") {
    return value.from
  }
  return NOTHING_DRAWN
}

/**
 * Parses a `"start end"` draw string into its two numbers. Extra whitespace is ignored, as Anime.js
 * ignores it. A malformed string or a non-finite number gives `[0, 0]` (nothing drawn).
 *
 * @param draw - A draw value, e.g. `"0.25 0.5"`.
 */
export function parseDraw(draw: string): [number, number] {
  const values = draw.trim().split(/\s+/)
  const start = +values[0]
  const end = +values[1]
  // Non-finite values too: they would render as `stroke-dasharray="-Infinity Infinity"`
  return Number.isFinite(start) && Number.isFinite(end) ? [start, end] : [0, 0]
}

/** The `pathLength` Anime.js normalizes every drawable to. */
const PATH_LENGTH = 1000

const NOTHING_DRAWN = "0 0"