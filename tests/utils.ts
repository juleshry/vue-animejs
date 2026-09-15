import { expect } from "vitest"
import { defineComponent, h, isProxy, isReactive, reactive } from "vue"
import { mount, type VueWrapper } from "@vue/test-utils"

export function withSetup<T>(setup: () => T): [T, VueWrapper] {
  let result!: T
  const wrapper = mount(
    defineComponent({
      setup() {
        result = setup()
        return () => h("div")
      },
    })
  )
  return [result, wrapper]
}

/**
 * Regression guard for the `readonly(shallowRef(x))` stack-overflow bug: an Anime.js
 * instance must never come back deep-wrapped, and must resist being deep-wrapped later
 * (the `markRaw` guarantee), matching the `shallowReadonly` + `markRaw` contract.
 */
export function expectInstanceStaysRaw(value: unknown): void {
  expect(isProxy(value)).toBe(false)
  expect(isReactive(reactive({ value }).value)).toBe(false)
}