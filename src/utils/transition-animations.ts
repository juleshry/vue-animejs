import { type AnimationParams, type FunctionValue, type JSAnimation, type TweenParamValue } from "animejs"
import { Comment, type DirectiveArguments, Fragment, isVNode, onUnmounted, Text, type VNode, withDirectives } from "vue"
import { useRawAnimate } from "../composables/use-raw-animate.ts"

/** The Anime.js animations a transition component plays on its children. */
export interface TransitionAnimations {
  /**
   * Plays `params` on `el`, cancelling whatever was running there, then calls `done`. Without `params`, calls `done`
   * right away. `delay_offset` (ms) is added to `params.delay`, for staggering.
   */
  play: (el: Element, params: AnimationParams | undefined, done?: () => void, delay_offset?: number) => void
  /** Stops the animation running on `el`, where it is. */
  cancel: (el: Element) => void
}

/**
 * The animations of a transition component, one per element at a time, all cancelled when the component unmounts.
 * Call it in the component's `setup()`.
 */
export function useTransitionAnimations(): TransitionAnimations {
  const running = new Map<Element, JSAnimation>()

  function play(el: Element, params: AnimationParams | undefined, done?: () => void, delay_offset = 0) {
    cancel(el)
    if (!params) return done?.()

    const options: AnimationParams = {
      ...params,
      onComplete: self => {
        running.delete(el)
        params.onComplete?.(self)
        done?.()
      },
    }
    if (delay_offset) options.delay = offsetDelay(params.delay, delay_offset)
    running.set(el, useRawAnimate(el, options))
  }

  function cancel(el: Element) {
    running.get(el)?.cancel()
    running.delete(el)
  }

  onUnmounted(() => {
    for (const el of [...running.keys()]) cancel(el)
  })

  return { play, cancel }
}

/**
 * Applies `directives` to every element or component in `children`, e.g. `vAppearState` so an `appear` also plays
 * after hydration. Fragments (a `v-for`) are flattened, as `<TransitionGroup>` does anyway; comments and text are
 * left alone, since they can't carry a directive.
 *
 * @param children - The default slot's vnodes.
 * @param directives - The directives to apply, as `withDirectives` takes them.
 */
export function withChildDirectives(
  children: VNode[] | undefined,
  directives: DirectiveArguments
): VNode[] | undefined {
  if (!directives.length) return children
  return children?.flatMap(child => {
    if (!isVNode(child) || child.type === Comment || child.type === Text) return [child]
    if (child.type === Fragment) return withChildDirectives(child.children as VNode[], directives) ?? []
    return [withDirectives(child, directives)]
  })
}

// Only a number or a function delay can be offset; any other form is left as it is
function offsetDelay(delay: TweenParamValue | undefined, offset: number): TweenParamValue {
  if (delay === undefined || typeof delay === "number") return (delay ?? 0) + offset
  if (typeof delay === "function") {
    const fn = delay as FunctionValue
    return ((...args: Parameters<FunctionValue>) => Number(fn(...args)) + offset) as FunctionValue
  }
  return delay
}