import { type AnimationParams } from "animejs"
import { defineComponent, type DirectiveArguments, h, nextTick, type SlotsType, TransitionGroup, type VNode } from "vue"
import { type AppearState, vAppearState } from "../utils/appear-state.ts"
import { useTransitionAnimations, withChildDirectives } from "../utils/transition-animations.ts"
import { useTransitionMoves } from "../utils/transition-moves.ts"

export interface AnimeTransitionGroupProps {
  /** The element rendered around the children, e.g. `"ul"`. Without it, the children are rendered without a wrapper, as with `<TransitionGroup>`. */
  tag?: string
  /** Anime.js animation parameters for each entering element, e.g. `{ opacity: [0, 1], translateY: [20, 0] }`. Without it, elements enter instantly. */
  enter?: AnimationParams
  /** Anime.js animation parameters for each leaving element, e.g. `{ opacity: 0 }`. Without it, elements leave instantly. */
  leave?: AnimationParams
  /** Plays `enter` on the initial render too, including after hydration: the server renders `enter`'s starting values, so the elements don't flash their final state first. */
  appear?: boolean
  /** Delay (ms) between elements that enter, or leave, at the same time, added to their `delay`. Defaults to `0`. */
  stagger?: number
  /**
   * Timing of the animation that moves the other children to their new place when one enters or leaves (`duration`,
   * `ease`, ...), or `false` to let them jump. Defaults to `{ duration: 400 }`.
   */
  move?: AnimationParams | false
}

/**
 * Wraps Vue's `<TransitionGroup>` so the enter and leave animations of each child are played by Anime.js. Children
 * need a `key`, as with `<TransitionGroup>`; elements entering or leaving together can be staggered with `stagger`.
 *
 * The other children move to their new place instead of jumping: a leaving child is taken out of the layout (frozen
 * with `position: absolute` where it is) and the rest animate there with `move`. Other `<TransitionGroup>` listeners
 * (`@after-enter`, `@after-leave`, ...) fall through to it.
 */
export const AnimeTransitionGroup = defineComponent(
  (props: AnimeTransitionGroupProps, { slots }) => {
    const { play, cancel } = useTransitionAnimations()
    const moves = useTransitionMoves(() => (props.move === undefined ? DEFAULT_MOVE : props.move))
    const enterOrder = batchOrder()
    const leaveOrder = batchOrder()

    function enter(el: Element, done?: () => void) {
      play(el, props.enter, done, enterOrder() * (props.stagger ?? 0))
    }

    // A hydrated element's appear: Vue's <TransitionGroup> doesn't run one, so there's no `done` to call
    const appear_state: AppearState = {
      get enter() {
        return props.enter
      },
      start: el => enter(el),
    }

    return () => {
      const children = slots.default?.()
      const directives: DirectiveArguments = [[moves.vTrack]]
      if (props.appear) directives.push([vAppearState, appear_state])
      return h(
        TransitionGroup,
        {
          tag: props.tag,
          css: false,
          appear: props.appear,
          // Also <TransitionGroup>'s appear hook on a client-side mount
          onEnter: enter,
          onLeave: (el: Element, done: () => void) => {
            moves.leave(el)
            play(el, props.leave, done, leaveOrder() * (props.stagger ?? 0))
          },
          onEnterCancelled: cancel,
          onLeaveCancelled: (el: Element) => {
            cancel(el)
            moves.restore(el)
          },
        },
        () => withChildDirectives(children, directives)
      )
    }
  },
  {
    name: "AnimeTransitionGroup",
    props: { tag: null, enter: null, leave: null, appear: Boolean, stagger: null, move: null },
    slots: Object as SlotsType<{ default?: () => VNode[] }>,
  }
)

const DEFAULT_MOVE: AnimationParams = { duration: 400 }

// Each call returns its position among the calls of the current tick: 0, 1, 2, ... then 0 again on the next tick.
// Vue calls the enter (or leave) hook of every child that changed in the same flush, so that's the stagger order
function batchOrder(): () => number {
  let count = 0
  return () => {
    if (count === 0) void nextTick(() => (count = 0))
    return count++
  }
}