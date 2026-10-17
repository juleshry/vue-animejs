import { normalizeStyle, type StyleValue } from "vue"
import { kebabCase } from "@src/utils/kebab-case.ts"

/** Lists (comma-separated, kebab-case) the style keys a directive injected on the server. */
export const SSR_STYLE_ATTR = "data-anime-ssr"

/** Lists (comma-separated) the attributes a directive injected on the server. */
export const SSR_ATTRS_ATTR = "data-anime-ssr-attrs"

/** What a directive renders on the server so the element starts in its animation's initial state. */
export interface SSRInitialState {
  /** Inline style declarations, kebab-case keys. */
  style?: Record<string, string>
  /** Attributes, e.g. the `stroke-dasharray` of an SVG drawable. */
  attrs?: Record<string, string>
}

/**
 * The props an animating directive's `getSSRProps` returns: the initial state, plus marker
 * attributes listing what was injected so `stripSSRProps` can remove exactly that on the client.
 * Empty when there is nothing to inject.
 *
 * @param state - The initial style and attributes to render.
 */
export function toSSRProps({ style = {}, attrs = {} }: SSRInitialState): Record<string, unknown> {
  const props: Record<string, unknown> = {}
  const style_keys = Object.keys(style)
  const attr_keys = Object.keys(attrs)

  if (style_keys.length) {
    props.style = style
    props[SSR_STYLE_ATTR] = style_keys.join(",")
  }
  if (attr_keys.length) {
    Object.assign(props, attrs)
    props[SSR_ATTRS_ATTR] = attr_keys.join(",")
  }
  return props
}

/**
 * Removes the style declarations and attributes a directive injected on the server (listed in
 * `SSR_STYLE_ATTR` / `SSR_ATTRS_ATTR`) and the marker attributes themselves, leaving the element
 * exactly as a client-only render would. A key the user also sets (via `:style` or the same
 * attribute) is restored to the user's value rather than removed, since the server-side merge let
 * the directive's value win.
 *
 * Call it before Anime.js reads the element: `animate()` records the inline style at creation and
 * `revert()` restores it, and `createDrawable()` skips its first paint if `pathLength` is already set.
 *
 * @param el - The element being hydrated.
 * @param userProps - The element's own props (`vnode.props`).
 */
export function stripSSRProps(
  el: HTMLElement | SVGElement,
  userProps: Record<string, unknown> | null | undefined
): void {
  const style_keys = el.getAttribute(SSR_STYLE_ATTR)
  const attr_keys = el.getAttribute(SSR_ATTRS_ATTR)
  restoreUserProps(el, userProps, style_keys?.split(",") ?? [], attr_keys?.split(",") ?? [])
  el.removeAttribute(SSR_STYLE_ATTR)
  el.removeAttribute(SSR_ATTRS_ATTR)
}

/**
 * Puts the given style declarations and attributes back to what the user's own props set, removing
 * the ones the user doesn't set, so the element is as Vue rendered it before anything wrote to it.
 *
 * @param el - The element to restore.
 * @param userProps - The element's own props (`vnode.props`).
 * @param styleKeys - Kebab-case style properties to restore.
 * @param attrKeys - Attributes to restore.
 */
export function restoreUserProps(
  el: HTMLElement | SVGElement,
  userProps: Record<string, unknown> | null | undefined,
  styleKeys: string[],
  attrKeys: string[]
): void {
  if (styleKeys.length) {
    const user_style = toDeclaration(userProps?.style as StyleValue | undefined)
    for (const key of styleKeys) {
      const user_value = user_style.getPropertyValue(key)
      if (user_value) el.style.setProperty(key, user_value, user_style.getPropertyPriority(key))
      else el.style.removeProperty(key)
    }
  }

  for (const key of attrKeys) {
    const user_value = userProps?.[key]
    // Vue's rule for non-boolean attributes: only null / undefined remove, `false` renders as "false".
    // Like Vue's patchAttr, hand the raw value to setAttribute and let the DOM stringify it.
    if (user_value != null) el.setAttribute(key, user_value as string)
    else el.removeAttribute(key)
  }
}

/**
 * Parses any Vue `style` binding (string, object or array) into a detached `CSSStyleDeclaration`,
 * so values can be read back by kebab-case property name with their `!important` priority. Object
 * keys are converted to kebab-case, CSS variables are kept as-is, and `null` / `undefined` values
 * are skipped.
 *
 * @param style - A Vue `style` value, e.g. `vnode.props.style`.
 */
export function toDeclaration(style: StyleValue | undefined): CSSStyleDeclaration {
  const declaration = document.createElement("div").style
  const normalized = normalizeStyle(style)
  if (typeof normalized === "string") declaration.cssText = normalized
  else if (normalized) {
    for (const [key, value] of Object.entries(normalized)) {
      if (value != null) declaration.setProperty(key.startsWith("--") ? key : kebabCase(key), String(value))
    }
  }
  return declaration
}