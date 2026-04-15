import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick, ref } from 'vue'
import { useText } from '@lib'
import { withSetup } from './utils'
import { makeTextSplitterMock } from './mocks'
import { splitText } from 'animejs'

const mock_splitText = vi.mocked(splitText)

const mock_splitter = makeTextSplitterMock()

vi.mock('animejs', () => ({
  splitText: vi.fn(() => mock_splitter),
}))

describe('useText', () => {
  beforeEach(() => {
    mock_splitText.mockClear()
    mock_splitter.revert.mockClear()
    mock_splitter.refresh.mockClear()
  })

  it('creates splitter immediately for a non-ref target', async () => {
    const el = document.createElement('p')
    el.textContent = 'Hello world'
    const [result] = withSetup(() => useText(el))
    await nextTick()
    expect(mock_splitText).toHaveBeenCalledWith(el, undefined)
    expect(result.splitter.value).toBeDefined()
  })

  it('does not create splitter immediately when target is a ref', async () => {
    const el_ref = ref<HTMLElement | null>(null)
    withSetup(() => useText(el_ref))
    await nextTick()
    expect(mock_splitText).not.toHaveBeenCalled()
  })

  it('passes params to splitText', async () => {
    const el = document.createElement('p')
    const params = { lines: true, words: true }
    withSetup(() => useText(el, params))
    await nextTick()
    expect(mock_splitText).toHaveBeenCalledWith(el, params)
  })

  it('lines computed ref reflects splitter.lines', async () => {
    const el = document.createElement('p')
    const [result] = withSetup(() => useText(el))
    await nextTick()
    expect(result.lines.value).toBe(mock_splitter.lines)
  })

  it('words computed ref reflects splitter.words', async () => {
    const el = document.createElement('p')
    const [result] = withSetup(() => useText(el))
    await nextTick()
    expect(result.words.value).toBe(mock_splitter.words)
  })

  it('chars computed ref reflects splitter.chars', async () => {
    const el = document.createElement('p')
    const [result] = withSetup(() => useText(el))
    await nextTick()
    expect(result.chars.value).toBe(mock_splitter.chars)
  })

  it('lines/words/chars are empty arrays before target resolves', () => {
    const el_ref = ref<HTMLElement | null>(null)
    const [result] = withSetup(() => useText(el_ref))
    expect(result.lines.value).toEqual([])
    expect(result.words.value).toEqual([])
    expect(result.chars.value).toEqual([])
  })

  it('delegates revert to the splitter instance', async () => {
    const el = document.createElement('p')
    const [result] = withSetup(() => useText(el))
    await nextTick()
    result.revert()
    expect(mock_splitter.revert).toHaveBeenCalledOnce()
  })

  it('delegates refresh to the splitter instance', async () => {
    const el = document.createElement('p')
    const [result] = withSetup(() => useText(el))
    await nextTick()
    result.refresh()
    expect(mock_splitter.refresh).toHaveBeenCalledOnce()
  })

  it('clears the splitter on unmount', async () => {
    const el = document.createElement('p')
    const [result, wrapper] = withSetup(() => useText(el))
    await nextTick()
    expect(result.splitter.value).toBeDefined()
    wrapper.unmount()
    expect(result.splitter.value).toBeUndefined()
  })
})
