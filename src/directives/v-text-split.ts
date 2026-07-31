import {
  animate,
  splitText,
  type AnimationParams,
  type JSAnimation,
  type TextSplitter,
  type TextSplitterParams,
} from "animejs"
import type { Directive } from "vue"

export interface VTextSplitValue extends TextSplitterParams {
  animation?: AnimationParams
}

interface Entry {
  splitter: TextSplitter
  animation: JSAnimation | undefined
}

const instances = new WeakMap<HTMLElement, Entry>()

function create(el: HTMLElement, value: VTextSplitValue | undefined): Entry {
  const { animation: anim_params, ...splitter_params } = value ?? {}
  const splitter = splitText(el, splitter_params)
  const entry: Entry = { splitter, animation: undefined }

  if (anim_params) {
    if (splitter_params.lines) {
      // Line detection waits for document.fonts.ready — defer animation until splitter.lines is populated.
      ;(document.fonts?.ready ?? Promise.resolve()).then(() => {
        if (instances.get(el) === entry) {
          entry.animation = animate(splitter.lines, anim_params)
        }
      })
    } else {
      const targets = splitter_params.chars ? splitter.chars : splitter.words
      entry.animation = animate(targets, anim_params)
    }
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
 * @example
 * <p v-text-split="{ words: true, animation: { translateY: [20, 0], opacity: [0, 1], delay: stagger(60) } }">Hello</p>
 * <p v-text-split="{ chars: true, animation: { opacity: [0, 1], delay: stagger(30) } }">Hello</p>
 * <p v-text-split="{ lines: true, animation: { translateX: [-20, 0], delay: stagger(100) } }">Hello</p>
 */
export const vTextSplit: Directive<HTMLElement, VTextSplitValue | undefined> = {
  mounted(el, binding) {
    instances.set(el, create(el, binding.value))
  },
  updated(el, binding) {
    if (binding.value === binding.oldValue) return
    const entry = instances.get(el)
    if (entry) destroy(entry)
    instances.set(el, create(el, binding.value))
  },
  unmounted(el) {
    const entry = instances.get(el)
    if (entry) destroy(entry)
    instances.delete(el)
  },
}