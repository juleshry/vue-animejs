import { describe, it, expect, vi, beforeEach, afterEach } from "vite-plus/test"
import { defineComponent, Fragment, h, nextTick, ref, type Ref, vShow, withDirectives } from "vue"
import { mount } from "@vue/test-utils"
import { AnimeTransitionGroup, type AnimeTransitionGroupProps } from "@lib"
import { animate, type AnimationParams, type FunctionValue } from "animejs"

const mock_animate = vi.mocked(animate)

vi.mock("animejs", () => ({
  animate: vi.fn(() => ({ cancel: vi.fn(), revert: vi.fn() })),
}))

const enter: AnimationParams = { opacity: [0, 1], duration: 300 }
const leave: AnimationParams = { opacity: 0, duration: 300 }

/** Mounts `<AnimeTransitionGroup tag="ul" v-bind="props"><li v-for="item in items" :key="item" /></AnimeTransitionGroup>`. */
function mountList(props: AnimeTransitionGroupProps & Record<string, unknown>, items: Ref<string[]>) {
  return mount(
    defineComponent(
      () => () =>
        h(AnimeTransitionGroup, { tag: "ul", ...props }, () =>
          items.value.map(item => h("li", { key: item, "data-item": item }, item))
        )
    ),
    // @vue/test-utils stubs <TransitionGroup> by default, which would skip every hook
    { global: { stubs: { "transition-group": false } }, attachTo: document.body }
  )
}

/** The `delay` and target item of every `animate()` call so far, in order. */
function calls(): { item: string | undefined; delay: unknown }[] {
  return mock_animate.mock.calls.map(([el, params]) => ({
    item: (el as HTMLElement).dataset.item,
    delay: (params as AnimationParams).delay,
  }))
}

/** Calls the `onComplete` of the `n`-th `animate()` call (0-based), as Anime.js would when it finishes. */
function complete(n: number) {
  const params = mock_animate.mock.calls[n][1] as AnimationParams
  params.onComplete?.(mock_animate.mock.results[n].value)
}

