import { describe, it, expect } from "vite-plus/test"
import { computed, defineComponent, h, nextTick, ref, useTemplateRef } from "vue"
import { mount } from "@vue/test-utils"
import { AnimeScroll, type AnimeScrollExposed, useAnimate } from "@lib"

// Real animejs: AnimeScroll passes no target, and relies on Anime.js taking it from the animation linked through
// `autoplay`, which a mock can't show

describe("AnimeScroll with real Anime.js", () => {
  it("observes the element of the animation it drives, inside its own root", async () => {
    const scroller = ref<AnimeScrollExposed>()
    const wrapper = mount(
      defineComponent(() => {
        const box = useTemplateRef<HTMLElement>("box")
        useAnimate(box, { translateX: 100, autoplay: computed(() => scroller.value?.autoplay ?? false) })
        return () =>
          h(AnimeScroll, { ref: scroller }, () => [
            h("div", { style: { height: "400px" } }),
            h("div", { ref: "box", id: "box" }),
          ])
      }),
      { attachTo: document.body }
    )
    await nextTick()
    await nextTick()

    const observer = scroller.value!.observer!
    expect(observer.container.element).toBe(wrapper.element)
    expect(observer.target).toBe(wrapper.find("#box").element)
    wrapper.unmount()
  })
})