import { type TextSplitterParams } from "animejs"
import {
  type Component,
  type ComponentPublicInstance,
  defineComponent,
  h,
  type ShallowUnwrapRef,
  type SlotsType,
  useTemplateRef,
  type VNode,
  type VNodeChild,
} from "vue"
import { useText, type UseTextReturn } from "../composables/use-text.ts"
import { useStableOptions } from "../utils/stable-options.ts"

export interface AnimeTextProps {
  /**
   * The root element, whose text is split: a tag name, or a component that renders a single root element with the
   * default slot directly inside it. Defaults to `"div"`.
   */
  as?: string | Component
  /** Anime.js text-splitter parameters. An inline object literal only re-splits the text when its content changes. */
  options?: TextSplitterParams
}

/** What a template ref on `AnimeText` exposes: the `useText` controls, with `splitter`, `lines`, `words` and `chars` unwrapped like any exposed ref. */
export type AnimeTextExposed = ShallowUnwrapRef<UseTextReturn>

const component = defineComponent(
  (props: AnimeTextProps, { slots, expose }) => {
    // An element, or the component instance when `as` is a component (useText resolves it to its `$el`)
    const root = useTemplateRef<HTMLElement | ComponentPublicInstance>("root")

    const options = useStableOptions(() => props.options)

    const text = useText(root, options)
    expose(text)

    // splitText() replaces the root's content, so Vue's vnodes no longer point at what's in the document: patching a
    // change into them would update detached nodes. When the slot renders different content, a new key replaces the
    // root instead, and useText re-splits the new one. Unchanged content patches nothing, so the root is kept.
    let content_key = 0
    let last_content: string | undefined
    return () => {
      const children = slots.default?.()
      const content = contentSignature(children)
      if (last_content !== undefined && content !== last_content) content_key++
      last_content = content
      // A slots object works for both: a component gets it as its slots, an element renders `default()` as its children
      return h(props.as ?? "div", { ref: "root", key: content_key }, { default: () => children })
    }
  },
  {
    name: "AnimeText",
    props: ["as", "options"],
    slots: Object as SlotsType<{ default?: () => VNode[] }>,
  }
)

/**
 * Wraps `useText` into a component: renders a root element and splits the text of its default slot into lines, words
 * and/or characters. When the slot content changes, the root is rendered anew and its text split again.
 *
 * The `useText` controls (`splitter`, `lines`, `words`, `chars`, `revert`, `refresh`) are exposed on the component
 * instance, to animate the split elements through a template ref. Refs are unwrapped like any exposed ref.
 */
// defineComponent doesn't type what `expose()` adds, so a template ref wouldn't see the controls without this
export const AnimeText = component as {
  new (...args: ConstructorParameters<typeof component>): InstanceType<typeof component> & AnimeTextExposed
} & typeof component

// What the slot renders, as a string: tags, props (functions by source) and text, so two renders compare by content
function contentSignature(child: VNodeChild): string {
  if (child == null || typeof child === "boolean") return ""
  if (typeof child !== "object") return String(child)
  if (Array.isArray(child)) return child.map(contentSignature).join("")

  const type =
    typeof child.type === "string"
      ? child.type
      : typeof child.type === "symbol"
        ? String(child.type)
        : ((child.type as { name?: string }).name ?? "component")
  const props = JSON.stringify(child.props, (key, value: unknown) =>
    key === "ref" ? undefined : typeof value === "function" ? String(value) : value
  )
  const children =
    typeof child.children === "string" || Array.isArray(child.children) ? contentSignature(child.children) : ""
  return `<${type} ${props}>${children}</>`
}