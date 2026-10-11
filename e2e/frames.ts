import type { Page } from "@playwright/test"

/** What one element looked like on one animation frame, sampled right before the browser painted it. */
export interface Frame {
  /** Whether the client app had hydrated when the frame was sampled. */
  hydrated: boolean
  opacity: number
  /** Vertical translation from the computed `transform`, in px. */
  translateY: number
  visibility: string
  /** Visible dash length from `stroke-dasharray` (SVG drawables), `null` without the attribute. */
  dash: number | null
  /** Number of split chars / words / lines inside the element (`v-text-split`). */
  splitCount: number
}

declare global {
  interface Window {
    __FRAMES__: Frame[]
  }
}

/**
 * Samples `selector` on every animation frame from the very first one, before any app script runs,
 * so the frames cover the server-rendered paint, hydration, and the animation. Call before `goto`.
 */
export async function recordFrames(page: Page, selector: string): Promise<void> {
  await page.addInitScript(target => {
    const frames: Frame[] = []
    window.__FRAMES__ = frames

    function sample() {
      const el = document.querySelector(target)
      if (el) {
        const style = getComputedStyle(el)
        const dasharray = el.getAttribute("stroke-dasharray")
        frames.push({
          hydrated: "__HYDRATED__" in window,
          opacity: Number(style.opacity),
          translateY: style.transform === "none" ? 0 : new DOMMatrixReadOnly(style.transform).m42,
          visibility: style.visibility,
          dash: dasharray === null ? null : Number.parseFloat(dasharray),
          splitCount: el.querySelectorAll("[data-char],[data-word],[data-line]").length,
        })
      }
      if (frames.length < 2000) requestAnimationFrame(sample)
    }
    requestAnimationFrame(sample)
  }, selector)
}

/** The frames recorded since `recordFrames`. */
export function getFrames(page: Page): Promise<Frame[]> {
  return page.evaluate(() => window.__FRAMES__)
}

/** Whether each value is >= the previous one, within a small tolerance for float noise. */
export function isNonDecreasing(values: number[]): boolean {
  return values.every((value, i) => i === 0 || value >= values[i - 1] - 1e-6)
}