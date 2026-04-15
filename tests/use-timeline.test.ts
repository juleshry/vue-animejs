import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useTimeline } from '@lib'
import { withSetup } from './utils'
import { makeTimelineMock } from './mocks'
import { createTimeline } from 'animejs'

const mock_createTimeline = vi.mocked(createTimeline)

const mock_timeline = makeTimelineMock()

vi.mock('animejs', () => ({
  createTimeline: vi.fn(() => mock_timeline),
}))

describe('useTimeline', () => {
  beforeEach(() => {
    mock_createTimeline.mockClear()
    Object.values(mock_timeline).forEach(fn => fn.mockClear())
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('creates timeline synchronously with provided options', () => {
    withSetup(() => useTimeline({ loop: true }))
    expect(mock_createTimeline).toHaveBeenCalledWith({ loop: true })
  })

  it('exposes the timeline instance', () => {
    const [result] = withSetup(() => useTimeline())
    expect(result.timeline.value).toBeDefined()
  })

  it('calls timeline.add directly when already mounted', () => {
    const el = document.createElement('div')
    const [result] = withSetup(() => useTimeline())
    // is_mounted = true after withSetup
    result.add(el, { opacity: 1 })
    expect(mock_timeline.add).toHaveBeenCalledWith(el, { opacity: 1 }, undefined)
  })

  it('flushes queued add calls after mount', () => {
    const el = document.createElement('div')
    mount(
      defineComponent({
        setup() {
          const tl = useTimeline()
          tl.add(el, { opacity: 1 }) // called during setup, before onMounted
          return () => h('div')
        },
      })
    )
    // onMounted has fired by the time mount() returns
    expect(mock_timeline.add).toHaveBeenCalledWith(el, { opacity: 1 }, undefined)
  })

  it('flushes queued set calls after mount', () => {
    const el = document.createElement('div')
    mount(
      defineComponent({
        setup() {
          const tl = useTimeline()
          tl.set(el, { opacity: 0 })
          return () => h('div')
        },
      })
    )
    expect(mock_timeline.set).toHaveBeenCalledWith(el, { opacity: 0 }, undefined)
  })

  it('warns when remove is called before mount', () => {
    const el = document.createElement('div')
    mount(
      defineComponent({
        setup() {
          const tl = useTimeline()
          tl.remove(el)
          return () => h('div')
        },
      })
    )
    expect(console.warn).toHaveBeenCalledWith('Cannot remove from timeline before mount')
  })

  it('unwraps ref targets when flushing the queue', () => {
    const el = document.createElement('div')
    const el_ref = ref(el)
    mount(
      defineComponent({
        setup() {
          const tl = useTimeline()
          tl.add(el_ref, { opacity: 1 })
          return () => h('div')
        },
      })
    )
    expect(mock_timeline.add).toHaveBeenCalledWith(el, { opacity: 1 }, undefined)
  })

  it('passes position to timeline.add', () => {
    const el = document.createElement('div')
    const [result] = withSetup(() => useTimeline())
    result.add(el, { opacity: 1 }, '+=500')
    expect(mock_timeline.add).toHaveBeenCalledWith(el, { opacity: 1 }, '+=500')
  })

  it('delegates play to the timeline instance', () => {
    const [result] = withSetup(() => useTimeline())
    result.play()
    expect(mock_timeline.play).toHaveBeenCalledOnce()
  })

  it('delegates pause to the timeline instance', () => {
    const [result] = withSetup(() => useTimeline())
    result.pause()
    expect(mock_timeline.pause).toHaveBeenCalledOnce()
  })

  it('delegates seek with args to the timeline instance', () => {
    const [result] = withSetup(() => useTimeline())
    result.seek(1000)
    expect(mock_timeline.seek).toHaveBeenCalledWith(1000, undefined, undefined)
  })

  it('cancels the timeline on unmount', () => {
    const [, wrapper] = withSetup(() => useTimeline())
    mock_timeline.cancel.mockClear()
    wrapper.unmount()
    expect(mock_timeline.cancel).toHaveBeenCalled()
  })

  it('recreates timeline when options ref changes', async () => {
    const options = ref({ loop: false })
    withSetup(() => useTimeline(options))
    mock_createTimeline.mockClear()
    options.value = { loop: true }
    await nextTick()
    expect(mock_createTimeline).toHaveBeenCalledWith({ loop: true })
  })
})
