import { describe, it, expect } from "vite-plus/test"
import { reactive } from "vue"
import { isSameBinding } from "@src/utils/same-binding.ts"

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

  it("compares elements and other non-plain objects by reference", () => {
    const a = document.createElement("div")
    const b = document.createElement("div")
    expect(isSameBinding({ container: a }, { container: a })).toBe(true)
    expect(isSameBinding({ container: a }, { container: b })).toBe(false)
    expect(isSameBinding(new Date(0), new Date(0))).toBe(false)
  })
})