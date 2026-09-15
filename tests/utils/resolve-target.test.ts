import { describe, it, expect } from "vitest"
import { defineComponent, h, ref, type ComponentPublicInstance } from "vue"
import { mount } from "@vue/test-utils"
import { resolveTarget } from "@src/utils/resolve-target.ts"

describe("resolveTarget", () => {
  it("passes through a raw element unchanged", () => {
    const el = document.createElement("div")
    expect(resolveTarget(el)).toBe(el)
  })

  it("passes through a CSS selector string unchanged", () => {
    expect(resolveTarget(".box")).toBe(".box")
  })

  it("unwraps a ref to an element", () => {
    const el = document.createElement("div")
    expect(resolveTarget(ref(el))).toBe(el)
  })

  it("returns null for a ref holding null", () => {
    const el_ref = ref<HTMLElement | null>(null)
    expect(resolveTarget(el_ref)).toBeNull()
  })

  it("unwraps a Vue component ref to its $el", async () => {
    const ChildComp = defineComponent({ render: () => h("div") })
    let resolved: unknown
    mount(
      defineComponent({
        setup() {
          const child_ref = ref<ComponentPublicInstance | null>(null)
          resolved = () => resolveTarget(child_ref)
          return () => h(ChildComp, { ref: child_ref })
        },
      })
    )
    // oxlint-disable-next-line typescript/no-explicit-any
    expect((resolved as any)()).toBeInstanceOf(HTMLElement)
  })

  it("resolves a plain array of raw elements to an array of elements", () => {
    const el1 = document.createElement("div")
    const el2 = document.createElement("div")
    expect(resolveTarget([el1, el2])).toEqual([el1, el2])
  })

  it("resolves a plain array of individual refs to an array of elements", () => {
    const el1 = document.createElement("div")
    const el2 = document.createElement("div")
    expect(resolveTarget([ref(el1), ref(el2)])).toEqual([el1, el2])
  })

  it("filters out null/undefined entries from a mixed array", () => {
    const el1 = document.createElement("div")
    const unmounted_ref = ref<HTMLElement | null>(null)
    expect(resolveTarget([el1, unmounted_ref])).toEqual([el1])
  })

  it("returns undefined when every array entry resolves to null/undefined", () => {
    const ref1 = ref<HTMLElement | null>(null)
    const ref2 = ref<HTMLElement | null>(null)
    expect(resolveTarget([ref1, ref2])).toBeUndefined()
  })

  it("returns undefined for an empty array", () => {
    expect(resolveTarget([])).toBeUndefined()
  })

  it("leaves a ref wrapping an array untouched (not treated as a plain array target)", () => {
    const el1 = document.createElement("div")
    const el2 = document.createElement("div")
    const els_ref = ref([el1, el2])
    expect(resolveTarget(els_ref)).toEqual([el1, el2])
  })
})