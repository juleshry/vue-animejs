import { describe, it, expect } from "vite-plus/test"
import { defineComponent, h, nextTick, ref } from "vue"
import { mount } from "@vue/test-utils"
import { animate, type JSAnimation } from "animejs"
import { AnimeScope, type AnimeScopeExposed } from "@lib"

// Real animejs: what AnimeScope is for is Anime.js resolving selectors against the scope's root, which a mock can't show

describe("AnimeScope with real Anime.js", () => {
  it("scopes selectors and defaults in its methods to its own root", async () => {
    const first = ref<AnimeScopeExposed>()
    let animation!: JSAnimation

    const wrapper = mount(
      defineComponent(() => () => [
        h(AnimeScope, { ref: first, options: { defaults: { duration: 1234 } } }, () =>
          h("div", { class: "box", id: "a" })
        ),
        h(AnimeScope, null, () => h("div", { class: "box", id: "b" })),
      ]),
      { attachTo: document.body }
    )
    await nextTick()

    first.value!.add(() => {
      animation = animate(".box", { opacity: [1, 0.5], autoplay: false })
    })

    const targets = animation.targets as HTMLElement[]
    expect(targets.map(el => el.id)).toEqual(["a"])
    expect(animation.duration).toBe(1234)
    wrapper.unmount()
  })
})