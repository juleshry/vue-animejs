import { test, expect, type Page } from "@playwright/test"
import { getFrames, isNonDecreasing, recordFrames } from "./frames.ts"

// Real SSR in a real browser: the fixture server renders each page, Chromium paints that HTML, then
// the client hydrates it. Frames are sampled from the first paint on, so a flash of the final state
// (or of unsplit text) shows up as a frame, not as a guess.

const TARGET = "[data-test=target]"

// How long the client script is held back, so the server HTML is always painted for a few frames
// before hydration instead of depending on how fast the modules load
const HYDRATION_DELAY = 300

interface PageLog {
  hydrationWarnings: string[]
  errors: string[]
}

/** Opens a fixture page, recording `selector` on every frame and collecting console problems. */
async function open(page: Page, name: string, selector = TARGET): Promise<PageLog> {
  const log: PageLog = { hydrationWarnings: [], errors: [] }
  page.on("console", message => {
    if (/hydrat/i.test(message.text())) log.hydrationWarnings.push(message.text())
    else if (message.type() === "error") log.errors.push(message.text())
  })
  page.on("pageerror", error => log.errors.push(error.message))

  await recordFrames(page, selector)
  await page.route("**/entry-client.ts", async route => {
    await new Promise(resolve => setTimeout(resolve, HYDRATION_DELAY))
    await route.continue()
  })
  await page.goto(`/${name}`)
  await page.waitForFunction(() => "__HYDRATED__" in window)
  return log
}

function computed(page: Page, property: string, selector = TARGET): Promise<string> {
  return page.locator(selector).evaluate((el, name) => getComputedStyle(el).getPropertyValue(name), property)
}

test.describe("server paint (JavaScript disabled)", () => {
  test.use({ javaScriptEnabled: false })

  for (const name of ["v-animate", "v-waapi", "anime-transition"]) {
    test(`${name} renders the animation's from state`, async ({ page }) => {
      await page.goto(`/${name}`)
      await expect.poll(() => computed(page, "opacity")).toBe("0")
      await expect.poll(() => computed(page, "transform")).toBe("matrix(1, 0, 0, 1, 0, 20)")
    })
  }

  test("v-animate lets its from state win over a conflicting :style", async ({ page }) => {
    await page.goto("/v-animate-user-style")
    await expect.poll(() => computed(page, "opacity")).toBe("0")
  })

  test("v-svg-drawable renders the path with nothing drawn", async ({ page }) => {
    await page.goto("/v-svg-drawable")
    const path = page.locator(TARGET)
    await expect(path).toHaveAttribute("pathLength", "1000")
    await expect(path).toHaveAttribute("stroke-dasharray", "0 1010")
    await expect.poll(() => computed(page, "stroke-linecap")).toBe("butt")
  })

  test("v-text-split with ssrHidden renders the text hidden", async ({ page }) => {
    await page.goto("/v-text-split")
    await expect.poll(() => computed(page, "visibility")).toBe("hidden")
    await expect.poll(() => computed(page, "visibility", "[data-test=lines]")).toBe("hidden")
  })
})

for (const name of ["v-animate", "v-waapi"]) {
  test.describe(name, () => {
    test("hydrates without warnings and never flashes the final state", async ({ page }) => {
      const log = await open(page, name)
      await expect.poll(() => computed(page, "opacity")).toBe("1")
      const frames = await getFrames(page)

      expect(log.hydrationWarnings).toEqual([])
      expect(log.errors).toEqual([])
      expect(
        frames.some(frame => !frame.hydrated),
        "a frame painted before hydration"
      ).toBe(true)
      for (const frame of frames.filter(frame => !frame.hydrated)) {
        expect(frame).toMatchObject({ opacity: 0, translateY: 20 })
      }
      expect(isNonDecreasing(frames.map(frame => frame.opacity))).toBe(true)
      expect(isNonDecreasing(frames.map(frame => -frame.translateY))).toBe(true)
      await expect(page.locator(TARGET)).not.toHaveAttribute("data-anime-ssr")
    })

    // The server style must be gone before the animation records the element's original style,
    // or reverting it on a binding change would leave the element stuck at opacity 0.
    test("leaves no server style behind after a binding change", async ({ page }) => {
      await open(page, name)
      await expect.poll(() => computed(page, "opacity")).toBe("1")
      await page.locator("[data-test=rebind]").click()

      await expect.poll(() => computed(page, "opacity")).toBe("1")
      expect(await page.locator(TARGET).evaluate(el => (el as HTMLElement).style.opacity)).toBe("")
    })
  })
}