describe("AnimeTransitionGroup", () => {
  beforeEach(() => {
    mock_animate.mockClear()
    document.body.innerHTML = ""
  })

  it("renders its children inside `tag`", () => {
    const wrapper = mountList({}, ref(["a", "b"]))
    expect(wrapper.html()).toBe('<ul>\n  <li data-item="a">a</li>\n  <li data-item="b">b</li>\n</ul>')
  })

  it("animates each entering child with `enter`, staggered by their order", async () => {
    const items = ref(["a"])
    mountList({ enter, stagger: 50 }, items)
    items.value = ["a", "b", "c", "d"]
    await nextTick()
    expect(calls()).toEqual([
      { item: "b", delay: undefined },
      { item: "c", delay: 50 },
      { item: "d", delay: 100 },
    ])
  })

  it("starts the stagger over for the next batch", async () => {
    const items = ref(["a"])
    mountList({ enter, stagger: 50 }, items)
    items.value = ["a", "b", "c"]
    await nextTick()
    await nextTick()
    items.value = ["a", "b", "c", "d"]
    await nextTick()
    const all = calls()
    expect(all[all.length - 1]).toEqual({ item: "d", delay: undefined })
  })

  it("adds the stagger to a numeric delay, and to a function delay's result", async () => {
    const items = ref<string[]>([])
    const fn: FunctionValue = () => 10
    mountList({ enter: { ...enter, delay: 200 }, stagger: 50 }, items)
    items.value = ["a", "b"]
    await nextTick()
    expect(calls().map(call => call.delay)).toEqual([200, 250])

    mock_animate.mockClear()
    const items2 = ref<string[]>([])
    mountList({ enter: { ...enter, delay: fn }, stagger: 50 }, items2)
    items2.value = ["a", "b"]
    await nextTick()
    const delays = calls().map(call => call.delay)
    expect(delays[0]).toBe(fn)
    expect((delays[1] as FunctionValue)()).toBe(60)
  })

  it("keeps leaving children until their `leave` animation completes, staggered separately", async () => {
    const items = ref(["a", "b", "c"])
    mountList({ enter, leave, stagger: 50 }, items)
    items.value = ["a", "d"]
    await nextTick()
    // One enter (d) and two leaves (b, c) in the same flush: each kind has its own order
    expect(calls()).toEqual([
      { item: "b", delay: undefined },
      { item: "c", delay: 50 },
      { item: "d", delay: undefined },
    ])
    expect(document.querySelectorAll("li")).toHaveLength(4)
    complete(0)
    complete(1)
    await nextTick()
    expect([...document.querySelectorAll("li")].map(li => li.textContent)).toEqual(["a", "d"])
  })

  it("does not animate the initial render without `appear`", async () => {
    mountList({ enter }, ref(["a", "b"]))
    await nextTick()
    await nextTick()
    expect(mock_animate).not.toHaveBeenCalled()
  })

  // On a client mount, <TransitionGroup>'s own appear hook runs; the hydration case is in tests/ssr/hydration.test.ts
  it("animates the initial client render with `appear`, staggered", async () => {
    mountList({ enter, appear: true, stagger: 30 }, ref(["a", "b"]))
    await nextTick()
    expect(calls()).toEqual([
      { item: "a", delay: undefined },
      { item: "b", delay: 30 },
    ])
  })

  it("treats a bare `appear` attribute as true", async () => {
    // What `<AnimeTransitionGroup appear>` compiles to
    mountList({ enter, appear: "" as unknown as boolean }, ref(["a"]))
    await nextTick()
    expect(mock_animate).toHaveBeenCalledOnce()
  })

  it("cancels running animations on unmount", async () => {
    const items = ref<string[]>([])
    const wrapper = mountList({ enter }, items)
    items.value = ["a", "b"]
    await nextTick()
    const running = mock_animate.mock.results.map(result => result.value as { cancel: ReturnType<typeof vi.fn> })
    wrapper.unmount()
    for (const animation of running) expect(animation.cancel).toHaveBeenCalled()
  })

  // Regression: Fragments were flattened without their key, so `<template v-for :key>` children lost theirs
  it("keys the children of a keyed fragment from it, as <TransitionGroup> does", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const items = ref(["a", "b", "c"])
    mount(
      defineComponent(
        () => () =>
          // What `<template v-for="item in items" :key="item"><li>…</li></template>` compiles to
          h(AnimeTransitionGroup, { tag: "ul", leave }, () => [
            h(
              Fragment,
              null,
              items.value.map(item => h(Fragment, { key: item }, [h("li", { "data-item": item }, item)]))
            ),
          ])
      ),
      { global: { stubs: { "transition-group": false } }, attachTo: document.body }
    )
    items.value = ["a", "c"]
    await nextTick()
    expect(calls()).toEqual([{ item: "b", delay: undefined }])
    expect(warn.mock.calls.flat().join(" ")).not.toMatch(/keyed/)
    warn.mockRestore()
  })

  // Regression: withDirectives added to the `dirs` of the slot's own vnode, which a cached (static, v-once) child
  // hands back on every render
  it("leaves the slot's vnodes untouched", async () => {
    const cached = h("li", { key: "static" }, "static")
    const count = ref(0)
    mount(
      defineComponent(() => () => h(AnimeTransitionGroup, { tag: "ul", "data-count": count.value }, () => [cached])),
      { global: { stubs: { "transition-group": false } }, attachTo: document.body }
    )
    count.value++
    await nextTick()
    count.value++
    await nextTick()
    expect(cached.dirs).toBeFalsy()
  })

  describe("moves", () => {
    // How far a positioned ancestor that isn't the offsetParent (e.g. a transformed one) puts frozen children off
    let containing_block_offset = 0

    // happy-dom has no layout: put each child at x = 100 * its index among the children still in the layout (or where
    // it was frozen), for both getBoundingClientRect and offsetLeft
    function layoutLeft(el: HTMLElement): number {
      if (el.style.position === "absolute") return parseFloat(el.style.left)
      const in_flow = [...(el.parentElement?.children ?? [])].filter(
        child => (child as HTMLElement).style.position !== "absolute"
      )
      return in_flow.indexOf(el) * 100
    }

    beforeEach(() => {
      containing_block_offset = 0
      vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
        const left = layoutLeft(this) + (this.style.position === "absolute" ? containing_block_offset : 0)
        return { left, top: 0, right: left + 80, bottom: 80, width: 80, height: 80, x: left, y: 0 } as DOMRect
      })
      vi.spyOn(HTMLElement.prototype, "offsetLeft", "get").mockImplementation(function (this: HTMLElement) {
        return layoutLeft(this)
      })
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    const item = (name: string) => document.querySelector<HTMLElement>(`[data-item=${name}]`)!

    interface MoveCall {
      offset: { x: number; y: number }
      params: AnimationParams
      animation: { cancel: ReturnType<typeof vi.fn> }
      el: HTMLElement
    }

    /** The `animate()` calls that move an element (they animate an offset object, not the element), in order. */
    function moveCalls(): MoveCall[] {
      return mock_animate.mock.calls.flatMap(([target, params], i) => {
        if (target instanceof Element) return []
        const offset = target as { x: number; y: number }
        const p = params as AnimationParams
        // Find the element it writes to: run its update with a marker offset
        const { x, y } = offset
        offset.x = 9000 + i
        p.onUpdate?.(mock_animate.mock.results[i].value)
        const el = [...document.querySelectorAll<HTMLElement>("li")].find(li =>
          li.style.translate.startsWith(`${9000 + i}px`)
        )!
        offset.x = x
        offset.y = y
        p.onUpdate?.(mock_animate.mock.results[i].value)
        return [{ offset, params: p, animation: mock_animate.mock.results[i].value, el }]
      })
    }

    /** The moves started so far, by item: `[x, y, duration]` they animate from (to 0). */
    function moves(): Record<string, unknown[]> {
      const out: Record<string, unknown[]> = {}
      for (const { offset, params, el } of moveCalls()) out[el.dataset.item!] = [offset.x, offset.y, params.duration]
      return out
    }

    it("takes a leaving child out of the layout where it is", async () => {
      const items = ref(["a", "b", "c"])
      mountList({ leave }, items)
      items.value = ["a", "c"]
      await nextTick()
      const b = item("b")
      expect(b.style.position).toBe("absolute")
      expect(b.style.margin).toBe("0px")
      for (const key of ["left", "top", "width", "height"] as const) expect(b.style[key]).toMatch(/px$/)
    })

    // Regression: each leaving child was measured after the previous one had already been taken out of the layout,
    // so the second one was frozen in the first one's place
    it("freezes several leaving children each where it was before the update", async () => {
      const items = ref(["a", "b", "c", "d"])
      mountList({ leave }, items)
      items.value = ["a", "d"]
      await nextTick()
      expect([item("b").style.left, item("c").style.left]).toEqual(["100px", "200px"])
      expect(moves()).toEqual({ d: [200, 0, 400] })
    })

    // Regression: the offsets are relative to the offsetParent, which isn't the containing block under a transformed
    // ancestor, so the leaving child jumped by the difference
    it("corrects the frozen position when the containing block isn't the offsetParent", async () => {
      containing_block_offset = 30
      const items = ref(["a", "b", "c"])
      mountList({ leave }, items)
      items.value = ["a", "c"]
      await nextTick()
      expect(item("b").style.left).toBe("70px")
      expect(item("b").getBoundingClientRect().left).toBe(100)
    })

    it("moves the children after a removed one from their old place instead of jumping", async () => {
      const items = ref(["a", "b", "c", "d"])
      mountList({ leave }, items)
      items.value = ["a", "c", "d"]
      await nextTick()
      // c and d slid one slot left (100px): each starts 100px right of its new place and ends there
      expect(moves()).toEqual({ c: [100, 0, 400], d: [100, 0, 400] })
    })

    it("moves the children after an added one too", async () => {
      const items = ref(["a", "c"])
      mountList({ enter }, items)
      items.value = ["a", "b", "c"]
      await nextTick()
      expect(moves()).toEqual({ c: [-100, 0, 400] })
    })

    it("uses `move` for the timing", async () => {
      const items = ref(["a", "b", "c"])
      mountList({ leave, move: { duration: 150, ease: "linear" } }, items)
      items.value = ["a", "c"]
      await nextTick()
      expect(moveCalls()[0].params).toMatchObject({ duration: 150, ease: "linear", x: 0, y: 0 })
    })

    it("lets children jump with `move: false`, and leaves the leaving child in the layout", async () => {
      const items = ref(["a", "b", "c"])
      mountList({ leave, move: false }, items)
      items.value = ["a", "c"]
      await nextTick()
      expect(moves()).toEqual({})
      expect(item("b").style.position).toBe("")
    })

    // Regression: moves animated translateX / translateY, replacing the translate of an enter still running
    it("moves through the CSS `translate`, leaving `transform` to the enter and leave animations", async () => {
      const items = ref(["a", "b", "c"])
      mountList({ leave }, items)
      items.value = ["a", "c"]
      await nextTick()
      const [move] = moveCalls()
      expect(move.el).toBe(item("c"))
      expect(item("c").style.translate).toBe("100px 0px")
      expect(mock_animate.mock.calls.some(([, params]) => "translateX" in (params as AnimationParams))).toBe(false)
      // Done: the element's own translate is back
      move.params.onComplete?.(move.animation as never)
      expect(item("c").style.translate).toBe("")
    })

    // Regression: a running move was reverted first, so a child still sliding jumped to its layout place
    it("starts the next move from where the running one has got to", async () => {
      const items = ref(["a", "b", "c", "d"])
      mountList({ leave }, items)
      items.value = ["a", "c", "d"]
      await nextTick()
      const first = moveCalls().find(move => move.el === item("c"))!
      first.offset.x = 40 // 60% of the way
      items.value = ["c", "d"]
      await nextTick()
      expect(first.animation.cancel).toHaveBeenCalled()
      const next = moveCalls().filter(move => move.el === item("c"))
      expect(next[next.length - 1].offset).toEqual({ x: 140, y: 0 })
    })

    // Regression: running moves were reverted on every update, so a leaving child still sliding jumped
    it("keeps the move of a child that starts leaving mid-way", async () => {
      const items = ref(["a", "b", "c", "d"])
      mountList({ leave }, items)
      items.value = ["a", "c", "d"]
      await nextTick()
      const first = moveCalls().find(move => move.el === item("c"))!
      items.value = ["a", "d"]
      await nextTick()
      expect(first.animation.cancel).not.toHaveBeenCalled()
      expect(item("c").style.position).toBe("absolute")
    })

    // Regression: the frozen style was only removed when a leave was cancelled, never once it was done, so a v-show
    // child came back still absolutely positioned
    it("puts a v-show child back into the layout once it has left", async () => {
      const visible = ref<Record<string, boolean>>({ a: true, b: true, c: true })
      mount(
        defineComponent(
          () => () =>
            h(AnimeTransitionGroup, { tag: "ul", leave }, () =>
              ["a", "b", "c"].map(name =>
                withDirectives(h("li", { key: name, "data-item": name }, name), [[vShow, visible.value[name]]])
              )
            )
        ),
        { global: { stubs: { "transition-group": false } }, attachTo: document.body }
      )
      visible.value = { ...visible.value, b: false }
      await nextTick()
      expect(item("b").style.position).toBe("absolute")
      complete(mock_animate.mock.calls.findIndex(([el]) => el === item("b")))
      expect(item("b").style.position).toBe("")
      expect(item("b").style.display).toBe("none")

      // Shown again, it is tracked like the others
      visible.value = { ...visible.value, b: true }
      await nextTick()
      visible.value = { ...visible.value, a: false }
      await nextTick()
      expect(Object.keys(moves())).toContain("b")
    })
  })
})