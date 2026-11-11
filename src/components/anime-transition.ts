import { type AnimationParams } from "animejs"
import { type BaseTransitionProps, defineComponent, h, type SlotsType, Transition, type VNode } from "vue"
import { type AppearState, vAppearState } from "../utils/appear-state.ts"
import { useTransitionAnimations, withChildDirectives } from "../utils/transition-animations.ts"

export interface AnimeTransitionProps {
  /** Anime.js animation parameters for the entering element, e.g. `{ opacity: [0, 1], translateY: [20, 0] }`. Without it, the element enters instantly. */
  enter?: AnimationParams
  /** Anime.js animation parameters for the leaving element, e.g. `{ opacity: 0 }`. Without it, the element leaves instantly. */
  leave?: AnimationParams
  /** Plays `enter` on the initial render too, including after hydration: the server renders `enter`'s starting values, so the element doesn't flash its final state first. */
  appear?: boolean
  /** `<Transition>`'s sequencing mode: `"out-in"` waits for the leave to finish before the enter starts, `"in-out"` the reverse. */
  mode?: BaseTransitionProps["mode"]
}

/**
 * Wraps Vue's `<Transition>` so the enter and leave animations are played by Anime.js. The default slot takes a single
 * element or component, toggled with `v-if` / `v-show` or swapped with a `key`, as with `<Transition>`.
 *
 * Other `<Transition>` listeners (`@after-enter`, `@after-leave`, ...) fall through to it.
 */
export const AnimeTransition = defineComponent(
  (props: AnimeTransitionProps, { slots }) => {
    const { play, cancel } = useTransitionAnimations()

    // A hydrated element's appear: Vue's <Transition> doesn't run one, so there's no `done` to call
    const appear_state: AppearState = {
      get enter() {
        return props.enter
      },
      start: el => play(el, props.enter),
    }

    return () => {
      const children = slots.default?.()
      return h(
        Transition,
        {
          css: false,
          appear: props.appear,
          mode: props.mode,
          // Also <Transition>'s appear hook on a client-side mount
          onEnter: (el: Element, done: () => void) => play(el, props.enter, done),
          onLeave: (el: Element, done: () => void) => play(el, props.leave, done),
          onEnterCancelled: cancel,
          onLeaveCancelled: cancel,
        },
        () => withChildDirectives(children, props.appear ? [[vAppearState, appear_state]] : [])
      )
    }
  },
  {
    name: "AnimeTransition",
    props: { enter: null, leave: null, appear: Boolean, mode: null },
    slots: Object as SlotsType<{ default?: () => VNode[] }>,
  }
)