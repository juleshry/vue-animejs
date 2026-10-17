import { expect } from "vite-plus/test"
import { type Component, createSSRApp, defineComponent, h, isProxy, isReactive, nextTick, reactive } from "vue"
import { mount, type VueWrapper } from "@vue/test-utils"
import { renderToString } from "@vue/server-renderer"

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
 * Mounts a component and waits for its directives' first mount, which is deferred until the mount
 * flush has finished (see `deferMount`).
 */
export async function mountDirective(component: Component): Promise<VueWrapper> {
  const wrapper = mount(component)
  await nextTick()
  return wrapper
}

/**
 * Runs `setup` inside a component rendered through Vue's actual SSR path
 * (`renderToString`), the only way to reproduce "setup() runs, but onMounted/onUnmounted
 * never fire" outside a real server. Unlike `withSetup`, this never touches the DOM.
 */
export async function renderSSR<T>(setup: () => T): Promise<T> {
  let result!: T
  const app = createSSRApp(
    defineComponent({
      setup() {
        result = setup()
        return () => h("div")
      },
    })
  )
  await renderToString(app)
  return result
}

/**
 * Server-renders a full component (render function, directives included) and returns its HTML.
 * Use this over `renderSSR` when the output itself matters, e.g. a directive's `getSSRProps`.
 */
export function renderSSRApp(component: Component): Promise<string> {
  return renderToString(createSSRApp(component))
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