import { type AutoLayoutParams } from "animejs"
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
import { useLayout, type UseLayoutReturn } from "../composables/use-layout.ts"
import { useStableOptions } from "../utils/stable-options.ts"

export interface AnimeLayoutProps {
  /**
   * The root element: a tag name, or a component that renders a single root element with the default slot directly
   * inside it (its children are the tracked ones). Defaults to `"div"`.
   */
  as?: string | Component
  /** Anime.js auto-layout parameters. An inline object literal only re-creates the layout when its content changes. */
  options?: AutoLayoutParams
}

/** What a template ref on `AnimeLayout` exposes: the `useLayout` controls, with `layout` unwrapped like any exposed ref. */
export type AnimeLayoutExposed = ShallowUnwrapRef<UseLayoutReturn>

const component = defineComponent(
  (props: AnimeLayoutProps, { slots, expose }) => {
    // An element, or the component instance when `as` is a component (useLayout resolves it to its `$el`)
    const root = useTemplateRef<HTMLElement | ComponentPublicInstance>("root")

    const options = useStableOptions(() => props.options)

    const layout = useLayout(root, options)
    expose(layout)

    // A slots object works for both: a component gets it as its slots, an element renders `default()` as its children
    return () => h(props.as ?? "div", { ref: "root" }, { default: () => slots.default?.() })
  },
  {
    name: "AnimeLayout",
    props: ["as", "options"],
    slots: Object as SlotsType<{ default?: () => VNode[] }>,
  }
)

/**
 * Wraps `useLayout` into a component: renders a root element, tracks its children, and animates their layout changes.
 *
 * The `useLayout` controls (`record`, `animate`, `update`, `revert`, `layout`) are exposed on the component instance, so
 * they can be called through a template ref from outside the tracked children. `layout` is unwrapped like any exposed ref.
 */
// defineComponent doesn't type what `expose()` adds, so a template ref wouldn't see the controls without this
export const AnimeLayout = component as {
  new (...args: ConstructorParameters<typeof component>): InstanceType<typeof component> & AnimeLayoutExposed
} & typeof component