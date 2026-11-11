import { type ScrollObserverParams } from "animejs"
import {
  type Component,
  type ComponentPublicInstance,
  computed,
  defineComponent,
  h,
  type ShallowUnwrapRef,
  type SlotsType,
  useTemplateRef,
  type VNode,
} from "vue"
import { useScroll, type UseScrollReturn } from "../composables/use-scroll.ts"
import { useStableOptions } from "../utils/stable-options.ts"

export interface AnimeScrollProps {
  /**
   * The root element, whose scroll position is observed: a tag name, or a component that renders a single root element
   * with the default slot directly inside it. Defaults to `"div"`.
   */
  as?: string | Component
  /**
   * The scrollable container: a CSS selector or an element. Defaults to the document body. `null` (e.g. a template ref
   * not mounted yet) waits for the element instead of falling back to the body.
   */
  container?: string | HTMLElement | null
  /** Anime.js scroll observer parameters, without `container` / `target`. An inline object literal only re-creates the observer when its content changes. */
  options?: Omit<ScrollObserverParams, "container" | "target">
}

/** What a template ref on `AnimeScroll` exposes: the `useScroll` controls, with `observer` and `autoplay` unwrapped like any exposed ref. */
export type AnimeScrollExposed = ShallowUnwrapRef<Omit<UseScrollReturn, "autoplayComputed">>

const component = defineComponent(
  (props: AnimeScrollProps, { slots, expose }) => {
    // An element, or the component instance when `as` is a component (useScroll resolves it to its `$el`)
    const root = useTemplateRef<HTMLElement | ComponentPublicInstance>("root")

    // `undefined` is Anime.js's own default; `null` stays empty, so useScroll waits for it
    const container = computed(() => (props.container === undefined ? "body" : props.container))

    const options = useStableOptions(() => props.options)

    // autoplayComputed is deprecated: not part of the component's surface
    const { autoplayComputed: _autoplay_computed, ...scroll } = useScroll(container, root, options)
    expose(scroll)

    // A slots object works for both: a component gets it as its slots, an element renders `default()` as its children
    return () => h(props.as ?? "div", { ref: "root" }, { default: () => slots.default?.() })
  },
  {
    name: "AnimeScroll",
    props: ["as", "container", "options"],
    slots: Object as SlotsType<{ default?: () => VNode[] }>,
  }
)

/**
 * Wraps `useScroll` into a component: renders a root element and observes its scroll position within `container`.
 *
 * The `useScroll` controls (`observer`, `autoplay`, `link`, `refresh`, `revert`, `debug`, `removeDebug`) are exposed on
 * the component instance, so an animation can be driven by the observer through a template ref (e.g.
 * `autoplay: computed(() => scroll.value?.autoplay ?? false)`). Refs are unwrapped like any exposed ref.
 */
// defineComponent doesn't type what `expose()` adds, so a template ref wouldn't see the controls without this
export const AnimeScroll = component as {
  new (...args: ConstructorParameters<typeof component>): InstanceType<typeof component> & AnimeScrollExposed
} & typeof component