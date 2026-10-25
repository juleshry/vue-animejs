import { type AnimationParams, type JSAnimation } from "animejs"
import {
  type BaseTransitionProps,
  Comment,
  defineComponent,
  h,
  isVNode,
  onUnmounted,
  type SlotsType,
  Text,
  Transition,
  type VNode,
  withDirectives,
} from "vue"
import { useRawAnimate } from "../composables/use-raw-animate.ts"
import { type AppearState, vAppearState } from "../utils/appear-state.ts"

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
    const running = new Map<Element, JSAnimation>()

    function play(el: Element, params: AnimationParams | undefined, done?: () => void) {
      cancel(el)
      if (!params) return done?.()

      const animation = useRawAnimate(el, {
        ...params,
        onComplete: self => {
          running.delete(el)
          params.onComplete?.(self)
          done?.()
        },
      })
      running.set(el, animation)
    }

    function cancel(el: Element) {
      running.get(el)?.cancel()
      running.delete(el)
    }

    // A hydrated element's appear: Vue's <Transition> doesn't run one, so there's no `done` to call
    const appear_state: AppearState = {
      get enter() {
        return props.enter
      },
      start: el => play(el, props.enter),
    }

    onUnmounted(() => {
      for (const el of [...running.keys()]) cancel(el)
    })

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
        () => (props.appear ? children?.map(child => withAppearState(child, appear_state)) : children)
      )
    }
  },
  {
    name: "AnimeTransition",
    props: { enter: null, leave: null, appear: Boolean, mode: null },
    slots: Object as SlotsType<{ default?: () => VNode[] }>,
  }
)

// Comments (a `v-if` that is false) and text nodes can't carry a directive
function withAppearState(child: VNode, state: AppearState): VNode {
  if (!isVNode(child) || child.type === Comment || child.type === Text) return child
  return withDirectives(child, [[vAppearState, state]])
}