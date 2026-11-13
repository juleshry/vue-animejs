import { type MaybeRefOrGetter, toValue } from "vue"
import { stagger as animeStagger } from "animejs"
import type { StaggerFunction, StaggerParams, TargetsArray } from "animejs"
import { type MaybeRefOptions, resolveOptions } from "../utils/resolve-options.ts"
import { setBindingKey } from "../utils/binding-key.ts"

/** What `stagger()` takes as its value: a number, a unit string or a `[from, to]` range. */
export type StaggerValue = number | string | [number, number] | [string, string]

type StaggerArgs = [MaybeRefOrGetter<StaggerValue>, MaybeRefOrGetter<MaybeRefOptions<StaggerParams>> | undefined]

// The key for calls without a targets array (a direct call): one spread shared by all of them
const no_targets: TargetsArray = []

/**
 * Anime.js's [`stagger`](https://animejs.com/documentation/utilities/stagger), with its values
 * computed per animation instead of once per function.
 *
 * Anime.js's `stagger()` computes its spread on the first animation that uses it and reuses it
 * afterwards. The composables rebuild their instance from the same options when the target changes
 * (a getter or ref target, a text re-split, a timeline rebuild), so with Anime.js's `stagger()`
 * targets past the first animation's count start with no delay, and `from: "center" | "last"` keeps
 * the old center. This one starts over for every animation (keyed on the animation's targets
 * array), so it's correct whatever the target count. A direct call outside an animation (no
 * `targets` argument) behaves like Anime.js's.
 *
 * The value and the parameters may be refs or getters, and so may each parameter: they are read
 * each time an animation is created, so a rebuild uses their current values. The composables don't
 * watch them: changing one doesn't re-create the animation by itself. (They are read while
 * Anime.js creates the animation, so if you create one inside your own `watchEffect` or
 * `computed`, that effect does depend on them.)
 *
 * Same name as Anime.js's and accepts everything it does, so it's a drop-in: import it from
 * `@juleshry/vue-animejs` (alias one of them when you need both in one file).
 *
 * @param val - The staggered value, or a `[from, to]` range.
 * @param params - Anime.js's stagger parameters (`from`, `grid`, `ease`, `start`, …).
 */
export function stagger(
  val: MaybeRefOrGetter<number>,
  params?: MaybeRefOrGetter<MaybeRefOptions<StaggerParams>>
): StaggerFunction<number>
export function stagger(
  val: MaybeRefOrGetter<string>,
  params?: MaybeRefOrGetter<MaybeRefOptions<StaggerParams>>
): StaggerFunction<string>
export function stagger(
  val: MaybeRefOrGetter<[number, number]>,
  params?: MaybeRefOrGetter<MaybeRefOptions<StaggerParams>>
): StaggerFunction<number>
export function stagger(
  val: MaybeRefOrGetter<[string, string]>,
  params?: MaybeRefOrGetter<MaybeRefOptions<StaggerParams>>
): StaggerFunction<string>
export function stagger(
  val: MaybeRefOrGetter<StaggerValue>,
  params?: MaybeRefOrGetter<MaybeRefOptions<StaggerParams>>
): StaggerFunction<number | string>
export function stagger(
  val: MaybeRefOrGetter<StaggerValue>,
  params?: MaybeRefOrGetter<MaybeRefOptions<StaggerParams>>
): StaggerFunction<number | string> {
  const args: StaggerArgs = [val, params]
  const per_animation = new WeakMap<TargetsArray, StaggerFunction<number | string>>()

  const fn: StaggerFunction<number | string> = (target, index, targets, prevTween, tl) => {
    const key = targets ?? no_targets
    let inner = per_animation.get(key)
    if (!inner) {
      inner = createInner(args)
      per_animation.set(key, inner)
    }
    return inner(target, index, targets, prevTween, tl)
  }

  // Compared by its arguments in a directive binding; no params and `{}` are the same spread
  setBindingKey(fn, [val, params ?? {}])
  return fn
}

// Reads the refs now, for this animation. Anime.js's overloads don't accept the union, though its
// implementation does
function createInner([val, params]: StaggerArgs): StaggerFunction<number | string> {
  const create = animeStagger as (val: StaggerValue, params?: StaggerParams) => StaggerFunction<number | string>
  return create(toValue(val), params === undefined ? undefined : resolveOptions<StaggerParams>(params))
}