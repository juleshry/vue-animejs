import { describe, it, expect } from "vite-plus/test"
import { reactive, ref } from "vue"
import { isPlainObject } from "@src/utils/is-plain-object.ts"

describe("isPlainObject", () => {
  it("accepts object literals and null-prototype objects", () => {
    expect(isPlainObject({})).toBe(true)
    expect(isPlainObject({ translateX: 250 })).toBe(true)
    expect(isPlainObject(Object.create(null))).toBe(true)
  })

  it("accepts a reactive() object, whose proxy keeps the Object prototype", () => {
    expect(isPlainObject(reactive({ loop: true }))).toBe(true)
  })

  it("rejects primitives, null and undefined", () => {
    expect(isPlainObject(null)).toBe(false)
    expect(isPlainObject(undefined)).toBe(false)
    expect(isPlainObject(0)).toBe(false)
    expect(isPlainObject("a")).toBe(false)
    expect(isPlainObject(true)).toBe(false)
    expect(isPlainObject(Symbol("a"))).toBe(false)
  })

  it("rejects functions and arrays", () => {
    expect(isPlainObject(() => ({}))).toBe(false)
    expect(isPlainObject([1, 2])).toBe(false)
  })

  it("rejects class instances, elements, refs and built-ins", () => {
    class Observer {}
    expect(isPlainObject(new Observer())).toBe(false)
    expect(isPlainObject(document.createElement("div"))).toBe(false)
    expect(isPlainObject(ref({}))).toBe(false)
    expect(isPlainObject(new Date())).toBe(false)
    expect(isPlainObject(new Map())).toBe(false)
  })

  it("rejects an object inheriting from another plain object", () => {
    expect(isPlainObject(Object.create({ inherited: true }))).toBe(false)
  })
})