// Vue's <Transition> never runs appear hooks on hydrated elements: AnimeTransition starts the enter itself
test.describe("anime-transition with appear", () => {
  test("hydrates without warnings and never flashes the final state", async ({ page }) => {
    const log = await open(page, "anime-transition")
    await expect.poll(() => computed(page, "opacity")).toBe("1")
    const frames = await getFrames(page)

    expect(log.hydrationWarnings).toEqual([])
    expect(log.errors).toEqual([])
    expect(
      frames.some(frame => !frame.hydrated),
      "a frame painted before hydration"
    ).toBe(true)
    for (const frame of frames.filter(frame => !frame.hydrated)) {
      expect(frame).toMatchObject({ opacity: 0, translateY: 20 })
    }
    expect(isNonDecreasing(frames.map(frame => frame.opacity))).toBe(true)
    expect(isNonDecreasing(frames.map(frame => -frame.translateY))).toBe(true)
    await expect(page.locator(TARGET)).not.toHaveAttribute("data-anime-ssr")
    expect(await computed(page, "color")).toBe("rgb(255, 0, 0)")
  })

  test("leaves and enters again after hydration", async ({ page }) => {
    await open(page, "anime-transition")
    await expect.poll(() => computed(page, "opacity")).toBe("1")

    await page.locator("[data-test=toggle]").click()
    await expect(page.locator(TARGET)).toHaveCount(0)
    await page.locator("[data-test=toggle]").click()
    await expect(page.locator(TARGET)).toHaveCount(1)
    await expect.poll(() => computed(page, "opacity")).toBe("1")
  })
})

test.describe("v-animate with a conflicting :style", () => {
  test("hydrates without warnings and restores the user's value after a binding change", async ({ page }) => {
    const log = await open(page, "v-animate-user-style")
    await expect.poll(() => computed(page, "opacity")).toBe("1")
    await page.locator("[data-test=rebind]").click()

    expect(log.hydrationWarnings).toEqual([])
    await expect.poll(() => computed(page, "opacity")).toBe("0.5")
  })
})

test.describe("v-svg-drawable", () => {
  test("hydrates without warnings and never shows the path drawn before its animation", async ({ page }) => {
    const log = await open(page, "v-svg-drawable")
    await expect.poll(async () => (await getFrames(page)).pop()?.dash).toBe(1000)
    const frames = await getFrames(page)

    expect(log.hydrationWarnings).toEqual([])
    expect(log.errors).toEqual([])
    expect(frames[0].dash).toBe(0)
    expect(isNonDecreasing(frames.map(frame => frame.dash ?? Number.NaN))).toBe(true)
    await expect(page.locator(TARGET)).not.toHaveAttribute("data-anime-ssr-attrs")
  })
})

test.describe("v-text-split with ssrHidden", () => {
  for (const [label, selector] of [
    ["words", TARGET],
    ["lines", "[data-test=lines]"],
  ]) {
    test(`never shows the unsplit text (${label})`, async ({ page }) => {
      const log = await open(page, "v-text-split", selector)
      await expect.poll(() => computed(page, "visibility", selector)).toBe("visible")
      const frames = await getFrames(page)

      expect(log.hydrationWarnings).toEqual([])
      expect(log.errors).toEqual([])
      expect(frames[0].visibility).toBe("hidden")
      expect(frames.filter(frame => frame.visibility === "visible" && frame.splitCount === 0)).toEqual([])
    })
  }
})

// Negative controls: prove the checks above would fail without the SSR handoff.
test.describe("controls", () => {
  test("a directive without a server state flashes its final state, and the flash check sees it", async ({ page }) => {
    await open(page, "control-no-ssr")
    await expect.poll(() => computed(page, "opacity")).toBe("1")
    const frames = await getFrames(page)

    expect(frames[0].opacity).toBe(1)
    expect(isNonDecreasing(frames.map(frame => frame.opacity))).toBe(false)
  })

  test("a server style without a created hook triggers a hydration warning, and the check sees it", async ({
    page,
  }) => {
    const log = await open(page, "control-no-created")
    expect(log.hydrationWarnings).not.toEqual([])
  })
})