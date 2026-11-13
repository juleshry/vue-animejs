import { describe, it, expect, onTestFinished } from "vite-plus/test"
import { defineComponent, nextTick, ref, shallowRef } from "vue"
import { animate, createTimeline, stagger as animeStagger, type StaggerFunction } from "animejs"
import { stagger, useAnimate, useTimeline, vTextSplit } from "@lib"
import { mountDirective, withSetup } from "../utils"

/** Wraps a stagger function to record what it returns for each target index. */
function record<T>(fn: StaggerFunction<T>): { fn: StaggerFunction<T>; values: T[] } {
  const values: T[] = []
  return {
    values,
    fn: (target, index, targets, prevTween, tl) => {
      const value = fn(target, index, targets, prevTween, tl)
      values[index!] = value
      return value
    },
  }
}

function makeTargets(count: number): { x: number }[] {
  return Array.from({ length: count }, () => ({ x: 0 }))
}

function delaysOf(fn: StaggerFunction<number>, count: number): number[] {
  const recorder = record(fn)
  animate(makeTargets(count), { x: 100, delay: recorder.fn, autoplay: false })
  return recorder.values
}

const spread = (count: number, step: number) => Array.from({ length: count }, (_, i) => i * step)

describe("stagger", () => {
  it("computes the spread per animation when the target count grows", () => {
    const delay = stagger(40)
    expect(delaysOf(delay, 18)).toEqual(spread(18, 40))
    expect(delaysOf(delay, 20)).toEqual(spread(20, 40))
  })

  it("fixes what Anime.js's stagger gets wrong when the target count grows", () => {
    const delay = animeStagger(40)
    delaysOf(delay, 18)
    expect(delaysOf(delay, 20).slice(18)).toEqual([0, 0])
  })

  it("computes the spread per animation when the target count shrinks", () => {
    const delay = stagger(10, { from: "last" })
    expect(delaysOf(delay, 5)).toEqual([40, 30, 20, 10, 0])
    expect(delaysOf(delay, 3)).toEqual([20, 10, 0])
  })

  it('recomputes `from: "center"` per animation', () => {
    const delay = stagger(10, { from: "center" })
    expect(delaysOf(delay, 3)).toEqual([10, 0, 10])
    expect(delaysOf(delay, 5)).toEqual([20, 10, 0, 10, 20])
  })

  it("keeps the same values when an animation refreshes", () => {
    const recorder = record(stagger(10, { from: "random", seed: 1 }))
    const animation = animate(makeTargets(4), { x: recorder.fn, autoplay: false })
    const before = [...recorder.values]
    animation.refresh()
    expect(recorder.values).toEqual(before)
  })

  it("staggers timeline positions per `add` group", () => {
    const position = stagger(100)
    const recorder = record(position)
    const tl = createTimeline({ autoplay: false })
    tl.add(makeTargets(2), { x: 1, duration: 100 }, recorder.fn)
    expect(recorder.values).toEqual([0, 100])
    tl.add(makeTargets(3), { x: 1, duration: 100 }, recorder.fn)
    expect(recorder.values).toEqual([200, 300, 400])
  })

  it("staggers a delay inside timeline position-staggered children over the whole group", () => {
    const recorder = record(stagger(10))
    const tl = createTimeline({ autoplay: false })
    tl.add(makeTargets(3), { x: 1, duration: 100, delay: recorder.fn }, stagger(0))
    expect(recorder.values).toEqual([0, 10, 20])
  })

  it("works like Anime.js's when called directly, without targets", () => {
    const fn = stagger(10, { total: 3 })
    expect([0, 1, 2].map(i => fn(undefined, i))).toEqual([0, 10, 20])
  })

  it("passes ranges and string values through", () => {
    const range = record(stagger([0, 100]))
    animate(makeTargets(3), { x: range.fn, autoplay: false })
    expect(range.values).toEqual([0, 50, 100])

    const rem = stagger("1rem")
    const targets = makeTargets(3)
    expect(targets.map((target, i) => rem(target, i, targets))).toEqual(["0rem", "1rem", "2rem"])
  })

  it("gives correct delays when a useAnimate getter target grows", async () => {
    const elements = shallowRef(Array.from({ length: 3 }, () => document.createElement("span")))
    const recorder = record(stagger(40))
    withSetup(() => useAnimate(() => elements.value, { opacity: [0, 1], delay: recorder.fn, autoplay: false }))
    await nextTick()
    expect(recorder.values).toEqual(spread(3, 40))

    elements.value = Array.from({ length: 5 }, () => document.createElement("span"))
    await nextTick()
    await nextTick()
    expect(recorder.values).toEqual(spread(5, 40))
  })

  it("reads a ref value for every animation", () => {
    const step = ref(40)
    const delay = stagger(step)
    expect(delaysOf(delay, 3)).toEqual([0, 40, 80])
    step.value = 20
    expect(delaysOf(delay, 3)).toEqual([0, 20, 40])
  })

  it("reads a getter value, a ref params object and ref params", () => {
    const step = ref(10)
    const from = ref<"first" | "last">("first")
    const delay = stagger(() => step.value * 2, { from })
    expect(delaysOf(delay, 3)).toEqual([0, 20, 40])
    from.value = "last"
    expect(delaysOf(delay, 3)).toEqual([40, 20, 0])

    const params = ref({ from: "center" as const })
    expect(delaysOf(stagger(10, params), 3)).toEqual([10, 0, 10])
  })

  it("accepts a ref to any stagger value", () => {
    const val = ref<number | string | [number, number] | [string, string]>([0, 100])
    const recorder = record(stagger(val))
    animate(makeTargets(3), { x: recorder.fn, autoplay: false })
    expect(recorder.values).toEqual([0, 50, 100])
  })

  it("uses a changed ref on the next rebuild, without rebuilding for it", async () => {
    const elements = shallowRef(Array.from({ length: 3 }, () => document.createElement("span")))
    const step = ref(40)
    // `modifier` records each output while the stagger itself stays in the options
    const values: number[] = []
    const delay = stagger(step, { modifier: (v: number) => (values.push(v), v) })
    const [{ animation }] = withSetup(() =>
      useAnimate(() => elements.value, { opacity: [0, 1], delay, autoplay: false })
    )
    await nextTick()
    const first = animation.value
    expect(values).toEqual([0, 40, 80])

    values.length = 0
    step.value = 10
    await nextTick()
    await nextTick()
    expect(animation.value).toBe(first)
    expect(values).toEqual([])

    elements.value = Array.from({ length: 4 }, () => document.createElement("span"))
    await nextTick()
    await nextTick()
    expect(values).toEqual([0, 10, 20, 30])
  })

  it("keys two animations of the same user array apart (Anime.js copies the targets per animation)", () => {
    const delay = stagger(10, { from: "last" })
    const shared = makeTargets(3)
    const first = record(delay)
    animate(shared, { x: 1, delay: first.fn, autoplay: false })
    shared.push({ x: 0 })
    const second = record(delay)
    animate(shared, { x: 1, delay: second.fn, autoplay: false })
    expect(first.values).toEqual([20, 10, 0])
    expect(second.values).toEqual([30, 20, 10, 0])
  })

  it("recomputes the spread when useTimeline rebuilds on more targets", async () => {
    const targets = shallowRef(makeTargets(2))
    const loop = ref(0)
    const values: number[] = []
    const position = stagger(100, { modifier: (v: number) => (values.push(v), v) })
    const [{ add }] = withSetup(() => useTimeline({ autoplay: false, loop }))
    add(() => targets.value, { x: 1 }, position)
    await nextTick()
    expect(values).toEqual([0, 100])

    values.length = 0
    targets.value = makeTargets(4)
    loop.value = 1
    await nextTick()
    await nextTick()
    expect(values).toEqual([0, 100, 200, 300])
  })

  it("recomputes the spread when v-text-split splits new text with the same options", async () => {
    // happy-dom has no FontFaceSet, which Anime.js's TextSplitter reads; put the original back after
    const original_fonts = Object.getOwnPropertyDescriptor(document, "fonts")
    Object.defineProperty(document, "fonts", {
      value: { status: "loaded", ready: Promise.resolve() },
      configurable: true,
    })
    onTestFinished(() => {
      if (original_fonts) Object.defineProperty(document, "fonts", original_fonts)
      else Reflect.deleteProperty(document, "fonts")
    })
    const values: number[] = []
    const split = {
      words: true,
      animation: { opacity: [0, 1], delay: stagger(10, { modifier: (v: number) => (values.push(v), v) }) },
    }
    const text = ref("ab cd")
    await mountDirective(
      defineComponent({
        directives: { textSplit: vTextSplit },
        template: '<p :key="text" v-text-split="split">{{ text }}</p>',
        setup: () => ({ split, text }),
      })
    )
    await nextTick()
    expect(values).toEqual([0, 10])

    values.length = 0
    text.value = "ab cd ef gh"
    await nextTick()
    await nextTick()
    expect(values).toEqual([0, 10, 20, 30])
  })
})