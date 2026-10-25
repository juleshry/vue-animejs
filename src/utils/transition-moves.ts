import { type AnimationParams, type JSAnimation } from "animejs"
import { type ObjectDirective, onBeforeUpdate, onUnmounted, onUpdated } from "vue"
import { useRawAnimate } from "../composables/use-raw-animate.ts"

/** Where an element sits in the layout, as `position: absolute` would place it. */
interface LayoutBox {
  left: number
  top: number
  width: number
  height: number
}

/** A move running on an element: the offset it animates down to 0, written to the element's `translate`. */
interface Move {
  offset: { x: number; y: number }
  animation: JSAnimation
  /** The element's inline `translate` before its first move, put back once the last one completes. */
  original: string
}

/** The moves of a transition group's children, animated by Anime.js. */
export interface TransitionMoves {
  /** Tracks a child's element, so its position can be compared across updates. Apply it to every child. */
  vTrack: ObjectDirective<Element>
  /** Takes a leaving element out of the layout where it is, so the others start moving right away. */
  leave: (el: Element) => void
  /** Puts an element taken out of the layout back into it, once its leave is cancelled or done (`v-show`). */
  restore: (el: Element) => void
}

/**
 * Animates the children of a transition group from their old position to their new one whenever an update moves them
 * (FLIP): positions are recorded before the update and compared after it. Leaving children are taken out of the
 * layout first, so the ones after them move as soon as the leave starts instead of jumping once it ends.
 *
 * Moves animate the CSS `translate` property, not `transform`, so they add up with an enter or leave animation that
 * translates the same element, and a new move starts from wherever the previous one had got to.
 *
 * Call it in the component's `setup()`.
 *
 * @param params - The move animation's timing (`duration`, `ease`, ...), or `false` to not animate moves.
 */
export function useTransitionMoves(params: () => AnimationParams | false): TransitionMoves {
  const elements = new Set<Element>()
  // A leaving element's inline style before it was taken out of the layout (weak: Vue removes it once it has left)
  const leaving = new WeakMap<Element, string>()
  const moving = new Map<Element, Move>()
  // Where each child was on screen before the update, to animate it from there. Only set during an update: a leave
  // outside of one (a `v-show` in a child component) measures the element where it is
  let before = new Map<Element, DOMRect>()
  // Its layout box before the update, to freeze it there if it leaves. Measured up front: the children leave one by
  // one, and once the first is out of the layout the next one has already moved into its place
  let boxes = new Map<Element, LayoutBox>()

  onBeforeUpdate(() => {
    before = new Map()
    boxes = new Map()
    if (params() === false) return
    for (const el of elements) {
      if (leaving.has(el)) continue
      before.set(el, el.getBoundingClientRect())
      if (el instanceof HTMLElement) boxes.set(el, layoutBox(el))
    }
  })

  onUpdated(() => {
    const move = params()
    const recorded = before
    before = new Map()
    boxes = new Map()
    if (move === false) return

    for (const [el, old] of recorded) {
      // A child removed by this update is leaving: it keeps its frozen position
      if (!elements.has(el) || leaving.has(el)) continue
      // Both rects include the same transform and translate (no frame has passed), so this is how far the layout moved
      const now = el.getBoundingClientRect()
      const dx = old.left - now.left
      const dy = old.top - now.top
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue
      if (!(el instanceof HTMLElement || el instanceof SVGElement)) continue

      const previous = moving.get(el)
      previous?.animation.cancel()
      const offset = { x: dx + (previous?.offset.x ?? 0), y: dy + (previous?.offset.y ?? 0) }
      const original = previous ? previous.original : el.style.translate
      const write = () => (el.style.translate = `${offset.x}px ${offset.y}px`)
      // Now, not on the first tick: the layout has already moved, and this frame would show it jump
      write()
      const animation = useRawAnimate(offset, {
        ...move,
        x: 0,
        y: 0,
        onUpdate: self => {
          write()
          move.onUpdate?.(self)
        },
        onComplete: self => {
          moving.delete(el)
          el.style.translate = original
          move.onComplete?.(self)
        },
      })
      moving.set(el, { offset, animation, original })
    }
  })

  onUnmounted(() => {
    for (const { animation } of moving.values()) animation.cancel()
  })

  // Created per component instance, so it can keep that instance's elements
  const vTrack: ObjectDirective<Element> = {
    mounted: el => void elements.add(el),
    // Called as soon as a child starts leaving, not once it's gone: a move still running there finishes on its own
    unmounted: el => void elements.delete(el),
  }

  function leave(el: Element) {
    if (params() === false || !(el instanceof HTMLElement)) return
    const rect = before.get(el) ?? el.getBoundingClientRect()
    const box = boxes.get(el) ?? layoutBox(el)
    leaving.set(el, el.style.cssText)
    Object.assign(el.style, {
      position: "absolute",
      left: `${box.left}px`,
      top: `${box.top}px`,
      width: `${box.width}px`,
      height: `${box.height}px`,
      margin: "0",
      boxSizing: "border-box",
    })
    // The offsets are relative to the offsetParent, but a closer transformed (or filtered, contained, ...) ancestor
    // can be the containing block instead: correct by however far the element landed from where it was
    const now = el.getBoundingClientRect()
    if (Math.abs(rect.left - now.left) >= 0.5) el.style.left = `${box.left + rect.left - now.left}px`
    if (Math.abs(rect.top - now.top) >= 0.5) el.style.top = `${box.top + rect.top - now.top}px`
  }

  function restore(el: Element) {
    const style = leaving.get(el)
    if (style === undefined) return
    leaving.delete(el)
    if (!(el instanceof HTMLElement)) return
    // A move may still be running (or have ended) since: keep its translate
    const translate = el.style.translate
    el.style.cssText = style
    el.style.translate = translate
  }

  return { vTrack, leave, restore }
}

// offsetLeft / offsetTop are relative to the containing block an absolutely positioned element would usually use, and
// ignore transforms (an enter still running), as do offsetWidth / offsetHeight
function layoutBox(el: HTMLElement): LayoutBox {
  return { left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight }
}