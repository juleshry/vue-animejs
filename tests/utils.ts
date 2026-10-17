import { expect, type Mock } from "vite-plus/test"
import {
  type Component,
  createSSRApp,
  defineComponent,
  h,
  isProxy,
  isReactive,
  nextTick,
  reactive,
  useTemplateRef,
} from "vue"
import { mount, type VueWrapper } from "@vue/test-utils"
import { renderToString } from "@vue/server-renderer"
import { type AnimationTargets } from "@src/utils/resolve-target.ts"

/** The forms a composable target can take when it points into the component's own template. */
export type TargetForm = "selector" | "template ref" | "array of template refs"

export interface TargetComponentOptions {
  /** The target element's tag. A `path` is wrapped in an `<svg>`, other tags get a text child. Defaults to `div`. */
  tag?: string
  /** Extra props for the target element(s), e.g. a user `style`. */
  props?: Record<string, unknown>
}

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
 * A component that calls `use` in its `setup()` with a target of the given `form`, pointing at
 * elements of its own template: `#t`, plus `#u` for the array form.
 */
export function targetComponent(
  form: TargetForm,
  use: (target: AnimationTargets) => unknown,
  { tag = "div", props = {} }: TargetComponentOptions = {}
): Component {
  return defineComponent({
    setup() {
      const t = useTemplateRef<HTMLElement>("t")
      const u = useTemplateRef<HTMLElement>("u")
      use(form === "selector" ? "#t" : form === "template ref" ? t : [t, u])

      const path_props = tag === "path" ? { d: "M0 0L10 10" } : {}
      const text = tag === "path" ? undefined : "Hello world"
      return () => {
        const els = [h(tag, { ...path_props, ...props, id: "t", ref: "t" }, text)]
        if (form === "array of template refs") els.push(h(tag, { ...path_props, ...props, id: "u", ref: "u" }, text))
        return tag === "path" ? h("svg", els) : h("div", els)
      }
    },
  })
}

/**
 * Mounts `targetComponent(form, use)` attached to the document, so a selector target resolves the
 * way it does in a browser.
 */
export function mountWithTarget(
  form: TargetForm,
  use: (target: AnimationTargets) => unknown,
  tag?: string
): VueWrapper {
  return mount(targetComponent(form, use, { tag }), { attachTo: document.body })
}

/**
 * Makes the next call to `fn` record whether `#t` (see `targetComponent`) is in the document at
 * that moment. Read `found` after the call.
 */
export function recordTargetFound<T extends (...args: never[]) => unknown>(fn: Mock<T>): { found?: boolean } {
  const record: { found?: boolean } = {}
  const impl = fn.getMockImplementation()
  fn.mockImplementationOnce(((...args: Parameters<T>) => {
    record.found = document.querySelector("#t") != null
    return impl?.(...args)
  }) as Parameters<typeof fn.mockImplementationOnce>[0])
  return record
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