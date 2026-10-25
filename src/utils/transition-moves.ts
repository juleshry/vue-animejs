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

/** The moves of a transition group's children, animated by Anime.js. */
export interface TransitionMoves {
  /** Tracks a child's element, so its position can be compared across updates. Apply it to every child. */
  vTrack: ObjectDirective<Element>
  /** Takes a leaving element out of the layout where it is, so the others start moving right away. */
  leave: (el: Element) => void
  /** Puts an element whose leave was cancelled back into the layout. */
  restore: (el: Element) => void
}

/**
 * Animates the children of a transition group from their old position to their new one whenever an update moves them
 * (FLIP): positions are recorded before the update and compared after it. Leaving children are taken out of the
 * layout first, so the ones after them move as soon as the leave starts instead of jumping once it ends.
 *
 * Call it in the component's `setup()`.
 *
 * @param params - The move animation's timing (`duration`, `ease`, ...), or `false` to not animate moves.
 */
export function useTransitionMoves(params: () => AnimationParams | false): TransitionMoves {
  const elements = new Set<Element>()
  // A leaving element's inline style before it was taken out of the layout (weak: Vue removes it once it has left)
  const leaving = new WeakMap<Element, string>()
  const moving = new Map<Element, JSAnimation>()
  // Where each child was on screen before the update, to animate it from there
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
    if (move === false) return
    // Drop the transforms of moves still running: the new one starts from where the element is now on screen,
    // which the recorded position already includes
    for (const animation of moving.values()) animation.revert()
    moving.clear()

    for (const [el, old] of before) {
      // A child removed by this update is leaving: it keeps its frozen position
      if (!elements.has(el) || leaving.has(el)) continue
      const now = el.getBoundingClientRect()
      const dx = old.left - now.left
      const dy = old.top - now.top
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue

      const animation = useRawAnimate(el, {
        ...move,
        translateX: [dx, 0],
        translateY: [dy, 0],
        onComplete: self => {
          moving.delete(el)
          move.onComplete?.(self)
        },
      })
      moving.set(el, animation)
    }
  })

  onUnmounted(() => {
    for (const animation of moving.values()) animation.cancel()
  })

  // Created per component instance, so it can keep that instance's elements
  const vTrack: ObjectDirective<Element> = {
    mounted: el => void elements.add(el),
    unmounted: el => void elements.delete(el),
  }

  function leave(el: Element) {
    if (params() === false || !(el instanceof HTMLElement)) return
    leaving.set(el, el.style.cssText)
    const box = boxes.get(el) ?? layoutBox(el)
    Object.assign(el.style, {
      position: "absolute",
      left: `${box.left}px`,
      top: `${box.top}px`,
      width: `${box.width}px`,
      height: `${box.height}px`,
      margin: "0",
      boxSizing: "border-box",
    })
  }

  function restore(el: Element) {
    const style = leaving.get(el)
    if (style === undefined) return
    leaving.delete(el)
    if (el instanceof HTMLElement) el.style.cssText = style
  }

  return { vTrack, leave, restore }
}

// offsetLeft / offsetTop are relative to the containing block an absolutely positioned element would use, and ignore
// transforms (an enter still running), as do offsetWidth / offsetHeight
function layoutBox(el: HTMLElement): LayoutBox {
  return { left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight }
}