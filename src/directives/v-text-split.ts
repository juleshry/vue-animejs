import {
  animate,
  splitText,
  type AnimationParams,
  type JSAnimation,
  type TextSplitter,
  type TextSplitterParams,
} from "animejs"
import type { Directive } from "vue"
import { stripSSRProps, toSSRProps } from "@src/utils/ssr-props.ts"

export interface VTextSplitValue extends TextSplitterParams {
  animation?: AnimationParams
  /**
   * SSR only: renders the element with `visibility: hidden` on the server, removed once the text is
   * split and the animation has painted its starting state, so the unsplit text doesn't flash before
   * hydration. Opt-in because the text stays invisible until JavaScript runs.
   */
  ssrHidden?: boolean
}

interface Entry {
  splitter: TextSplitter
  animation: JSAnimation | undefined
}

const instances = new WeakMap<HTMLElement, Entry>()

function create(el: HTMLElement, value: VTextSplitValue | undefined, userProps: Record<string, unknown> | null): Entry {
  const { animation: anim_params, ssrHidden: _ssr_hidden, ...splitter_params } = value ?? {}
  const splitter = splitText(el, splitter_params)
  const entry: Entry = { splitter, animation: undefined }

  if (anim_params) {
    if (splitter_params.lines) {
      // Line detection waits for document.fonts.ready — defer animation until splitter.lines is populated.
      ;(document.fonts?.ready ?? Promise.resolve()).then(() => {
        if (instances.get(el) === entry) {
          entry.animation = animate(splitter.lines, anim_params)
          stripSSRProps(el, userProps)
        }
      })
    } else {
      const targets = splitter_params.chars ? splitter.chars : splitter.words
      entry.animation = animate(targets, anim_params)
      stripSSRProps(el, userProps)
    }
  } else {
    stripSSRProps(el, userProps)
  }

  return entry
}

function destroy(entry: Entry) {
  entry.animation?.cancel()
  entry.splitter.revert()
}

/**
 * Declarative text-split directive. Splits the element's text into chars, words, or lines on
 * mount, and optionally animates the resulting spans. Re-creates on binding change, reverts on unmount.
 *
 * With `ssrHidden: true`, the element is hidden on the server until its text is split and animated
 * on the client (text can only be split in the browser).
 *
 * @example
 * <p v-text-split="{ words: true, animation: { translateY: [20, 0], opacity: [0, 1], delay: stagger(60) } }">Hello</p>
 * <p v-text-split="{ chars: true, animation: { opacity: [0, 1], delay: stagger(30) } }">Hello</p>
 * <p v-text-split="{ lines: true, animation: { translateX: [-20, 0], delay: stagger(100) } }">Hello</p>
 */
export const vTextSplit: Directive<HTMLElement, VTextSplitValue | undefined> = {
  getSSRProps(binding) {
    return binding.value?.ssrHidden ? toSSRProps({ style: { visibility: "hidden" } }) : {}
  },
  created() {
    // Intentionally empty: having a `created` hook makes Vue skip its hydration style-mismatch check
    // for this node (vuejs/core#11189). The server style is only removed in create(), once the text
    // is split and animated, so the unsplit text never shows.
  },
  mounted(el, binding, vnode) {
    instances.set(el, create(el, binding.value, vnode.props))
  },
  updated(el, binding, vnode) {
    if (binding.value === binding.oldValue) return
    const entry = instances.get(el)
    if (entry) destroy(entry)
    instances.set(el, create(el, binding.value, vnode.props))
  },
  unmounted(el) {
    const entry = instances.get(el)
    if (entry) destroy(entry)
    instances.delete(el)
  },
}