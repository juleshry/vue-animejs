import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick, ref } from 'vue'
import { useAnimate } from '@lib'
import { withSetup } from './utils'
import { makeAnimationMock } from './mocks'
import { animate } from 'animejs'

const mock_animate = vi.mocked(animate)

const mock_animation = makeAnimationMock()

vi.mock('animejs', () => ({
  animate: vi.fn(() => mock_animation),
}))

describe('useAnimate', () => {
  beforeEach(() => {
    mock_animate.mockClear()
    Object.values(mock_animation).forEach(fn => fn.mockClear())
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('creates animation immediately for a non-ref target', async () => {
    const el = document.createElement('div')
    const [result] = withSetup(() => useAnimate(el, { opacity: [0, 1] }))
    await nextTick()
    expect(mock_animate).toHaveBeenCalledWith(el, { opacity: [0, 1] })
    expect(result.animation.value).toBeDefined()
  })

  it('does not create animation immediately when target is a ref', async () => {
    const el_ref = ref<HTMLElement | null>(null)
    withSetup(() => useAnimate(el_ref))
    await nextTick()
    expect(mock_animate).not.toHaveBeenCalled()
  })

  it('warns and leaves animation undefined when target is null', async () => {
    const [result] = withSetup(() => useAnimate(null as any))
    await nextTick()
    expect(console.warn).toHaveBeenCalledWith('Target element is null or undefined')
    expect(result.animation.value).toBeUndefined()
  })

  it('control methods return undefined when animation is not set', () => {
    const el_ref = ref<HTMLElement | null>(null)
    const [result] = withSetup(() => useAnimate(el_ref))
    expect(result.play()).toBeUndefined()
    expect(result.pause()).toBeUndefined()
  })

  it('delegates play to the animation instance', async () => {
    const el = document.createElement('div')
    const [result] = withSetup(() => useAnimate(el))
    await nextTick()
    result.play()
    expect(mock_animation.play).toHaveBeenCalledOnce()
  })

  it('delegates pause to the animation instance', async () => {
    const el = document.createElement('div')
    const [result] = withSetup(() => useAnimate(el))
    await nextTick()
    result.pause()
    expect(mock_animation.pause).toHaveBeenCalledOnce()
  })

  it('delegates seek with args to the animation instance', async () => {
    const el = document.createElement('div')
    const [result] = withSetup(() => useAnimate(el))
    await nextTick()
    result.seek(500, true)
    expect(mock_animation.seek).toHaveBeenCalledWith(500, true, undefined)
  })

  it('cancels the animation on unmount', async () => {
    const el = document.createElement('div')
    const [, wrapper] = withSetup(() => useAnimate(el))
    await nextTick()
    mock_animation.cancel.mockClear()
    wrapper.unmount()
    expect(mock_animation.cancel).toHaveBeenCalled()
  })

  it('recreates animation when options ref changes', async () => {
    const el = document.createElement('div')
    const options = ref({ opacity: 0 })
    const [_] = withSetup(() => useAnimate(el, options))
    await nextTick()
    mock_animate.mockClear()
    options.value = { opacity: 1 }
    await nextTick()
    expect(mock_animate).toHaveBeenCalledWith(el, { opacity: 1 })
  })
})
