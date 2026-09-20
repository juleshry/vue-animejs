<script setup lang="ts">
  import { useTemplateRef, ref, computed, watch } from "vue"
  import { useScroll, useTimeline } from "@lib"
  import SectionWrapper from "../../components/SectionWrapper.vue"

  const box1 = useTemplateRef("box1")
  const box2 = useTemplateRef("box2")
  const box3 = useTemplateRef("box3")

  const { add, play: playTimeline } = useTimeline({ autoplay: false })

  add(box1, { x: 250, rotate: "1turn", backgroundColor: "#dbdaff", duration: 2000 })
    .add(box2, { x: 250, y: 50, backgroundColor: "#9593ff", duration: 2000 }, "<<")
    .add(box3, { x: 100, y: -50, width: 50, height: 50, backgroundColor: "#d089ff", duration: 1000 }, "<<+20")

  const rBox1 = useTemplateRef("rBox1")
  const rBox2 = useTemplateRef("rBox2")
  const rBox3 = useTemplateRef("rBox3")

  const loop = ref(false)
  const alternate = ref(false)

  const reactiveOptions = computed(() => ({
    autoplay: false,
    loop: loop.value,
    alternate: alternate.value,
  }))

  const { add: rAdd, play, restart } = useTimeline(reactiveOptions)

  rAdd(rBox1, { translateX: 200, duration: 600, ease: "outExpo" })
    .add(rBox2, { translateX: 200, duration: 600, ease: "outExpo" }, "-=300")
    .add(rBox3, { translateX: 200, duration: 600, ease: "outExpo" }, "-=300")

  // Regression demo: a scroll-driven timeline. `options` can only be built once both the
  // scrollable container and its target box exist as real elements, so it resolves from a
  // placeholder to the real ScrollObserver-backed options right at mount — the same
  // template-ref-driven transition that used to trigger two independent createTimeline()
  // calls (one from the mount-time watch tick, one from the unconditional tryOnMounted
  // creation). The second call's revert() would cancel the first timeline's autoplay
  // ScrollObserver before it finished resolving, permanently breaking the scroll-linked
  // animation. `creationCount` should stay at 1.
  //
  // `scrollTarget` (not `scrollBox`) is what useScroll measures — it sits between the two
  // spacers exactly like the animated box used to, so the enter/leave thresholds and the sync
  // progress they produce are unchanged. `scrollBox`, the element actually being animated, is
  // `position: sticky` and pinned at the top of the container instead, so it's visible for the
  // whole scroll range rather than having to be chased into view.
  const scrollContainerEl = useTemplateRef("scrollContainer")
  const scrollTargetEl = useTemplateRef("scrollTarget")
  const scrollBoxEl = useTemplateRef("scrollBox")
  const creationCount = ref(0)

  const { autoplayComputed: scrollOptions } = useScroll(scrollContainerEl, scrollTargetEl, {
    enter: "bottom top",
    leave: "top bottom",
    sync: true,
  })

  const { timeline: scrollTimeline, add: addScroll } = useTimeline(scrollOptions)

  addScroll(scrollBoxEl, { translateX: 150, backgroundColor: "#9593ff", duration: 1000 })

  watch(scrollTimeline, instance => {
    if (instance) creationCount.value++
  })
</script>

<template>
  <SectionWrapper>
    <template #title>Timeline</template>
    <div class="timeline">
      <div ref="box1" class="box" />
      <div ref="box2" class="box" />
      <div ref="box3" class="box" />
    </div>
    <button @click="playTimeline">Start Timeline</button>
  </SectionWrapper>

  <SectionWrapper>
    <template #title>Reactive Timeline</template>

    <div class="boxes">
      <div ref="rBox1" class="box" />
      <div ref="rBox2" class="box" />
      <div ref="rBox3" class="box" />
    </div>

    <div class="controls">
      <label><input v-model="loop" type="checkbox" /> Loop</label>
      <label><input v-model="alternate" type="checkbox" /> Alternate</label>
    </div>

    <div class="controls">
      <button @click="play">Play</button>
      <button @click="restart">Restart</button>
    </div>
  </SectionWrapper>

  <SectionWrapper>
    <template #title>Scroll-driven timeline (regression)</template>
    <div ref="scrollContainer" class="scroll-container">
      <div ref="scrollBox" class="box scroll-box" />
      <div class="scroll-spacer" />
      <div ref="scrollTarget" class="scroll-target" />
      <div class="scroll-spacer" />
    </div>
    <span>Instance created: {{ creationCount }} time(s) — should stay 1</span>
  </SectionWrapper>
</template>

<style lang="postcss" scoped>
  .timeline {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .boxes {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .box {
    width: 20px;
    height: 20px;
    background-color: #ff3e00;
  }

  .scroll-container {
    height: 160px;
    overflow-y: auto;
    border: 1px solid #2a2a2a;
    padding: 8px 10px;
  }

  .scroll-box {
    position: sticky;
    top: 8px;
  }

  .scroll-spacer {
    height: 200px;
  }

  .scroll-target {
    height: 20px;
  }

  .controls {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  button,
  label {
    width: fit-content;
    cursor: pointer;
  }
</style>