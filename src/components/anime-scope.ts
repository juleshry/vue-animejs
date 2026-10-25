import { unrefElement } from "@vueuse/core"
import { type ScopeParams } from "animejs"
import {
  type Component,
  type ComponentPublicInstance,
  defineComponent,
  h,
  type ShallowUnwrapRef,
  type SlotsType,
  useTemplateRef,
  type VNode,
} from "vue"
import { useScope, type UseScopeReturn } from "../composables/use-scope.ts"
import { useStableOptions } from "../utils/stable-options.ts"

export interface AnimeScopeProps {
  /**
   * The root element: a tag name, or a component that renders a single root element with the default slot directly
   * inside it. Defaults to `"div"`.
   */
  as?: string | Component
  /** Anime.js scope parameters, without `root`: the root element is the scope's root. An inline object literal only re-creates the scope when its content changes. */
  options?: Omit<ScopeParams, "root">
}

/** What a template ref on `AnimeScope` exposes: the `useScope` controls, with `scope` unwrapped like any exposed ref. */
export type AnimeScopeExposed = ShallowUnwrapRef<UseScopeReturn>

const component = defineComponent(
  (props: AnimeScopeProps, { slots, expose }) => {
    // An element, or the component instance when `as` is a component
    const root = useTemplateRef<HTMLElement | ComponentPublicInstance>("root")

    const options = useStableOptions(() => props.options)

    // The getter re-runs when the root changes (e.g. `as` swapped), so the scope is rebuilt on the new element
    const scope = useScope(() => ({ ...options.value, root: unrefElement(root) ?? undefined }))
    expose(scope)

    // A slots object works for both: a component gets it as its slots, an element renders `default()` as its children
    return () => h(props.as ?? "div", { ref: "root" }, { default: () => slots.default?.() })
  },
  {
    name: "AnimeScope",
    props: ["as", "options"],
    slots: Object as SlotsType<{ default?: () => VNode[] }>,
  }
)

/**
 * Wraps `useScope` into a component: renders a root element and creates an Anime.js scope rooted on it, so selectors in
 * the scope's methods only match inside it, and its defaults and media queries apply to them.
 *
 * The `useScope` controls (`add`, `addOnce`, `registerMethod`, `keepTime`, `refresh`, `revert`, `scope`) are exposed on
 * the component instance, to be called through a template ref. `scope` is unwrapped like any exposed ref.
 */
// defineComponent doesn't type what `expose()` adds, so a template ref wouldn't see the controls without this
export const AnimeScope = component as {
  new (...args: ConstructorParameters<typeof component>): InstanceType<typeof component> & AnimeScopeExposed
} & typeof component