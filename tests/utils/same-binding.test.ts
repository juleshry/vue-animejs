import { describe, it, expect } from "vite-plus/test"
import { reactive, ref } from "vue"
import { stagger as animeStagger } from "animejs"
import { isSameBinding } from "@src/utils/same-binding.ts"
import { stagger } from "@src/helpers/stagger.ts"
import { setBindingKey } from "@src/utils/binding-key.ts"

describe("isSameBinding", () => {
  it("treats equal primitives as the same, NaN included", () => {
    expect(isSameBinding(1, 1)).toBe(true)
    expect(isSameBinding("a", "a")).toBe(true)
    expect(isSameBinding(undefined, undefined)).toBe(true)
    expect(isSameBinding(Number.NaN, Number.NaN)).toBe(true)
    expect(isSameBinding(1, 2)).toBe(false)
    expect(isSameBinding(undefined, null)).toBe(false)
  })

  it("compares plain objects and arrays by content", () => {
    expect(isSameBinding({ x: [0, 250], ease: "out" }, { x: [0, 250], ease: "out" })).toBe(true)
    expect(isSameBinding({ x: [0, 250] }, { x: [0, 200] })).toBe(false)
    expect(isSameBinding({ x: 1 }, { x: 1, y: 2 })).toBe(false)
    expect(isSameBinding({ x: undefined }, { y: undefined })).toBe(false)
    expect(isSameBinding([1, 2], [1, 2, 3])).toBe(false)
    expect(isSameBinding({ a: 1 }, [1])).toBe(false)
  })

  it("compares a reactive object by content too", () => {
    expect(isSameBinding(reactive({ x: [0, 1] }), { x: [0, 1] })).toBe(true)
  })

  it("treats functions with the same source as the same (inline closures are new on every render)", () => {
    const make = () => (_el: unknown, i: number) => i * 60
    expect(isSameBinding({ delay: make() }, { delay: make() })).toBe(true)
    expect(isSameBinding({ delay: (i: number) => i * 60 }, { delay: (i: number) => i * 30 })).toBe(false)
  })

  it("compares our stagger() by its arguments", () => {
    expect(isSameBinding({ delay: stagger(60) }, { delay: stagger(60) })).toBe(true)
    expect(
      isSameBinding(stagger(60, { from: "center", ease: "out" }), stagger(60, { from: "center", ease: "out" }))
    ).toBe(true)
    expect(isSameBinding({ delay: stagger(60) }, { delay: stagger(80) })).toBe(false)
    expect(isSameBinding(stagger(60), stagger(60, { from: "last" }))).toBe(false)
    expect(isSameBinding(stagger([0, 100]), stagger([0, 200]))).toBe(false)
    expect(isSameBinding(stagger(60), (_el: unknown, i: number) => i * 60)).toBe(false)
  })

  it("treats a stagger() without params and with empty params as the same", () => {
    expect(isSameBinding(stagger(60), stagger(60, {}))).toBe(true)
  })

  it("compares any function with a binding key by that key, an undefined key included", () => {
    const make = (key: unknown) => {
      const fn = () => 0
      setBindingKey(fn, key)
      return fn
    }
    expect(isSameBinding(make([1, { a: 2 }]), make([1, { a: 2 }]))).toBe(true)
    expect(isSameBinding(make(1), make(2))).toBe(false)
    expect(isSameBinding(make(undefined), make(undefined))).toBe(true)
    expect(isSameBinding(make(undefined), () => 0)).toBe(false)
  })

  it("compares our stagger()'s ref arguments by reference", () => {
    const step = ref(60)
    expect(isSameBinding(stagger(step), stagger(step))).toBe(true)
    expect(isSameBinding(stagger(step), stagger(ref(60)))).toBe(false)
  })

  it("still compares Anime.js's own stagger() by source", () => {
    expect(isSameBinding(animeStagger(60), animeStagger(80))).toBe(true)
  })

  it("compares elements and other non-plain objects by reference", () => {
    const a = document.createElement("div")
    const b = document.createElement("div")
    expect(isSameBinding({ container: a }, { container: a })).toBe(true)
    expect(isSameBinding({ container: a }, { container: b })).toBe(false)
    expect(isSameBinding(new Date(0), new Date(0))).toBe(false)
  })
})